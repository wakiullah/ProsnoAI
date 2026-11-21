import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Live, verified active free models on OpenRouter (including auto-router)
export const OPENROUTER_FREE_MODELS = [
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'baidu/ernie-5.5-flash-preview:free',
] as const;

let dynamicFreeModelsCache: string[] = [...OPENROUTER_FREE_MODELS];
let lastCacheTime = 0;

/**
 * Dynamically queries OpenRouter for all models that currently have free pricing.
 * Falls back to static list if offline or API error.
 */
export async function getActiveFreeModels(): Promise<string[]> {
  const now = Date.now();
  // Cache for 1 hour
  if (dynamicFreeModelsCache.length > 0 && now - lastCacheTime < 3600 * 1000) {
    return dynamicFreeModelsCache;
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && Array.isArray(data.data)) {
      const freeList = data.data
        .filter(
          (m: any) =>
            m.id === 'openrouter/free' ||
            m.id.endsWith(':free') ||
            (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0')
        )
        .map((m: any) => m.id as string);

      if (freeList.length > 0) {
        // Ensure openrouter/free and google/gemma models are priority
        const prioritized = [
          'openrouter/free',
          ...freeList.filter((id: string) => id !== 'openrouter/free'),
        ];
        dynamicFreeModelsCache = prioritized;
        lastCacheTime = now;
        return dynamicFreeModelsCache;
      }
    }
  } catch (err: any) {
    console.warn(`[OpenRouter] Could not dynamically refresh free model list: ${err.message}. Using built-in fallback.`);
  }

  return [...OPENROUTER_FREE_MODELS];
}

export function getOpenRouterClient(customApiKey?: string): OpenAI {
  const apiKey = customApiKey || process.env.OPENROUTER_API_KEY || '';

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'https://proshnoai.local',
      'X-Title': 'ProshnoAI Bangladeshi Exam Generator',
    },
  });
}
