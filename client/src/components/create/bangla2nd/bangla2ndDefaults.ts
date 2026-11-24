import { QuestionData } from 'proshno-shared';
import { BanglaPaperMode, isAlimGrade, isHscGrade, toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export function isHscOrAlimGrade(grade?: string): boolean {
  return isAlimGrade(grade) || isHscGrade(grade);
}

export function isBangla2ndPaper(subject?: string, subjectCode?: string): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  if (s.includes('আরবি') || s.includes('العربية') || c === '১৩৩' || c === '১৩৪') {
    return false;
  }
  return (
    s.includes('বাংলা ২য়') ||
    s.includes('বাংলা ২য়') ||
    s.includes('বাংলা দ্বিতীয়') ||
    s.includes('বাংলা দ্বিতীয়') ||
    (c === '১০২' && s.includes('বাংলা')) ||
    (c === '১৩৬' && s.includes('বাংলা'))
  );
}

export function getBangla2ndInstructions(
  mode: BanglaPaperMode,
  grade?: string
): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  const hscOrAlim = isHscOrAlimGrade(grade);

  if (hscOrAlim) {
    return {
      timeAllowed: '৩ ঘণ্টা',
      totalMarks: 100,
      generalInstructions: [
        '[দ্রষ্টব্য : ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। একই প্রশ্নের উত্তরে সাধু ও চলিত ভাষারীতির মিশ্রণ দূষণীয়]',
      ],
    };
  }

  if (mode === 'MCQ_ONLY_30') {
    return {
      timeAllowed: '৩০ মিনিট',
      totalMarks: 30,
      generalInstructions: [
        'বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসম্বলিত বৃত্তসমূহ হতে সঠিক/সর্বোৎকৃষ্ট উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১ (১×৩০=৩০)।',
      ],
    };
  }

  if (mode === 'CQ_ONLY_70') {
    return {
      timeAllowed: '২ ঘণ্টা ৩০ মিনিট',
      totalMarks: 70,
      generalInstructions: [
        '[দ্রষ্টব্য : ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। একই প্রশ্নের উত্তরে সাধু ও চলিত ভাষারীতির মিশ্রণ দূষণীয়]',
      ],
    };
  }

  // COMBINED_100 for Class 6-10 (School & Dakhil)
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। বহুনির্বাচনি অংশে ৩০টি প্রশ্নের সকলটির উত্তর (১×৩০=৩০) এবং রচনামূলক অংশে প্রদত্ত নির্দেশনা অনুযায়ী উত্তর (পূর্ণমান ৭০) দিতে হবে।',
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: CLASS 6–10 (SCHOOL/SSC & MADRASAH/DAKHIL) WRITTEN SECTION (70 MARKS)
// ─────────────────────────────────────────────────────────────────────────────

export type Bangla2ndSscQuestionKind =
  | 'ANUCHCHED' // ১। যেকোনো একটি বিষয়ে অনুচ্ছেদ রচনা কর : (ক) ... (খ) ... [১০]
  | 'PATRA_DARKHASTA' // ২। যেকোনো একটি বিষয়ে পত্র লেখ : (ক) ... অথবা, (খ) ... [১০]
  | 'SARANGSHO_SARMORMO' // ৩। (ক) সারাংশ লেখ : [passage] অথবা, (খ) সারমর্ম লেখ : [poem] [১০]
  | 'BHAB_SAMPRASARAN' // ৪। যেকোনো একটি ভাব-সম্প্রসারণ কর : (ক) ... (খ) ... [১০]
  | 'PRATIBEDAN' // ৫। যেকোনো একটি বিষয়ে প্রতিবেদন রচনা কর : (ক) ... অথবা, (খ) ... [১০]
  | 'PRABANDHA'; // ৬। যেকোনো একটি বিষয়ে প্রবন্ধ রচনা কর : (ক) ... (খ) ... (গ) ... [২০]

