import { Request, Response } from 'express';
import { GenerateQuestionsRequest } from 'proshno-shared';
import { generateQuestionsWithFallback, validateOpenRouterKey } from '../services/aiService';
import { generateQuestionsWithGemini, validateGeminiKey } from '../services/geminiService';
import { extractTextFromPdf } from '../services/pdfParseService';

export async function handleGenerateQuestions(req: Request, res: Response) {
  try {
    const payload = req.body as GenerateQuestionsRequest & {
      provider?: 'gemini' | 'openrouter';
      apiKey?: string;
      preferredModel?: string;
    };

    const provider =
      (req.headers['x-ai-provider'] as 'gemini' | 'openrouter') ||
      payload.provider ||
      (req.headers['x-gemini-key'] ? 'gemini' : 'openrouter');

    const customKey =
      provider === 'gemini'
        ? (req.headers['x-gemini-key'] as string) || payload.apiKey || process.env.GEMINI_API_KEY
        : (req.headers['x-openrouter-key'] as string) || payload.apiKey || process.env.OPENROUTER_API_KEY;

    if (!payload.subject || !payload.grade || !payload.typology) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, grade, and typology are mandatory.',
      });
    }

    let result;
    if (provider === 'gemini') {
      result = await generateQuestionsWithGemini(payload, customKey);
    } else {
      result = await generateQuestionsWithFallback(payload, customKey);
    }

    if (!result.success) {
      return res.status(502).json(result);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error generating questions:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while generating questions.',
    });
  }
}

export async function handleValidateKey(req: Request, res: Response) {
  try {
    const { apiKey, provider = 'gemini' } = req.body as {
      apiKey?: string;
      provider?: 'gemini' | 'openrouter';
    };

    const keyToTest =
      apiKey ||
      (provider === 'gemini'
        ? (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY
        : (req.headers['x-openrouter-key'] as string) || process.env.OPENROUTER_API_KEY);

    if (!keyToTest) {
      return res.status(400).json({ valid: false, error: 'কোনো API Key প্রদান করা হয়নি।' });
    }

    const result =
      provider === 'gemini'
        ? await validateGeminiKey(keyToTest)
        : await validateOpenRouterKey(keyToTest);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err.message });
  }
}

export async function handleUploadPdf(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
    }

    const text = await extractTextFromPdf(req.file.buffer);

    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      extractedTextLength: text.length,
      text,
    });
  } catch (err: any) {
    console.error('Error extracting PDF:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to extract text from PDF.',
    });
  }
}
