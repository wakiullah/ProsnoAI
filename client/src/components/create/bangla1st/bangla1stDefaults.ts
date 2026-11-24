import { QuestionData } from 'proshno-shared';

export type BanglaPaperMode = 'COMBINED_100' | 'MCQ_ONLY_30' | 'CQ_ONLY_70';

export type BanglaMcqEntryType = 'SIMPLE' | 'MULTIPLE_COMPLETION' | 'STEM_GROUP';

export type BanglaSyllabusSegment = 'PROSE' | 'POETRY' | 'NOVEL' | 'DRAMA';

export interface BanglaMcqSubQuestion {
  id: string;
  subType: 'SIMPLE' | 'MULTIPLE_COMPLETION';
  questionText: string;
  statements?: [string, string, string];
  options: [string, string, string, string];
  correctIndex: number;
}

export interface BanglaMcqItemConfig {
  id: string;
  entryType: BanglaMcqEntryType;
  segment: BanglaSyllabusSegment;
  // For SIMPLE & MULTIPLE_COMPLETION
  questionText: string;
  statements?: [string, string, string];
  options: [string, string, string, string];
  correctIndex: number;
  // For STEM_GROUP (উদ্দীপকভিত্তিক গুচ্ছ MCQ)
  stemInstruction?: string;
  stemPassage?: string;
  linkedQuestions?: BanglaMcqSubQuestion[];
}

export interface BanglaCqItemConfig {
  id: string;
  segment: BanglaSyllabusSegment;
  stimulusText: string;
  hasSecondStimulus?: boolean;
  stimulus2Text?: string;
  qKa: string; // জ্ঞানমূলক (১)
  qKha: string; // অনুধাবনমূলক (২)
  qGa: string; // প্রয়োগমূলক (৩)
  qGha: string; // উচ্চতর দক্ষতামূলক (৪)
}

export function isAlimGrade(grade?: string): boolean {
  if (!grade) return false;
  return grade.includes('আলিম') || grade.toLowerCase().includes('alim');
}

export function isHscGrade(grade?: string): boolean {
  if (!grade) return false;
  return (
    grade.includes('একাদশ') ||
    grade.includes('দ্বাদশ') ||
    grade.includes('এইচএসসি') ||
    grade.toLowerCase().includes('hsc')
  );
}

export function isBangla1stPaper(subject?: string, subjectCode?: string): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  if (s.includes('আরবি') || s.includes('العربية') || c === '১৩৩' || c === '১৩৪') {
    return false;
  }
  return (
    s.includes('বাংলা ১ম') ||
    s.includes('বাংলা প্রথম') ||
    s === 'বাংলা' ||
    c === '১৩৫' ||
    (c === '১০১' && s.includes('বাংলা'))
  );
}

export const BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS: [string, string, string, string] = [
  'i ও ii',
  'i ও iii',
  'ii ও iii',
  'i, ii ও iii',
];

export const BANGLA_CQ_SECTIONS_4_PART = [
  {
    id: 'PROSE' as BanglaSyllabusSegment,
    bannerTitle: 'ক অংশ—গদ্য',
    shortLabel: 'ক বিভাগ: গদ্য (৪টি → ২টি)',
    targetQuestionCount: 4,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'POETRY' as BanglaSyllabusSegment,
    bannerTitle: 'খ অংশ—কবিতা',
    shortLabel: 'খ বিভাগ: কবিতা (৩টি → ২টি)',
    targetQuestionCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'NOVEL' as BanglaSyllabusSegment,
    bannerTitle: 'গ অংশ—উপন্যাস',
    shortLabel: 'গ বিভাগ: উপন্যাস (২টি → ১টি)',
    targetQuestionCount: 2,
    minAnswerCount: 1,
    marks: 10,
  },
  {
    id: 'DRAMA' as BanglaSyllabusSegment,
    bannerTitle: 'ঘ অংশ—নাটক',
    shortLabel: 'ঘ বিভাগ: নাটক (২টি → ১টি)',
    targetQuestionCount: 2,
    minAnswerCount: 1,
    marks: 10,
  },
];

export const BANGLA_CQ_SECTIONS_ALIM_2_PART = [
  {
    id: 'PROSE' as BanglaSyllabusSegment,
    bannerTitle: 'ক বিভাগ—গদ্যাংশ',
    shortLabel: 'ক বিভাগ: গদ্যাংশ (৬টি → ৪টি = ৪০)',
    targetQuestionCount: 6,
    minAnswerCount: 4,
    marks: 40,
  },
  {
    id: 'POETRY' as BanglaSyllabusSegment,
    bannerTitle: 'খ বিভাগ—কবিতাংশ',
    shortLabel: 'খ বিভাগ: কবিতাংশ (৫টি → ৩টি = ৩০)',
    targetQuestionCount: 5,
    minAnswerCount: 3,
    marks: 30,
  },
];