export interface Bangla2ndSscWrittenItemConfig {
  id: string;
  kind: Bangla2ndSscQuestionKind;
  marks: number;
  stemTitle: string;
  useAthabaPrefix: boolean; // true => "অথবা, (খ)" on 2nd option
  // For SARANGSHO_SARMORMO (Q3)
  partKaHeading?: string;
  partKhaHeading?: string;
  // Option texts: for Q1-Q5 typically [optKa, optKha]; for Q6 [optKa, optKha, optGa, ...]
  options: string[];
  // Placeholders for UI
  optionPlaceholders?: string[];
}

export const DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS: Bangla2ndSscWrittenItemConfig[] = [
  {
    id: 'b2_ssc_1',
    kind: 'ANUCHCHED',
    marks: 10,
    stemTitle: 'যেকোনো একটি বিষয়ে অনুচ্ছেদ রচনা কর :',
    useAthabaPrefix: false,
    options: ['', ''],
    optionPlaceholders: ['বইমেলা;', 'জাতীয় পতাকা।'],
  },
  {
    id: 'b2_ssc_2',
    kind: 'PATRA_DARKHASTA',
    marks: 10,
    stemTitle: 'যেকোনো একটি বিষয়ে পত্র লেখ :',
    useAthabaPrefix: true,
    options: ['', ''],
    optionPlaceholders: [
      'মনে কর, তুমি সাদি/সাদিয়া। সড়ক দুর্ঘটনা প্রতিকারের দাবি জানিয়ে পত্রিকায় প্রকাশের উপযোগী একটি চিঠি লেখ।',
      'মনে কর, তুমি নিখিল/নীলিমা। এসএসসি/দাখিল পরীক্ষার প্রস্তুতির কথা জানিয়ে তোমার মায়ের নিকট একখানা চিঠি লেখ।',
    ],
  },
  {
    id: 'b2_ssc_3',
    kind: 'SARANGSHO_SARMORMO',
    marks: 10,
    stemTitle: '',
    partKaHeading: 'সারাংশ লেখ :',
    partKhaHeading: 'সারমর্ম লেখ :',
    useAthabaPrefix: true,
    options: ['', ''],
    optionPlaceholders: [
      'সারাংশের জন্য গদ্য অনুচ্ছেদটি এখানে লিখুন...',
      'সারমর্মের জন্য কবিতার চরণগুলো এখানে লিখুন...',
    ],
  },
  {
    id: 'b2_ssc_4',
    kind: 'BHAB_SAMPRASARAN',
    marks: 10,
    stemTitle: 'যেকোনো একটি ভাব-সম্প্রসারণ কর :',
    useAthabaPrefix: false,
    options: ['', ''],
    optionPlaceholders: [
      'গ্রন্থগত বিদ্যা আর পরহস্তে ধন,\nনহে বিদ্যা নহে ধন হলে প্রয়োজন।',
      'বই কিনে কেউ দেউলিয়া হয় না।',
    ],
  },
  {
    id: 'b2_ssc_5',
    kind: 'PRATIBEDAN',
    marks: 10,
    stemTitle: 'যেকোনো একটি বিষয়ে প্রতিবেদন রচনা কর :',
    useAthabaPrefix: true,
    options: ['', ''],
    optionPlaceholders: [
      'মনে কর, তুমি আবিদ/আবিদা। তোমার বিদ্যালয়ের নবীনবরণ অনুষ্ঠান সম্পর্কে সংবাদ প্রতিবেদন রচনা কর।',
      'মনে কর, তুমি সুজন/শাহিনা। সবুজ সৈকত বেষ্টনী গড়ে তোলার লক্ষ্যে বৃক্ষরোপণ উৎসবের বর্ণনা দিয়ে একটি প্রতিবেদন তৈরি কর।',
    ],
  },
  {
    id: 'b2_ssc_6',
    kind: 'PRABANDHA',
    marks: 20,
    stemTitle: 'যেকোনো একটি বিষয়ে প্রবন্ধ রচনা কর :',
    useAthabaPrefix: false,
    options: ['', '', ''],
    optionPlaceholders: [
      'বাংলাদেশের মুক্তিযুদ্ধ;',
      'কৃষি উদ্যোক্তা;',
      'মাদকাসক্তি ও এর প্রতিকার।',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: HSC (CLASS 11–12) & ALIM (1ST/2ND YEAR) — 100 MARKS (Q1–Q12)
// ─────────────────────────────────────────────────────────────────────────────

export type Bangla2ndHscPartFormat = 'SINGLE' | 'PASSAGE_OR_WORDS' | 'ROMAN_LIST';

export interface Bangla2ndHscSubPart {
  format: Bangla2ndHscPartFormat;
  prompt: string;
  promptPlaceholder: string;
  passageOrWords?: string;
  passagePlaceholder?: string;
  romanItems?: string[];
  romanPlaceholder?: string;
  allowUnderlineHelper?: boolean;
}

export interface Bangla2ndHscQuestionConfig {
  id: string;
  qNumber: number;
  topicBadge: string;
  marks: number;
  isEssayList?: boolean; // true for Q12 (5 essay options ক, খ, গ, ঘ, ঙ)
  partKa: Bangla2ndHscSubPart;
  partKha?: Bangla2ndHscSubPart;
  essayOptions?: string[];
  essayPlaceholders?: string[];
}

export const DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS: Bangla2ndHscQuestionConfig[] = [
  {
    id: 'b2_hsc_g1',
    qNumber: 1,
    topicBadge: 'উচ্চারণ',
    marks: 5,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'উদাহরণসহ ম-ফলা উচ্চারণের পাঁচটি নিয়ম লেখো।',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'যে-কোনো পাঁচটি শব্দের শুদ্ধ উচ্চারণ লেখো :',
      promptPlaceholder: 'যে-কোনো পাঁচটি শব্দের শুদ্ধ উচ্চারণ লেখো :',
      passageOrWords: '',
      passagePlaceholder: 'ব্যাখ্যা, যুগ্ম, যৌবন, শাশ্বত, দ্রষ্টব্য, বৈশাখ, দেশপ্রেম, অতুল।',
    },
  },
  {
    id: 'b2_hsc_g2',
    qNumber: 2,
    topicBadge: 'বানান ও ণ-ত্ব/ষ-ত্ব বিধান',
    marks: 5,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'ষ-ত্ব বিধান কী? উদাহরণসহ ষ-ত্ব বিধানের পাঁচটি নিয়ম লেখো।',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'যে-কোনো পাঁচটি শব্দের বানান শুদ্ধ করে লেখো :',
      promptPlaceholder: 'যে-কোনো পাঁচটি শব্দের বানান শুদ্ধ করে লেখো :',
      passageOrWords: '',
      passagePlaceholder: 'রুগ্ন, সম্বর্ধনা, কর্মনিষ্ঠা, প্রতিদ্বন্দ্বি, মনোপুত, বাল্মিকি, স্বত্তাধিকারি, পৈত্রিক।',
    },
  },
  {
    id: 'b2_hsc_g3',
    qNumber: 3,
    topicBadge: 'ব্যাকরণিক শব্দশ্রেণি',
    marks: 5,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'আবেগ শব্দ কাকে বলে? আবেগ শব্দের শ্রেণিবিভাগ উদাহরণসহ আলোচনা করো।',
    },
    partKha: {
      format: 'ROMAN_LIST',
      prompt: 'নিম্নরেখ যে-কোনো পাঁচটি শব্দের ব্যাকরণিক শ্রেণি নির্দেশ করো :',
      promptPlaceholder: 'নিম্নরেখ যে-কোনো পাঁচটি শব্দের ব্যাকরণিক শ্রেণি নির্দেশ করো :',
      romanItems: ['', '', '', '', '', '', '', ''],
      romanPlaceholder: 'বাক্য লিখুন (শব্দ সিলেক্ট করে নিচের আন্ডারলাইন বাটনে ক্লিক করুন)',
      allowUnderlineHelper: true,
    },
  },
  {
    id: 'b2_hsc_g4',
    qNumber: 4,
    topicBadge: 'শব্দগঠন (প্রকৃতি-প্রত্যয়, উপসর্গ ও সমাস)',
    marks: 5,
    partKa: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'যে-কোনো পাঁচটি শব্দের প্রত্যয়ের নামসহ প্রকৃতি ও প্রত্যয় নির্ণয় করো :',
      promptPlaceholder: 'যে-কোনো পাঁচটি শব্দের প্রত্যয়ের নামসহ প্রকৃতি ও প্রত্যয় নির্ণয় করো :',
      passageOrWords: '',
      passagePlaceholder: 'বর্ধমান, শ্রবণীয়, নবান্ন, সৌন্দর্য, সৃষ্টি, সম্রাট, শৈশব, বার্ষিক।',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'যে-কোনো পাঁচটি শব্দের ব্যাসবাক্যসহ সমাসের নাম লেখো :',
      promptPlaceholder: 'যে-কোনো পাঁচটি শব্দের ব্যাসবাক্যসহ সমাসের নাম লেখো :',
      passageOrWords: '',
      passagePlaceholder: 'সত্যাসত্য, পরোক্ষ, জীবনানন্দ, শৌখিন, আলোকচিত্র, অরুণরাঙা, মহাত্মা, যুগান্তর।',
    },
  },
  {
    id: 'b2_hsc_g5',
    qNumber: 5,
    topicBadge: 'বাক্যতত্ত্ব ও বাক্য রূপান্তর',
    marks: 5,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'বাক্য কাকে বলে? অর্থ অনুসারে বাক্য কত প্রকার ও কী কী? উদাহরণসহ আলোচনা করো।',
    },
    partKha: {
      format: 'ROMAN_LIST',
      prompt: 'বন্ধনীর নির্দেশ অনুযায়ী যে-কোনো পাঁচটি বাক্যের রূপান্তর করো:',
      promptPlaceholder: 'বন্ধনীর নির্দেশ অনুযায়ী যে-কোনো পাঁচটি বাক্যের রূপান্তর করো:',
      romanItems: ['', '', '', '', '', '', '', ''],
      romanPlaceholder: 'যেমন: যারা পরিশ্রমী, তারা সফল হয়। (সরল)',
    },
  },
  {
    id: 'b2_hsc_g6',
    qNumber: 6,
    topicBadge: 'অপপ্রয়োগ ও শুদ্ধ প্রয়োগ',
    marks: 5,
    partKa: {
      format: 'ROMAN_LIST',
      prompt: 'যে-কোনো পাঁচটি বাক্য শুদ্ধ করে লেখো :',
      promptPlaceholder: 'যে-কোনো পাঁচটি বাক্য শুদ্ধ করে লেখো :',
      romanItems: ['', '', '', '', '', '', '', ''],
      romanPlaceholder: 'যেমন: আমার বক্তব্য আর দীর্ঘায়িত করব না।',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'নিচের অনুচ্ছেদের অপপ্রয়োগগুলো শুদ্ধ করে লেখো :',
      promptPlaceholder: 'নিচের অনুচ্ছেদের অপপ্রয়োগগুলো শুদ্ধ করে লেখো :',
      passageOrWords: '',
      passagePlaceholder:
        'দারিদ্র্যতা আজ আর বাংলাদেশের প্রধান সমস্যা নয়। আমাদের দেশ এখন সমৃদ্ধশালী। কেবলমাত্র দুর্নীতিই আমাদের পেছনে টানে...',
    },
  },
];

