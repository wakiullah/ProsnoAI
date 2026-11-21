import { ExamPaperData, GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionData } from 'proshno-shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type AiProvider = 'gemini' | 'openrouter';

export function getActiveAiProvider(): AiProvider {
  if (typeof window === 'undefined') return 'gemini';
  return (localStorage.getItem('proshno_ai_provider') as AiProvider) || 'gemini';
}

export function setActiveAiProvider(provider: AiProvider): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('proshno_ai_provider', provider);
  }
}

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('proshno_gemini_api_key') || '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('proshno_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('proshno_gemini_api_key');
    }
  }
}

export function getStoredGeminiModel(): string {
  if (typeof window === 'undefined') return 'auto';
  return localStorage.getItem('proshno_gemini_model') || 'auto';
}

export function setStoredGeminiModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('proshno_gemini_model', model);
  }
}

export function getStoredOpenRouterKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('proshno_openrouter_api_key') || '';
}

export function setStoredOpenRouterKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('proshno_openrouter_api_key', key.trim());
    } else {
      localStorage.removeItem('proshno_openrouter_api_key');
    }
  }
}

export function getStoredOpenRouterModel(): string {
  if (typeof window === 'undefined') return 'openrouter/free';
  return localStorage.getItem('proshno_preferred_model') || 'openrouter/free';
}

export function setStoredOpenRouterModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('proshno_preferred_model', model);
  }
}

// Backwards-compatible aliases
export const getStoredApiKey = getStoredOpenRouterKey;
export const setStoredApiKey = setStoredOpenRouterKey;
export const getStoredPreferredModel = getStoredOpenRouterModel;
export const setStoredPreferredModel = setStoredOpenRouterModel;

export async function validateAiKey(
  provider: AiProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/ai/validate-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey }),
  });
  return res.json();
}

export async function generateAiQuestions(
  payload: GenerateQuestionsRequest & { provider?: AiProvider; preferredModel?: string }
): Promise<GenerateQuestionsResponse> {
  const provider = payload.provider || getActiveAiProvider();
  const geminiKey = getStoredGeminiKey();
  const openRouterKey = getStoredOpenRouterKey();

  const preferredModel =
    payload.preferredModel ||
    (provider === 'gemini' ? getStoredGeminiModel() : getStoredOpenRouterModel());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-ai-provider': provider,
  };

  if (provider === 'gemini' && geminiKey) {
    headers['x-gemini-key'] = geminiKey;
  } else if (provider === 'openrouter' && openRouterKey) {
    headers['x-openrouter-key'] = openRouterKey;
  }

  const res = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, provider, preferredModel }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate questions.');
  }
  return data;
}

export async function uploadPdfForRag(file: File): Promise<{ text: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/ai/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to parse PDF.');
  }
  return data;
}

export async function fetchQuestionBank(params?: Record<string, string>): Promise<QuestionData[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/questions${query}`);
  const data = await res.json();
  return data.questions || [];
}

export async function saveQuestionToBank(question: QuestionData | QuestionData[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
  return res.json();
}

export async function shufflePaperSets(questions: QuestionData[], setNames?: string[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/exam-papers/shuffle-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, setNames }),
  });
  const data = await res.json();
  return data.sets;
}

export async function fetchLiveHtmlPreview(
  paper: ExamPaperData,
  type: 'paper' | 'answer-key' | 'omr' = 'paper',
  setName?: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/pdf/preview-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper, type, setName }),
  });
  const data = await res.json();
  return data.html || '';
}

export async function downloadPdfDeliverable(
  endpoint: 'question-paper' | 'answer-key' | 'omr-sheet',
  paper: ExamPaperData,
  setName?: string,
  totalMcqs?: number,
  html?: string
): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/pdf/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper, setName, totalMcqs, html }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to download ${endpoint} PDF.`);
  }

  return res.blob();
}
