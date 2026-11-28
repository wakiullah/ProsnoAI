export type EducationStream = 'GENERAL' | 'ALIA' | 'QAWMI' | 'NOORANI';

export type QuestionTypology =
  | 'SIMPLE_MCQ'
  | 'MULTIPLE_COMPLETION_MCQ'
  | 'PASSAGE_GROUP'
  | 'CQ'
  | 'FILL_BLANKS'
  | 'MATCHING'
  | 'DESCRIPTIVE'
  | 'TARJAMA_TASHREEH'
  | 'TAHQEEQ_SIGHA'
  | 'TARKIB_IRAB'
  | 'HURUF_TAJWEED'
  | 'MULTI_PART'
  | 'QAWAID_MISAL'
  | 'QAWMI_CQ'
  | 'TRUE_FALSE'
  | 'DIALOGUE'
  | 'PARAGRAPH_WRITING'
  | 'POETRY_EXPLANATION'
  | 'GROUP_TITLE'
  | 'SECTION_TITLE'
  | 'SPACER'
  | 'PASSAGE_ONLY'
  | 'PASSAGE_QA';

export type HarakatMode = 'WITH_HARAKAT' | 'WITHOUT_HARAKAT';
export type SupportedLanguage = 'bn' | 'en' | 'ar' | 'ur';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionSourceType = 'AI' | 'PDF' | 'MANUAL';

export interface McqOption {
  label: string; // e.g. "ক", "খ", "গ", "ঘ" or "a", "b", "c", "d"
  text: string;
  isCorrect?: boolean;
}

export type BloomLevel = 'knowledge' | 'comprehension' | 'application' | 'higher_order';

export interface CqSubQuestion {
  part: 'ক' | 'খ' | 'গ' | 'ঘ' | 'a' | 'b' | 'c' | 'd';
  bloomLevel: BloomLevel;
  bloomTitle: string; // "জ্ঞানমূলক", "অনুধাবনমূলক", "প্রয়োগমূলক", "উচ্চতর দক্ষতা"
  questionText: string;
  marks: number; // typically 1, 2, 3, 4
  sampleAnswer?: string;
}

export interface PassageLinkedQuestion {
  id?: string;
  order: number;
  questionText: string;
  typology: 'SIMPLE_MCQ' | 'MULTIPLE_COMPLETION_MCQ' | 'DESCRIPTIVE';
  statements?: string[]; // for multiple completion
  options?: McqOption[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
}

export interface MatchingColumns {
  colA: string[]; // List of items in Column A
  colB: string[]; // List of items in Column B
  colC?: string[]; // Optional Column C (for 3-column madrasah/english matching)
  correctPairs?: Array<{
    a: number; // 0-indexed reference to colA item
    b: number; // 0-indexed reference to colB item
    c?: number; // 0-indexed reference to colC item
    fullSentence?: string; // formed correct combined sentence
  }>;
}

export interface TahqeeqWordEntry {
  lafz: string; // The Arabic word to analyze
  sigha?: string; // সিগাহ (e.g. ওয়াহেদ মুজাক্কার গায়েব)
  bahas?: string; // বাহাস (e.g. ইসবাত ফে'লে মাযী মারূফ)
  baab?: string; // বাব (e.g. নাসারা ইয়ানসুরু)
  maddah?: string; // মাদ্দা / মূল হরফ (e.g. ن - ص - ر)
  meaning?: string; // অর্থ (Meaning in Bengali)
}

export interface WritingBoxConfig {
  type: 'row' | 'grid'; // horizontal box row or 2D table grid
  count?: number; // number of boxes in a row (e.g. 4, 6, 10)
  rows?: number; // number of table rows (e.g. 3, 5)
  cols?: number; // number of table columns (e.g. 5, 7)
  cells?: string[][]; // pre-filled characters or symbols (e.g. [['ك', '', 'ث', '', 'ب'], ...])
}

export interface StimulusImageConfig {
  url: string; // Base64 Data URL or image URL
  widthPct?: number; // 25–100 (default 60)
  caption?: string; // e.g. "চিত্র: ১"
}

export interface StimulusTableConfig {
  headers?: string[];
  rows: string[][];
}

export interface QuestionData {
  _id?: string;
  userId?: string;
  subject: string;
  grade: string; // e.g., 'Class 6', 'SSC', 'HSC', 'Dakhil', 'Alim', 'Mishkat', 'Dawra'
  chapter?: string;
  topic?: string;
  typology: QuestionTypology;
  educationStream?: EducationStream;
  harakatMode?: HarakatMode;
  sectionId?: string; // Optional reference to ExamSection
  
  // Stimulus or primary question text
  stemOrPassage?: string;

  // Optional stimulus diagram/image & data table (Math, Physics, Chemistry, BGS, etc.)
  stimulusImage?: StimulusImageConfig;
  stimulusTable?: StimulusTableConfig;
  
  // For MULTIPLE_COMPLETION_MCQ (i, ii, iii)
  statements?: string[];
  
  // For SIMPLE_MCQ & MULTIPLE_COMPLETION_MCQ
  options?: McqOption[];
  
  // For CQ (ক, খ, গ, ঘ)
  subQuestions?: CqSubQuestion[];
  
  // For PASSAGE_GROUP (linked questions)
  passageQuestions?: PassageLinkedQuestion[];
  
  // For MATCHING
  matchingColumns?: MatchingColumns;
  
  // For FILL_BLANKS
  hasClues?: boolean;
  wordClues?: string[]; // Clue word box

  // For TAHQEEQ_SIGHA (Madrasah Morphological Analysis)
  tahqeeqWords?: TahqeeqWordEntry[];

  // For Noorani & Primary writing worksheets (in-paper answer ruled/dotted lines)
  answerSpaceLines?: number; // 0 for none, 2, 4, 6 etc.

  // For Noorani / Primary handwriting boxes & Arabic letter grids
  writingBoxes?: WritingBoxConfig;
  
  // Universal answer & explanation
  correctAnswer?: string | string[];
  explanation?: string;

  // Micro-spacing adjustment (px nudges: top and bottom margin/padding)
  spacingTop?: number;
  spacingBottom?: number;

  // Custom Editable Number & Marks (e.g. "١.", "(أ)", "১.", and "٢×٤= ٨", "[১০]")
  customNumber?: string;
  customMarksText?: string;
  pageBreakBefore?: boolean;
  keepTogether?: boolean; // When true, keep entire question together on next column/page even if smart split is enabled

  // Structured Builder Group Tracking (e.g. Nasrul Madroos in-place update without duplication)
  groupId?: string;
  groupRole?: string;
  
  marks: number;
  difficulty: QuestionDifficulty;
  languages: SupportedLanguage[];
  sourceType: QuestionSourceType;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