export const DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS: Bangla2ndHscQuestionConfig[] = [
  {
    id: 'b2_hsc_n7',
    qNumber: 7,
    topicBadge: 'পারিভাষিক শব্দ ও বঙ্গানুবাদ',
    marks: 10,
    partKa: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'যে কোনো দশটি শব্দের বাংলা পারিভাষিক রূপ লেখো :',
      promptPlaceholder: 'যে কোনো দশটি শব্দের বাংলা পারিভাষিক রূপ লেখো :',
      passageOrWords: '',
      passagePlaceholder:
        'Assembly, Bulletin, Significant, Tourist, Purchase, Reform, Ordinance, Prefix, State Minister, Import, Judicial, Hostile, Chief whip, Souvenir, Debt.',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'নিচের অনুচ্ছেদটি বাংলায় অনুবাদ করো :',
      promptPlaceholder: 'নিচের অনুচ্ছেদটি বাংলায় অনুবাদ করো :',
      passageOrWords: '',
      passagePlaceholder:
        'Many people put off for tomorrow the work they can do today. Students also very often put off their class lessons for tomorrow...',
    },
  },
  {
    id: 'b2_hsc_n8',
    qNumber: 8,
    topicBadge: 'দিনলিপি / অভিজ্ঞতা ও ভাষণ / প্রতিবেদন',
    marks: 10,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'তোমার ঘুরে আসা কোনো দর্শনীয় স্থান পরিদর্শনের অনুভূতি প্রকাশ করে একটি দিনলিপি লেখো।',
    },
    partKha: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: "‘আর্তমানবতার সেবায় তরুণ সমাজ’—তরুণদের সচেতন করার লক্ষ্যে এ বিষয়ে একটি ভাষণ তৈরি করো।",
    },
  },
  {
    id: 'b2_hsc_n9',
    qNumber: 9,
    topicBadge: 'বৈদ্যুতিন চিঠি (ই-মেইল) / পত্র ও আবেদনপত্র',
    marks: 10,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'বাংলা নববর্ষের শুভেচ্ছা জানিয়ে বন্ধুর নিকট প্রেরণের জন্য একটি বৈদ্যুতিন চিঠি লেখো।',
    },
    partKha: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'কোনো বাণিজ্যিক প্রতিষ্ঠানে অফিসার পদে নিয়োগের জন্য একটি আবেদনপত্র রচনা করো।',
    },
  },
  {
    id: 'b2_hsc_n10',
    qNumber: 10,
    topicBadge: 'সারাংশ / সারমর্ম ও ভাব-সম্প্রসারণ',
    marks: 10,
    partKa: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'সারাংশ লেখো :',
      promptPlaceholder: 'সারাংশ লেখো : (অথবা সারমর্ম লেখো :)',
      passageOrWords: '',
      passagePlaceholder: 'সারাংশ বা সারমর্মের অনুচ্ছেদ/কবিতা এখানে লিখুন...',
    },
    partKha: {
      format: 'PASSAGE_OR_WORDS',
      prompt: 'ভাবসম্প্রসারণ করো :',
      promptPlaceholder: 'ভাবসম্প্রসারণ করো :',
      passageOrWords: '',
      passagePlaceholder: 'পথের প্রান্তে আমার তীর্থ নয়\nপথের দু’ধারে আছে মোর দেবালয়।',
    },
  },
  {
    id: 'b2_hsc_n11',
    qNumber: 11,
    topicBadge: 'সংলাপ ও খুদেগল্প রচনা',
    marks: 10,
    partKa: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: 'কারিগরি শিক্ষার গুরুত্ব নিয়ে দুই বন্ধুর মধ্যে সংলাপ রচনা করো।',
    },
    partKha: {
      format: 'SINGLE',
      prompt: '',
      promptPlaceholder: "‘স্বনির্ভরতার জন্য ক্ষুদ্র ও কুটির শিল্পের বিকাশ চাই’ শিরোনামে একটি খুদেগল্প রচনা করো।",
    },
  },
  {
    id: 'b2_hsc_n12',
    qNumber: 12,
    topicBadge: 'প্রবন্ধ রচনা (৫টি বিকল্প)',
    marks: 20,
    isEssayList: true,
    partKa: {
      format: 'SINGLE',
      prompt: 'যে-কোনো একটি বিষয় অবলম্বনে প্রবন্ধ রচনা করো :',
      promptPlaceholder: 'যে-কোনো একটি বিষয় অবলম্বনে প্রবন্ধ রচনা করো :',
    },
    essayOptions: ['', '', '', '', ''],
    essayPlaceholders: [
      'জাতীয় উন্নয়নে তথ্যপ্রযুক্তি;',
      'পরিবেশ দূষণ ও তার প্রতিকার;',
      'গাছ লাগাও পরিবেশ বাঁচাও;',
      'মাদকাসক্তি ও তার প্রতিকার;',
      'প্রাকৃতিক নৈসর্গে বাংলাদেশ।',
    ],
  },
];

export const BENGALI_OPTION_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ'];
export const ROMAN_LOWER_LABELS = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)'];

export function formatBengaliMarks2Digit(marks: number): string {
  const bn = toBengaliNumber(marks);
  return marks < 10 ? `০${bn}` : bn;
}
