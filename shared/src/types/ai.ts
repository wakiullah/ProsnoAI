import {
  EducationStream,
  HarakatMode,
  QuestionData,
  QuestionDifficulty,
  QuestionTypology,
  SupportedLanguage,
} from './question';

export interface GenerateQuestionsRequest {
  mode: 'prompt' | 'document';
  subject: string;
  grade: string;
  chapter?: string;
  topic?: string;
  typology: QuestionTypology;
  educationStream?: EducationStream;
  harakatMode?: HarakatMode;
  count: number;
  difficulty: QuestionDifficulty;
  languages: SupportedLanguage[];
  additionalPrompt?: string;
  documentText?: string; // Extracted text when in PDF/Document RAG mode
}

export interface GenerateQuestionsResponse {
  success: boolean;
  modelUsed: string;
  questions: QuestionData[];
  rawOutput?: string;
  error?: string;
}

export interface OpenRouterModelConfig {
  id: string;
  name: string;
  contextLength?: number;
  freeTier: boolean;
}
