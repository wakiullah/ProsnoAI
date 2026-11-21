import { GoogleGenAI, ApiError } from '@google/genai';
import { GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionData } from 'proshno-shared';
import { buildSystemPrompt, buildUserPrompt } from './aiPromptTemplates';

/**
 * Smart Routing Model Tiers
 * - Tier 1: gemma-4-31b-it (Default for short/medium text, 14,400 RPD, 30 RPM, 16K TPM)
 * - Tier 2: gemini-3.5-flash-lite (Large inputs or Tier 1 fallback, 500 RPD, 15 RPM, 250K TPM)
 * - Tier 3: gemini-3.1-flash-lite (Secondary fallback, 500 RPD, 15 RPM, 250K TPM)
 * - Tier 4: gemini-3.8-flash (Final emergency fallback for complex/analytical queries, 20 RPD, 5 RPM, 250K TPM)
 */
export const TIER_1_MODEL = 'gemma-4-31b-it';
export const TIER_2_MODEL = 'gemini-3.5-flash-lite';
export const TIER_3_MODEL = 'gemini-3.1-flash-lite';
export const TIER_4_MODEL = 'gemini-3.8-flash';

export const ALL_TIERS = [
  TIER_1_MODEL,
  TIER_2_MODEL,
  TIER_3_MODEL,
  TIER_4_MODEL,
] as const;

export type SupportedGeminiModel = (typeof ALL_TIERS)[number];

// Input threshold: 8,000 characters (~2,000–2,500 tokens)
export const INPUT_CHAR_THRESHOLD = 8000;

/**
 * Evaluates input size and determines the fallback chain to execute.
 * Skips Tier 1 (gemma-4-31b-it) if input exceeds threshold or contains uploaded documents,
 * preventing 16,000 TPM limit breaches.
 */
export function evaluateRoutingChain(
  req: GenerateQuestionsRequest & { preferredModel?: string },
  userPromptLength: number
): { chain: SupportedGeminiModel[]; skippedTier1: boolean; skipReason?: string } {
  // If user explicitly chose a specific model
  if (
    req.preferredModel &&
    req.preferredModel !== 'auto' &&
    ALL_TIERS.includes(req.preferredModel as any)
  ) {
    const preferred = req.preferredModel as SupportedGeminiModel;
    const remaining = ALL_TIERS.filter((m) => m !== preferred);
    return { chain: [preferred, ...remaining], skippedTier1: false };
  }

  const docLength = req.documentText ? req.documentText.length : 0;
  const isLargeDocument = req.mode === 'document' || docLength > 4000;
  const isLargeInput = userPromptLength > INPUT_CHAR_THRESHOLD || docLength > INPUT_CHAR_THRESHOLD;

  if (isLargeDocument || isLargeInput) {
    const reason = isLargeDocument
      ? `Uploaded document/PDF mode active (${docLength} characters)`
      : `Input text length (${userPromptLength} characters) exceeds ${INPUT_CHAR_THRESHOLD} threshold`;

    return {
      chain: [TIER_2_MODEL, TIER_3_MODEL, TIER_4_MODEL],
      skippedTier1: true,
      skipReason: reason,
    };
  }

  return {
    chain: [TIER_1_MODEL, TIER_2_MODEL, TIER_3_MODEL, TIER_4_MODEL],
    skippedTier1: false,
  };
}

/**
 * Checks whether an error is non-retryable (e.g. invalid API key or 400 Bad Request)
 * to fail fast without burning other tiers.
 */
function isNonRetryableFatalError(err: any): { isFatal: boolean; status?: number } {
  const status = err?.status || err?.statusCode || (err instanceof ApiError ? err.status : undefined);
  const message = (err?.message || '').toLowerCase();

  // Token limits, context overflow, TPM/RPM rate limits are retryable with larger/fallback models
  if (
    message.includes('token') ||
    message.includes('tpm') ||
    message.includes('context length') ||
    message.includes('maximum context') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    status === 429
  ) {
    return { isFatal: false, status };
  }

  // Invalid key or missing permissions -> fatal, fail fast
  if (
    status === 400 &&
    (message.includes('api key not valid') ||
      message.includes('api_key_invalid') ||
      message.includes('invalid api key'))
  ) {
    return { isFatal: true, status };
  }

  if (status === 401 || status === 403) {
    return { isFatal: true, status };
  }

  return { isFatal: false, status };
}

/**
 * Formats error reason for logging (e.g. 'HTTP 429', 'HTTP 503', 'Overloaded', 'Token limit exceeded').
 */
function getErrorReason(err: any): string {
  const status = err?.status || err?.statusCode;
  const message = err?.message || 'Unknown error';

  if (status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return 'HTTP 429 (Rate Limit / Quota Exceeded)';
  }
  if (status === 503 || message.includes('503') || message.includes('UNAVAILABLE')) {
    return 'HTTP 503 (Service Unavailable / Overloaded)';
  }
  if (status === 500 || message.includes('500') || message.includes('INTERNAL')) {
    return 'HTTP 500 (Internal Server Error)';
  }
  if (message.includes('token') || message.includes('context length')) {
    return 'Token / Context Limit Exceeded';
  }
  if (message.includes('JSON')) {
    return 'JSON Output Parsing Failure';
  }
  return status ? `HTTP ${status}` : message.slice(0, 60);
}