export function getBanglaInstructionsByMode(
  mode: BanglaPaperMode,
  grade?: string
): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  const alim = isAlimGrade(grade);

  if (mode === 'MCQ_ONLY_30') {
    return {
      timeAllowed: '৩০ মিনিট',
      totalMarks: 30,
      generalInstructions: [
        alim
          ? 'বিশেষ দ্রষ্টব্য: গদ্যাংশ থেকে ১৫টি এবং কবিতাংশ (পদ্য) থেকে ১৫টি মিলিয়ে মোট ৩০টি বহুনির্বাচনি প্রশ্ন রয়েছে। সকল প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১ (১×৩০ = ৩০)।'
          : 'বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসম্বলিত বৃত্তসমূহ হতে সঠিক/সর্বোৎকৃষ্ট উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের উত্তর দিতে হবে।',
      ],
    };
  }

  if (mode === 'CQ_ONLY_70') {
    return {
      timeAllowed: '২ ঘণ্টা ৩০ মিনিট',
      totalMarks: 70,
      generalInstructions: [
        alim
          ? 'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকগুলো মনোযোগসহকারে পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও। ক বিভাগ (গদ্যাংশ) থেকে যেকোনো ৪টি (১০×৪=৪০) এবং খ বিভাগ (কবিতাংশ) থেকে যেকোনো ৩টি (১০×৩=৩০) সহ মোট ৭টি প্রশ্নের উত্তর দিতে হবে।'
          : 'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকগুলো মনোযোগসহকারে পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও। ক বিভাগ থেকে ন্যূনতম ২টি, খ বিভাগ থেকে ন্যূনতম ২টি, গ বিভাগ থেকে ন্যূনতম ১টি ও ঘ বিভাগ থেকে ন্যূনতম ১টি করে মোট ৭টি প্রশ্নের উত্তর দিতে হবে।',
      ],
    };
  }

  // COMBINED_100
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      alim
        ? 'দ্রষ্টব্য: বহুনির্বাচনি অংশে ৩০টি প্রশ্নের সকলটির উত্তর (১×৩০=৩০) এবং সৃজনশীল অংশে গদ্যাংশ থেকে ৪টি ও কবিতাংশ থেকে ৩টিসহ মোট ৭টি প্রশ্নের উত্তর (১০×৭=৭০) দিতে হবে।'
        : 'দ্রষ্টব্য: বহুনির্বাচনি অংশে ৩০টি প্রশ্নের সকলটির উত্তর (১×৩০=৩০) এবং সৃজনশীল অংশে ক বিভাগ থেকে ন্যূনতম ২টি, খ বিভাগ থেকে ২টি, গ বিভাগ থেকে ১টি ও ঘ বিভাগ থেকে ১টিসহ মোট ৭টি প্রশ্নের উত্তর (১০×৭=৭০) দিতে হবে।',
    ],
  };
}

export const DEFAULT_BANGLA_MCQ_ITEMS: BanglaMcqItemConfig[] = [
  {
    id: 'bmcq_1',
    entryType: 'SIMPLE',
    segment: 'POETRY',
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
  },
];

export const DEFAULT_BANGLA_CQ_ITEMS: BanglaCqItemConfig[] = [
  {
    id: 'bcq_1',
    segment: 'PROSE',
    stimulusText:
      'বাবুল মিয়া একজন কৃষক। অবসর সময়ে সে তার নাতি-নাতনিদের বই পড়ে সময় কাটায়। তার পড়ার আগ্রহ দেখে তার নাতি আরিফ বলে দাদা তুমি আমাদের পাড়ার লাইব্রেরিতে গেলে অনেক বই পড়তে পারবে। বাবুল মিয়া একদিন লাইব্রেরিতে গিয়ে কৃষিবিষয়ক অনেক বই দেখে তাজ্জব বনে যায়। এরপর সে নিয়মিত লাইব্রেরিতে যায় এবং বইয়ের প্রতি তার একটা অন্যরকম প্রীতি জেগে ওঠে। তার মতে, বই শুধু জ্ঞান পরিবেশন করে না, মনের খোরাকও জোগায়।',
    qKa: 'যথার্থ শিক্ষিত হতে হলে কী দরকার?',
    qKha: 'আমরা জাতি হিসেবে শৌখিন নই কেন? বুঝিয়ে লেখ।',
    qGa: "উদ্দীপকের বাবুল মিয়ার মধ্যে 'বই পড়া' প্রবন্ধের কোন দিকটি ফুটে উঠেছে? ব্যাখ্যা কর।",
    qGha:
      "'বই শুধু জ্ঞান পরিবেশন করে না, মনের খোরাকও জোগায়'— উক্তিটি উদ্দীপক ও 'বই পড়া' প্রবন্ধের আলোকে বিশ্লেষণ কর।",
  },
  {
    id: 'bcq_2',
    segment: 'POETRY',
    stimulusText:
      'মানুষকে মানুষ হইয়া ঘৃণা করিবার তোমার কী অধিকার আছে? ইহা তো আত্মার ধর্ম নয়। তাহার আত্মা তোমার আত্মার মতোই ভাস্বর, আর একই মহাত্মার অংশ। তোমার জন্মগত অধিকারটাই কি এত বড়?',
    qKa: 'কালাপাহাড়ের প্রকৃত নাম কী?',
    qKha: 'পূজারি আকুল হয়ে দরজা খুলল কেন? ব্যাখ্যা কর।',
    qGa: "উদ্দীপকে 'মানুষ' কবিতার কোন দিকটি প্রতিফলিত হয়েছে? বিশ্লেষণ কর।",
    qGha:
      "উদ্দীপকের বক্তব্যে 'মানুষ' কবিতার অন্তরালে উঠে আসা মানবিক সমাজ প্রত্যাশার দিকটিই ফুটে উঠেছে— মন্তব্যটি বিশ্লেষণ কর।",
  },
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBengaliNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? BENGALI_DIGITS[Number(ch)] : ch))
    .join('');
}
