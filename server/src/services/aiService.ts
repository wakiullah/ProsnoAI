import { GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionData } from 'proshno-shared';
import { getOpenRouterClient, OPENROUTER_FREE_MODELS } from '../config/openrouter';
import { buildSystemPrompt, buildUserPrompt } from './aiPromptTemplates';

/**
 * Clean and parse JSON from LLM output, extracting from markdown blocks if present.
 * Handles both top-level objects `{ ... }` and top-level arrays `[ ... ]`.
 */
function extractAndParseJson(raw: string): any {
  let cleaned = raw.trim();

  // Strip markdown code fences if LLM wrapped output in ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Find the outermost JSON container — either an object or an array.
  // Pick whichever valid opener appears first in the string.
  const firstCurly = cleaned.indexOf('{');
  const firstSquare = cleaned.indexOf('[');

  let start = -1;
  let end = -1;

  if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
    // Object container
    start = firstCurly;
    end = cleaned.lastIndexOf('}');
  } else if (firstSquare !== -1) {
    // Array container
    start = firstSquare;
    end = cleaned.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Normalizes generated questions to ensure valid defaults and structure.
 */
function normalizeQuestions(rawList: any[], req: GenerateQuestionsRequest): QuestionData[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((q, idx) => {
    let defaultMarks = 1;
    if (req.typology === 'CQ' || req.typology === 'TARJAMA_TASHREEH') defaultMarks = 10;
    else if (req.typology === 'MULTI_PART' || req.typology === 'QAWMI_CQ') defaultMarks = 16;
    else if (req.typology === 'QAWAID_MISAL') defaultMarks = 10;
    else if (req.typology === 'FILL_BLANKS' || req.typology === 'MATCHING' || req.typology === 'TAHQEEQ_SIGHA' || req.typology === 'TARKIB_IRAB' || req.typology === 'HURUF_TAJWEED') defaultMarks = 5;
    else if (req.typology === 'DESCRIPTIVE') defaultMarks = 2;

    return {
      subject: q.subject || req.subject,
      grade: q.grade || req.grade,
      chapter: q.chapter || req.chapter || '',
      topic: q.topic || req.topic || '',
      typology: q.typology || req.typology,
      educationStream: q.educationStream || req.educationStream || 'GENERAL',
      harakatMode: q.harakatMode || req.harakatMode || 'WITH_HARAKAT',
      stemOrPassage: q.stemOrPassage || '',
      statements: Array.isArray(q.statements) ? q.statements : [],
      options: Array.isArray(q.options)
        ? q.options.map((opt: any, optIdx: number) => ({
            label: opt.label || ['ক', 'খ', 'গ', 'ঘ'][optIdx] || `${optIdx + 1}`,
            text: opt.text || '',
            isCorrect: Boolean(opt.isCorrect),
          }))
        : undefined,
      subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions : undefined,
      passageQuestions: Array.isArray(q.passageQuestions) ? q.passageQuestions : undefined,
      matchingColumns: q.matchingColumns || undefined,
      tahqeeqWords: Array.isArray(q.tahqeeqWords) ? q.tahqeeqWords : undefined,
      answerSpaceLines:
        typeof q.answerSpaceLines === 'number'
          ? q.answerSpaceLines
          : req.educationStream === 'NOORANI' || req.typology === 'HURUF_TAJWEED'
          ? 4
          : 0,
      hasClues: Boolean(q.hasClues),
      wordClues: Array.isArray(q.wordClues) ? q.wordClues : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      marks: typeof q.marks === 'number' ? q.marks : defaultMarks,
      difficulty: q.difficulty || req.difficulty,
      languages: q.languages || req.languages,
      sourceType: req.mode === 'document' ? 'PDF' : 'AI',
      tags: [req.subject, req.grade, req.typology, req.educationStream || 'GENERAL'],
    };
  });
}

/**
 * Generate questions via OpenRouter with automatic fallback across free-tier models.
 */
export async function generateQuestionsWithFallback(
  req: GenerateQuestionsRequest & { preferredModel?: string },
  apiKey?: string
): Promise<GenerateQuestionsResponse> {
  const client = getOpenRouterClient(apiKey);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(req);

  const availableModels = await import('../config/openrouter').then((m) => m.getActiveFreeModels());
  const modelsToTry = req.preferredModel
    ? [req.preferredModel, ...availableModels.filter((m) => m !== req.preferredModel)]
    : availableModels;

  const errors: Array<{ model: string; error: string }> = [];

  for (const model of modelsToTry) {
    try {
      console.log(`[ProshnoAI] Calling OpenRouter model: ${model}...`);

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 4000,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('Received empty response from model.');
      }

      const parsed = extractAndParseJson(responseContent);

      // Support both { questions: [...] } wrapper and bare [...] array responses
      const rawQuestions = parsed.questions
        ? parsed.questions
        : Array.isArray(parsed)
        ? parsed
        : [parsed];

      const normalized = normalizeQuestions(rawQuestions, req);

      if (normalized.length === 0) {
        throw new Error('Model produced 0 valid questions.');
      }

      console.log(`[ProshnoAI] Successfully generated ${normalized.length} questions using ${model}`);

      return {
        success: true,
        modelUsed: model,
        questions: normalized,
        rawOutput: responseContent,
      };
    } catch (err: any) {
      console.warn(`[ProshnoAI Fallback] Model ${model} failed: ${err.message}`);
      errors.push({ model, error: err.message });
      // Proceed to the next model in the fallback chain
    }
  }

  // If all free models failed (e.g. invalid API key or offline network),
  // return a descriptive error detailing what models were attempted.
  const errorSummary = errors.map((e) => `${e.model}: ${e.error}`).join(' | ');
  return {
    success: false,
    modelUsed: 'none',
    questions: [],
    error: `All OpenRouter fallback models failed. Details: ${errorSummary}`,
  };
}

/**
 * Validate an OpenRouter API key by performing an auth/key query.
 */
export async function validateOpenRouterKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (res.ok) {
      return { valid: true };
    }

    const data = await res.json().catch(() => ({}));
    return {
      valid: false,
      error: data.error?.message || `অকার্যকর OpenRouter API Key (HTTP ${res.status})`,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'OpenRouter সার্ভারের সাথে সংযোগ করা যায়নি।' };
  }
}