/**
 * Invokes an individual model via @google/genai SDK.
 * Gemma models receive system instructions inline inside the prompt, while Gemini Flash models
 * leverage native systemInstruction and responseMimeType: 'application/json'.
 */
async function callModel(
  ai: GoogleGenAI,
  model: SupportedGeminiModel,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const isGemma = model === TIER_1_MODEL;

  if (isGemma) {
    const combinedPrompt = `${systemPrompt}\n\nCRITICAL INSTRUCTION: Output your entire response as valid, parseable JSON matching the requested schema. Do NOT wrap in markdown backticks or add introductory commentary.\n\n${userPrompt}`;

    const response = await ai.models.generateContent({
      model,
      contents: combinedPrompt,
      config: {
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error(`Model ${model} returned an empty response.`);
    }
    return text;
  }

  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.35,
    },
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new Error(`Model ${model} returned an empty response.`);
  }
  return text;
}

/**
 * Clean and parse JSON from LLM output, extracting from markdown blocks if present.
 */
function extractAndParseJson(raw: string): any {
  let cleaned = raw.trim();

  // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // Extract from internal markdown fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    if (lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    if (lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  return JSON.parse(cleaned);
}

/**
 * Normalizes generated questions to ensure valid defaults and structure matching QuestionData.
 */
function normalizeQuestions(rawList: any[], req: GenerateQuestionsRequest): QuestionData[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((q) => {
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
 * Smart Model Routing & Automatic Fallback Question Generation Service.
 */
export async function generateQuestionsWithGemini(
  req: GenerateQuestionsRequest & { preferredModel?: string },
  customApiKey?: string
): Promise<GenerateQuestionsResponse> {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    return {
      success: false,
      modelUsed: 'gemini',
      questions: [],
      error: 'Google Gemini API Key পাওয়া যায়নি। অনুগ্রহ করে সেটিংসে Gemini API Key বসান।',
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(req);

  // 1. Evaluate input size & determine fallback chain
  const { chain, skippedTier1, skipReason } = evaluateRoutingChain(req, userPrompt.length);

  console.log(
    `[AI Router] Evaluating input size: ${userPrompt.length} chars (mode: ${req.mode}, doc: ${req.documentText?.length || 0} chars)`
  );
  if (skippedTier1) {
    console.log(
      `[AI Router] Skipping ${TIER_1_MODEL}: ${skipReason}. Starting directly from Tier 2 (${TIER_2_MODEL}).`
    );
  } else {
    console.log(`[AI Router] Starting standard fallback chain: ${chain.join(' -> ')}`);
  }

  const errors: Array<{ model: string; reason: string; error: string }> = [];

  // 2. Sequential fallback loop
  for (let i = 0; i < chain.length; i++) {
    const currentModel = chain[i];
    const nextModel = chain[i + 1];

    try {
      console.log(`[AI Router] Attempting generation with model: ${currentModel}...`);
      const rawText = await callModel(ai, currentModel, systemPrompt, userPrompt);

      const parsed = extractAndParseJson(rawText);
      const rawQuestions = parsed.questions || (Array.isArray(parsed) ? parsed : [parsed]);
      const normalized = normalizeQuestions(rawQuestions, req);

      if (normalized.length === 0) {
        throw new Error('Produced 0 valid questions.');
      }

      console.log(
        `[AI Router] Model ${currentModel} successfully handled the request. Generated ${normalized.length} questions.`
      );

      return {
        success: true,
        modelUsed: `google/${currentModel}`,
        questions: normalized,
        rawOutput: rawText,
      };
    } catch (err: any) {
      const reason = getErrorReason(err);
      const { isFatal, status } = isNonRetryableFatalError(err);

      if (isFatal) {
        console.error(
          `[AI Router] Fatal error encountered on ${currentModel} (HTTP ${status || 400}): ${err.message}. Halting fallback chain.`
        );
        return {
          success: false,
          modelUsed: `google/${currentModel}`,
          questions: [],
          error: `API Key বা ক্লায়েন্ট রিকোয়েস্ট ত্রুটি: ${err.message}`,
        };
      }

      errors.push({ model: currentModel, reason, error: err.message });

      if (nextModel) {
        console.warn(
          `[AI Router] Falling back from ${currentModel} to ${nextModel} due to ${reason}: ${err.message}`
        );
      } else {
        console.error(`[AI Router] Exhausted all fallback models in chain (${chain.join(' -> ')}).`);
      }
    }
  }

  const errorSummary = errors.map((e) => `${e.model} [${e.reason}]`).join(' | ');
  return {
    success: false,
    modelUsed: 'gemini-fallback-chain',
    questions: [],
    error: `সকল এআই মডেল কল ব্যর্থ হয়েছে: ${errorSummary}`,
  };
}

/**
 * Validate a Google Gemini API key using the @google/genai SDK models.list endpoint.
 */
export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { valid: false, error: 'কোনো API Key প্রদান করা হয়নি।' };
    }

    const ai = new GoogleGenAI({ apiKey: cleanKey });
    await ai.models.list();
    return { valid: true };
  } catch (err: any) {
    let errMsg = err.message || 'অকার্যকর Gemini API Key';
    try {
      const parsed = JSON.parse(errMsg);
      if (parsed.error?.message) {
        errMsg = parsed.error.message;
      }
    } catch {}

    return {
      valid: false,
      error: errMsg,
    };
  }
}
