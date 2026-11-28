import { EducationStream, QuestionData } from './question';

export type HeaderPreset = 'NCTB' | 'ALIA' | 'QAWMI' | 'NOORANI' | 'NOORANI_GRID';

export interface InstitutionHeaderConfig {
  institutionName: string;
  institutionAddress?: string;
  logoUrl?: string;
  examTitle: string; // e.g., "Half-Yearly Examination 2026", "মারহালা পরীক্ষা"
  subject: string;
  subjectCode?: string;
  grade?: string; // e.g., "Class X", "HSC Batch 2026", "দাখিল"
  timeAllowed: string; // e.g., "2 Hours 30 Minutes" or "২ ঘণ্টা ৩০ মিনিট"
  totalMarks: number;
  generalInstructions?: string[]; // e.g. ["সকল প্রশ্নের মান সমান", "ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক"]

  // Madrasah & Qawmi Header Preset enhancements
  headerPreset?: HeaderPreset;
  educationStream?: EducationStream;
  bismillahText?: string; // e.g. "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  jamat?: string; // e.g. "মিশকাত", "হেদায়েতুল ফিকহ", "মারহালা সানাবিয়া"
  kitab?: string; // e.g. "শরহে বেকায়া", "নূরুল ঈযাহ"

  // Noorani Board & Handwriting Worksheet enhancements
  nooraniBoardTitle?: string; // e.g. "ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ"
  handwritingMarks?: number; // e.g. 6 (সুন্দর ও নির্ভুল হাতের লেখার জন্য- ৬ নম্বর)
  showScoreRubricTable?: boolean; // Top-right marks evaluation table (পূর্ণমান = ১০০)

  // Choice rule: "Answer any X out of Y" (e.g. "যেকোনো ৫টি প্রশ্নের উত্তর দাও")
  questionsToAnswer?: number; // e.g. 5
  totalQuestionsIncluded?: number; // e.g. 8
  choiceInstructionText?: string; // e.g. "যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)"
  headerSize?: 'compact' | 'standard' | 'large';
}

export type NumberingFormat = 'bn' | 'en' | 'ar' | 'ur';

export type ArabicFontFamily = 'Traditional Arabic' | 'Noto Naskh Arabic' | 'Lateef';

export interface LayoutConfig {
  columns: 1 | 2; // 1-column or 2-column board layout
  fontSize: 'compact' | 'standard' | 'large'; // 9pt, 10.5pt, 12pt
  customFontSizePt?: number; // Custom font size in pt (7 to 28)
  lineHeight?: number; // Custom line height multiplier (e.g. 1.1 to 2.6)
  paperSize: 'A4' | 'Legal';
  margins: {
    topMm: number;
    bottomMm: number;
    leftMm: number;
    rightMm: number;
  };
  numberingFormat?: NumberingFormat; // 'bn' (১, [১০]), 'ar' (١, [١٠]), 'ur' (۱, [۱۰]), 'en' (1, [10])
  arabicFont?: ArabicFontFamily; // 'Traditional Arabic' | 'Noto Naskh Arabic' | 'Lateef'
  arabicFontWeight?: 'normal' | 'bold'; // Global Arabic text weight preset
  watermarkText?: string;
  showMarks: boolean;
  showAnswers?: boolean; // For teacher solution sheet
  showOmrGuide?: boolean;
  allowQuestionSplit?: boolean; // Default true: flow sub-items across columns/pages instead of leaving blank space
}

export interface ExamSetEntry {
  questionId: string;
  order: number;
  // Shuffled index order of options for MCQs (e.g., [2, 0, 3, 1])
  optionOrder?: number[];
  customQuestionData?: QuestionData; // Populated question data for rendering
}

export interface ExamSet {
  setName: 'Set A' | 'Set B' | 'Set C' | 'Set D' | string;
  questionEntries: ExamSetEntry[];
  answerKeyMap: Record<number, string>; // e.g., { 1: "ক", 2: "ঘ", 3: "খ" }
}

export interface ExamSection {
  id: string;
  name: string; // e.g. "ক-বিভাগ (সংক্ষিপ্ত প্রশ্ন)" or "Group A: Seen Comprehension"
  instructions?: string; // e.g. "নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:"
  requiredCount?: number; // e.g. 3 (কতটি প্রশ্নের উত্তর দিতে হবে)
  marksPerQuestion?: number; // e.g. 5 (প্রতিটির মান)
  totalMarks?: number; // e.g. 15 (if set, overrides requiredCount * marksPerQuestion)
  displayMarksFormula?: string; // e.g. "৫ × ৩ = ১৫" (auto-generated if empty)
  order: number;
  pageBreakBefore?: boolean;
}

export interface ExamPaperData {
  _id?: string;
  userId?: string;
  title: string;
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
  sections?: ExamSection[]; // Structured exam groups/sections
  questions: QuestionData[]; // Master list of questions
  sets: ExamSet[]; // Generated sets (Set A, Set B, etc.)
  activeSet?: string;
  educationStream?: EducationStream;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
