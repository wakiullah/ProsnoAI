import { StimulusImageConfig, StimulusTableConfig } from 'proshno-shared';
import { isAlimGrade, isHscGrade, toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export type StandardSubjectKey =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'bgs'
  | 'islam'
  | 'islamic_history';

export type StandardPaperMode = 'COMBINED' | 'CQ_ONLY' | 'MCQ_ONLY';

export type StandardCqPartMode = '3_PART' | '4_PART';

export interface StandardSectionDef {
  id: string;
  bannerTitle: string;
  shortLabel: string;
  targetCount: number;
  minAnswerCount: number;
  marks: number;
}

export interface StandardCqItemConfig {
  id: string;
  sectionId?: string;
  stimulusText: string;
  stimulusImage?: StimulusImageConfig;
  stimulusTable?: StimulusTableConfig;
  qKa: string; // ৩-পার্ট (গণিত): ২ | ৪-পার্ট: ১
  qKha: string; // ৩-পার্ট (গণিত): ৪ | ৪-পার্ট: ২
  qGa: string; // ৩-পার্ট (গণিত): ৪ | ৪-পার্ট: ৩
  qGha?: string; // ৪-পার্ট: ৪ (গণিতে ব্যবহৃত হয় না)
}

export interface StandardSqItemConfig {
  id: string;
  questionText: string;
  marks: number;
  stimulusImage?: StimulusImageConfig;
  stimulusTable?: StimulusTableConfig;
}

export type StandardMcqEntryType = 'SIMPLE' | 'MULTIPLE_COMPLETION' | 'STEM_GROUP';

export interface StandardMcqSubQuestion {
  id: string;
  subType: 'SIMPLE' | 'MULTIPLE_COMPLETION';
  questionText: string;
  statements?: [string, string, string];
  options: [string, string, string, string];
  correctIndex: number;
}

export interface StandardMcqItemConfig {
  id: string;
  entryType: StandardMcqEntryType;
  questionText: string;
  statements?: [string, string, string];
  options: [string, string, string, string];
  correctIndex: number;
  stimulusImage?: StimulusImageConfig;
  stimulusTable?: StimulusTableConfig;
  // For STEM_GROUP
  stemInstruction?: string;
  stemPassage?: string;
  linkedQuestions?: StandardMcqSubQuestion[];
}

export interface StandardSubjectConfig {
  key: StandardSubjectKey;
  label: string;
  cqPartMode: StandardCqPartMode;
  cqTotalCount: number;
  cqAnswerCount: number;
  cqTotalMarks: number;
  hasShortQuestions: boolean;
  sqTotalCount: number;
  sqAnswerCount: number;
  sqMarksPerQuestion: number;
  sqTotalMarks: number;
  mcqCount: number;
  mcqTime: string;
  writtenTime: string;
  combinedMarks: number;
  practicalNote?: string;
  showMathToolbarByDefault: boolean;
  sections: StandardSectionDef[];
  defaultCqItems: StandardCqItemConfig[];
  defaultSqItems: StandardSqItemConfig[];
  defaultMcqItems: StandardMcqItemConfig[];
}

export const STD_GROUP_PREFIX = {
  CQ: 'std-cq-section',
  SQ: 'std-sq-section',
  MCQ: 'std-mcq-section',
} as const;

export const STD_MULTI_COMPLETION_OPTIONS: [string, string, string, string] = [
  'i ও ii',
  'i ও iii',
  'ii ও iii',
  'i, ii ও iii',
];

function isJuniorClass6to8(grade?: string): boolean {
  if (!grade) return false;
  return (
    grade.includes('৬ষ্ঠ') ||
    grade.includes('৭ম') ||
    grade.includes('৮ম') ||
    grade.includes('৫ম') ||
    /class\s*[5678]\b/i.test(grade)
  );
}

/**
 * Detects whether the given subject belongs to the Reusable Standard CQ + SQ + MCQ system.
 * Checks subject name first to avoid subject-code overlaps (e.g., 109 = Math & Islamic History, 136 = Physics & Bangla 2nd).
 */
export function detectStandardSubjectKey(
  subject?: string,
  subjectCode?: string
): StandardSubjectKey | null {
  const s = (subject || '').normalize('NFC').toLowerCase();
  const c = (subjectCode || '').trim();

  // Explicitly exclude dedicated-builder subjects
  if (
    s.includes('বাংলা ১ম') ||
    s.includes('বাংলা প্রথম') ||
    s.includes('বাংলা ২') ||
    s.includes('বাংলা দ্বিত') ||
    s.includes('ইংরেজি') ||
    s.includes('english') ||
    s.includes('আরবি') ||
    s.includes('العربية') ||
    s.includes('কুরআন') ||
    s.includes('হাদিস') ||
    s.includes('আকাইদ') ||
    s.includes('ফিকহ') ||
    s.includes('বালাঘাত')
  ) {
    return null;
  }

  if (s.includes('গণিত') || s.includes('math')) return 'math';
  if (s.includes('পদার্থ') || s.includes('physics') || c === '১৭৪' || c === '১৭৫') return 'physics';
  if (s.includes('রসায়ন') || s.includes('রসায়ন') || s.includes('chemistry') || c === '১৭৬' || c === '১৭৭')
    return 'chemistry';
  if (s.includes('বিশ্বপরিচয়') || s.includes('বিশ্বপরিচয়') || s.includes('bgs') || c === '১৫০')
    return 'bgs';
  if (s.includes('নৈতিক শিক্ষা') || s.includes('ইসলাম ও নৈতিক') || s.includes('ইসলাম শিক্ষা') || c === '১১১')
    return 'islam';
  if (s.includes('ইসলামের ইতিহাস') || s.includes('islamic history') || c === '২৬৭')
    return 'islamic_history';

  return null;
}

export function isStandardCqMcqSubject(subject?: string, subjectCode?: string): boolean {
  return detectStandardSubjectKey(subject, subjectCode) !== null;
}

const MATH_SECTIONS_9_10: StandardSectionDef[] = [
  {
    id: 'ALGEBRA',
    bannerTitle: 'ক বিভাগ — বীজগণিত',
    shortLabel: 'ক বিভাগ: বীজগণিত (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'GEOMETRY',
    bannerTitle: 'খ বিভাগ — জ্যামিতি',
    shortLabel: 'খ বিভাগ: জ্যামিতি (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'TRIGONOMETRY',
    bannerTitle: 'গ বিভাগ — ত্রিকোণমিতি ও পরিমিতি',
    shortLabel: 'গ বিভাগ: ত্রিকোণমিতি ও পরিমিতি (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'STATISTICS',
    bannerTitle: 'ঘ বিভাগ — পরিসংখ্যান',
    shortLabel: 'ঘ বিভাগ: পরিসংখ্যান (২টি → ১টি)',
    targetCount: 2,
    minAnswerCount: 1,
    marks: 10,
  },
];

const MATH_SECTIONS_6_8: StandardSectionDef[] = [
  {
    id: 'ARITHMETIC',
    bannerTitle: 'ক বিভাগ — পাটিগণিত',
    shortLabel: 'ক বিভাগ: পাটিগণিত (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'ALGEBRA',
    bannerTitle: 'খ বিভাগ — বীজগণিত',
    shortLabel: 'খ বিভাগ: বীজগণিত (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'GEOMETRY',
    bannerTitle: 'গ বিভাগ — জ্যামিতি',
    shortLabel: 'গ বিভাগ: জ্যামিতি (৩টি → ২টি)',
    targetCount: 3,
    minAnswerCount: 2,
    marks: 20,
  },
  {
    id: 'STATISTICS',
    bannerTitle: 'ঘ বিভাগ — তথ্য ও উপাত্ত',
    shortLabel: 'ঘ বিভাগ: তথ্য ও উপাত্ত (২টি → ১টি)',
    targetCount: 2,
    minAnswerCount: 1,
    marks: 10,
  },
];

const ALIM_HISTORY_SECTIONS: StandardSectionDef[] = [
  {
    id: 'HIST_KA',
    bannerTitle: 'ক বিভাগ',
    shortLabel: 'ক বিভাগ (৫টি → কমপক্ষে ৩টি)',
    targetCount: 5,
    minAnswerCount: 3,
    marks: 30,
  },
  {
    id: 'HIST_KHA',
    bannerTitle: 'খ বিভাগ',
    shortLabel: 'খ বিভাগ (৬টি → কমপক্ষে ৩টি)',
    targetCount: 6,
    minAnswerCount: 3,
    marks: 30,
  },
];

export function getStandardSubjectConfig(
  subject?: string,
  subjectCode?: string,
  grade?: string
): StandardSubjectConfig | null {
  const key = detectStandardSubjectKey(subject, subjectCode);
  if (!key) return null;

  const junior = isJuniorClass6to8(grade);
  const alim = isAlimGrade(grade);
  const hscOrAlim = alim || isHscGrade(grade);

  switch (key) {
    case 'math':
      return {
        key: 'math',
        label: 'গণিত',
        cqPartMode: '3_PART',
        cqTotalCount: 11,
        cqAnswerCount: 7,
        cqTotalMarks: 70,
        hasShortQuestions: false,
        sqTotalCount: 5,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 30,
        mcqTime: '৩০ মিনিট',
        writtenTime: '২ ঘণ্টা ৩০ মিনিট',
        combinedMarks: 100,
        showMathToolbarByDefault: true,
        sections: junior ? MATH_SECTIONS_6_8 : MATH_SECTIONS_9_10,
        defaultCqItems: [
          {
            id: 'math_cq_1',
            sectionId: junior ? 'ARITHMETIC' : 'ALGEBRA',
            stimulusText:
              'যদি $x^2 - 2\\sqrt{6}x + 1 = 0$ এবং $f(y) = y^3 - 3y^2 + 3y - 1$ হয়, যেখানে $x > 0$।',
            qKa: 'দেখাও যে, $x + \\frac{1}{x} = 2\\sqrt{6}$।',
            qKha: '$x^3 - \\frac{1}{x^3}$ এর মান নির্ণয় করো।',
            qGa: 'প্রমাণ করো যে, $x^5 + \\frac{1}{x^5} = 922\\sqrt{6}$।',
          },
          {
            id: 'math_cq_2',
            sectionId: 'GEOMETRY',
            stimulusText:
              '$O$ কেন্দ্রবিশিষ্ট বৃত্তে $AB$ এবং $CD$ দুটি জ্যা বৃত্তের অভ্যন্তরে $E$ বিন্দুতে পরস্পরকে ছেদ করেছে।',
            qKa: 'তথ্যের আলোকে আনুপাতিক চিত্র আঁকো।',
            qKha: 'প্রমাণ করো যে, $\\angle AEC = \\frac{1}{2}(\\angle AOC + \\angle BOD)$।',
            qGa: 'যদি $AB = CD$ হয়, তবে প্রমাণ করো যে $AE = CE$ এবং $BE = DE$।',
          },
          {
            id: 'math_cq_3',
            sectionId: junior ? 'ALGEBRA' : 'TRIGONOMETRY',
            stimulusText:
              'একটি সমকোণী ত্রিভুজ $\\triangle ABC$-এর $\\angle B = 90^\\circ$, $AB = \\sqrt{3}$ সে.মি. এবং $BC = 1$ সে.মি.।',
            qKa: '$AC$-এর দৈর্ঘ্য নির্ণয় করো।',
            qKha: '$\\sin A + \\cos C$-এর মান নির্ণয় করো।',
            qGa: 'প্রমাণ করো যে, $\\frac{\\tan A + \\sec A - 1}{\\tan A - \\sec A + 1} = \\frac{1 + \\sin A}{\\cos A}$।',
          },
          {
            id: 'math_cq_4',
            sectionId: 'STATISTICS',
            stimulusText: 'কোনো শ্রেণির ৪০ জন শিক্ষার্থীর গণিতে প্রাপ্ত নম্বরের গণসংখ্যা নিবেশন সারণি নিচে দেওয়া হলো:',
            stimulusTable: {
              headers: ['শ্রেণিব্যাপ্তি', '৪১–৫০', '৫১–৬০', '৬১–৭০', '৭১–৮০', '৮১–৯০'],
              rows: [['গণসংখ্যা', '৫', '১০', '১২', '৮', '৫']],
            },
            qKa: 'প্রচুরক শ্রেণির মধ্যমান নির্ণয় করো।',
            qKha: 'সংক্ষিপ্ত পদ্ধতিতে গড় নির্ণয় করো।',
            qGa: 'প্রদত্ত উপাত্তের অজিভ রেখা অঙ্কন করো।',
          },
        ],
        defaultSqItems: [
          { id: 'math_sq_1', questionText: '$a + b = 5$ এবং $ab = 6$ হলে $a^2 + b^2$ এর মান কত?', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'math_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'যদি $x + \\frac{1}{x} = 3$ হয়, তবে $x^2 + \\frac{1}{x^2}$ এর মান কত?',
            options: ['$5$', '$7$', '$9$', '$11$'],
            correctIndex: 1,
          },
          {
            id: 'math_mcq_2',
            entryType: 'MULTIPLE_COMPLETION',
            questionText: 'একটি বৃত্তের ব্যাসার্ধ $r$ একক হলে—',
            statements: [
              'বৃত্তের পরিধি $= 2\\pi r$',
              'বৃত্তের ক্ষেত্রফল $= \\pi r^2$',
              'বৃত্তের বৃহত্তম জ্যা $= r$',
            ],
            options: [...STD_MULTI_COMPLETION_OPTIONS],
            correctIndex: 0,
          },
        ],
      };

    case 'physics':
      return {
        key: 'physics',
        label: hscOrAlim ? 'পদার্থবিজ্ঞান' : 'পদার্থবিজ্ঞান',
        cqPartMode: '4_PART',
        cqTotalCount: 7,
        cqAnswerCount: 4,
        cqTotalMarks: 40,
        hasShortQuestions: true,
        sqTotalCount: 7,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 25,
        mcqTime: '২৫ মিনিট',
        writtenTime: '২ ঘণ্টা ৩৫ মিনিট',
        combinedMarks: 75,
        practicalNote: 'ব্যবহারিক: ২৫ নম্বর',
        showMathToolbarByDefault: true,
        sections: [],
        defaultCqItems: [
          {
            id: 'phy_cq_1',
            stimulusText:
              'স্থির অবস্থান থেকে $2\\text{ kg}$ ভরের একটি বস্তু $4\\text{ m/s}^2$ সুষম ত্বরণে $10\\text{ s}$ চলার পর সমবেগে আরও $5\\text{ s}$ চলে।',
            qKa: 'সুষম ত্বরণ কাকে বলে?',
            qKha: 'সুষম বেগে চলমান বস্তুর ত্বরণ শূন্য হয় কেন? ব্যাখ্যা করো।',
            qGa: 'প্রথম $10\\text{ s}$-এ বস্তুটি কত দূরত্ব অতিক্রম করবে তা নির্ণয় করো।',
            qGha: 'সম্পূর্ণ গতিপথে বস্তুটির অতিক্রান্ত মোট দূরত্ব ও গড় বেগ গাণিতিকভাবে বিশ্লেষণ করো।',
          },
          {
            id: 'phy_cq_2',
            stimulusText:
              'একটি বৈদ্যুতিক বর্তনীতে $R_1 = 4\\,\\Omega$ এবং $R_2 = 6\\,\\Omega$ রোধ দুটি সমান্তরালে যুক্ত করে $12\\text{ V}$ তড়িৎকোষের সাথে সংযুক্ত করা হলো।',
            qKa: 'ওহমের সূত্রটি বিবৃত করো।',
            qKha: 'তামার আপেক্ষিক রোধ $1.68 \\times 10^{-8}\\,\\Omega\\text{m}$ বলতে কী বোঝায়?',
            qGa: 'বর্তনীটির তুল্য রোধ ও মূল প্রবাহমাত্রা নির্ণয় করো।',
            qGha: 'রোধ দুটি শ্রেণিতে যুক্ত করলে বর্তনীর ক্ষমতা কমবে না বাড়বে? গাণিতিকভাবে মূল্যায়ন করো।',
          },
        ],
        defaultSqItems: [
          { id: 'phy_sq_1', questionText: 'ভেক্টর রাশি ও স্কেলার রাশির মধ্যে দুটি পার্থক্য লেখো।', marks: 2 },
          { id: 'phy_sq_2', questionText: 'অভিকর্ষজ ত্বরণ $g$-এর মান মেরু অঞ্চলে সর্বাধিক হয় কেন?', marks: 2 },
          { id: 'phy_sq_3', questionText: 'আলোর প্রতিসরণের স্নেলের সূত্রটি লেখো।', marks: 2 },
          { id: 'phy_sq_4', questionText: 'আপেক্ষিক তাপ ও তাপধারণ ক্ষমতার সম্পর্ক দেখাও।', marks: 2 },
          { id: 'phy_sq_5', questionText: 'ফিউজ তার কেন নিম্ন গলনাঙ্কের ধাতু দিয়ে তৈরি করা হয়?', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'phy_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'কাজের একক কোনটি?',
            options: ['নিউটন ($\\text{N}$)', 'জুল ($\\text{J}$)', 'ওয়াট ($\\text{W}$)', 'প্যাসকেল ($\\text{Pa}$)'],
            correctIndex: 1,
          },
          {
            id: 'phy_mcq_2',
            entryType: 'MULTIPLE_COMPLETION',
            questionText: 'গতির সমীকরণের ক্ষেত্রে প্রযোজ্য—',
            statements: [
              '$v = u + at$',
              '$s = ut + \\frac{1}{2}at^2$',
              '$v^2 = u^2 - 2as$ (ত্বরণের ক্ষেত্রে)',
            ],
            options: [...STD_MULTI_COMPLETION_OPTIONS],
            correctIndex: 0,
          },
        ],
      };

    case 'chemistry':
      return {
        key: 'chemistry',
        label: 'রসায়ন',
        cqPartMode: '4_PART',
        cqTotalCount: 7,
        cqAnswerCount: 4,
        cqTotalMarks: 40,
        hasShortQuestions: true,
        sqTotalCount: 7,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 25,
        mcqTime: '২৫ মিনিট',
        writtenTime: '২ ঘণ্টা ৩৫ মিনিট',
        combinedMarks: 75,
        practicalNote: 'ব্যবহারিক: ২৫ নম্বর',
        showMathToolbarByDefault: true,
        sections: [],
        defaultCqItems: [
          {
            id: 'chem_cq_1',
            stimulusText: 'নিচের ছকে তিনটি মৌলের পারমাণবিক সংখ্যা দেওয়া হলো (প্রতীকগুলো প্রচলিত নয়):',
            stimulusTable: {
              headers: ['মৌল', 'X', 'Y', 'Z'],
              rows: [['পারমাণবিক সংখ্যা', '১১', '১৭', '২০']],
            },
            qKa: 'আয়নিকরণ শক্তি কাকে বলে?',
            qKha: 'নিষ্ক্রিয় গ্যাসসমূহ রাসায়নিকভাবে স্থিতিশীল কেন? ব্যাখ্যা করো।',
            qGa: '$X$ ও $Y$ মৌলের মধ্যে গঠিত যৌগের বন্ধন গঠন প্রক্রিয়া ডায়াগ্রামসহ ব্যাখ্যা করো।',
            qGha: '$X$ এবং $Z$ মৌলের মধ্যে কোনটির পারমাণবিক আকার বড় এবং কোনটির সক্রিয়তা বেশি? বিশ্লেষণ করো।',
          },
          {
            id: 'chem_cq_2',
            stimulusText:
              'পরীক্ষাগারে $20\\text{ g}$ $\\text{CaCO}_3$-কে উত্তপ্ত করে $\\text{CaO}$ এবং $\\text{CO}_2$ গ্যাস উৎপন্ন করা হলো: $\\text{CaCO}_3 \\xrightarrow{\\Delta} \\text{CaO} + \\text{CO}_2$।',
            qKa: 'মোলার আয়তন কাকে বলে?',
            qKha: 'লিমিটিং বিক্রিয়ক বলতে কী বোঝায়?',
            qGa: 'প্রমাণ অবস্থায় উৎপন্ন $\\text{CO}_2$ গ্যাসের আয়তন নির্ণয় করো।',
            qGha: 'উৎপন্ন $\\text{CaO}$-কে পানিতে দ্রবীভূত করলে যে দ্রবণ পাওয়া যায় তার প্রকৃতি সমীকরণসহ বিশ্লেষণ করো।',
          },
        ],
        defaultSqItems: [
          { id: 'chem_sq_1', questionText: 'আইসোটোপ কাকে বলে? হাইড্রোজেনের দুটি আইসোটোপের নাম লেখো।', marks: 2 },
          { id: 'chem_sq_2', questionText: '$\\text{H}_2\\text{O}$ সমযোজী যৌগ হওয়া সত্ত্বেও পোলার কেন?', marks: 2 },
          { id: 'chem_sq_3', questionText: 'লা-শাতেলিয়ারের নীতিটি বিবৃত করো।', marks: 2 },
          { id: 'chem_sq_4', questionText: 'প্রশমন বিক্রিয়াকে তাপোৎপাদী বিক্রিয়া বলা হয় কেন?', marks: 2 },
          { id: 'chem_sq_5', questionText: 'খাবার সোডার রাসায়নিক সংকেত ও একটি ব্যবহার লেখো।', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'chem_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'সালফিউরিক এসিড ($\\text{H}_2\\text{SO}_4$)-এ সালফারের জারণ সংখ্যা কত?',
            options: ['$+2$', '$+4$', '$+6$', '$-2$'],
            correctIndex: 2,
          },
          {
            id: 'chem_mcq_2',
            entryType: 'MULTIPLE_COMPLETION',
            questionText: 'সোডিয়াম ক্লোরাইড ($\\text{NaCl}$) যৌগটি—',
            statements: [
              'আয়নিক বন্ধনে গঠিত',
              'পানিতে দ্রবণীয়',
              'গলিত অবস্থায় বিদ্যুৎ পরিবহন করে',
            ],
            options: [...STD_MULTI_COMPLETION_OPTIONS],
            correctIndex: 3,
          },
        ],
      };

    case 'bgs':
      return {
        key: 'bgs',
        label: 'বাংলাদেশ ও বিশ্বপরিচয়',
        cqPartMode: '4_PART',
        cqTotalCount: 11,
        cqAnswerCount: 7,
        cqTotalMarks: 70,
        hasShortQuestions: false,
        sqTotalCount: 5,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 30,
        mcqTime: '৩০ মিনিট',
        writtenTime: '২ ঘণ্টা ৩০ মিনিট',
        combinedMarks: 100,
        showMathToolbarByDefault: false,
        sections: [],
        defaultCqItems: [
          {
            id: 'bgs_cq_1',
            stimulusText:
              'রাফি তার দাদার কাছে শুনতে পেল, ১৯৫২ সালের ২১শে ফেব্রুয়ারি ছাত্র-জনতা মাতৃভাষার মর্যাদা রক্ষায় রাজপথে নেমে এসেছিল এবং অনেকে জীবন উৎসর্গ করেছিলেন। এর ধারাবাহিকতায় বাঙালি জাতি ১৯৭১ সালে মহান স্বাধীনতা অর্জন করে।',
            qKa: 'আন্তর্জাতিক মাতৃভাষা দিবস কবে পালিত হয়?',
            qKha: 'ভাষা আন্দোলনকে বাঙালি জাতীয়তাবাদের প্রথম সোপান বলা হয় কেন?',
            qGa: 'উদ্দীপকে উল্লিখিত ঐতিহাসিক ঘটনাটির তাৎপর্য ব্যাখ্যা করো।',
            qGha: '“১৯৫২ সালের ভাষা আন্দোলনই ১৯৭১ সালের মুক্তিযুদ্ধের বীজ বপন করেছিল”—উক্তিটি মূল্যায়ন করো।',
          },
        ],
        defaultSqItems: [
          { id: 'bgs_sq_1', questionText: 'টেকসই উন্নয়ন অভিষ্ট (SDG) বলতে কী বোঝায়?', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'bgs_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'বাংলাদেশের সংবিধান কবে থেকে কার্যকর হয়?',
            options: ['১৬ ডিসেম্বর ১৯৭১', '৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '২৬ মার্চ ১৯৭২'],
            correctIndex: 2,
          },
        ],
      };

    case 'islam':
      return {
        key: 'islam',
        label: 'ইসলাম ও নৈতিক শিক্ষা',
        cqPartMode: '4_PART',
        cqTotalCount: 11,
        cqAnswerCount: 7,
        cqTotalMarks: 70,
        hasShortQuestions: false,
        sqTotalCount: 5,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 30,
        mcqTime: '৩০ মিনিট',
        writtenTime: '২ ঘণ্টা ৩০ মিনিট',
        combinedMarks: 100,
        showMathToolbarByDefault: false,
        sections: [],
        defaultCqItems: [
          {
            id: 'islam_cq_1',
            stimulusText:
              'জনাব করিম সাহেব একজন সৎ ব্যবসায়ী। তিনি কখনো ওজনে কম দেন না এবং নিয়মিত পাঁচ ওয়াক্ত সালাত আদায় করেন। অন্যদিকে তাঁর প্রতিবেশী জনাব রহিম অধিক লাভের আশায় পণ্যে ভেজাল মেশান।',
            qKa: 'তাওহিদ শব্দের অর্থ কী?',
            qKha: 'আমানতদারিতা বলতে কী বোঝায়? ব্যাখ্যা করো।',
            qGa: 'জনাব করিম সাহেবের চরিত্রে ইসলামের কোন মৌলিক গুণটি ফুটে উঠেছে? পাঠ্যবইয়ের আলোকে ব্যাখ্যা করো।',
            qGha: 'ইসলামি শরিয়তের দৃষ্টিতে জনাব রহিমের কর্মকাণ্ডের পরিণতি বিশ্লেষণ করো।',
          },
        ],
        defaultSqItems: [
          { id: 'islam_sq_1', questionText: 'আখলাকে হামিদা ও আখলাকে যামিমা বলতে কী বোঝায়?', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'islam_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'ইসলামের মৌলিক স্তম্ভ কয়টি?',
            options: ['৩টি', '৪টি', '৫টি', '৭টি'],
            correctIndex: 2,
          },
        ],
      };

    case 'islamic_history':
      return {
        key: 'islamic_history',
        label: 'ইসলামের ইতিহাস',
        cqPartMode: '4_PART',
        cqTotalCount: 11,
        cqAnswerCount: 7,
        cqTotalMarks: 70,
        hasShortQuestions: false,
        sqTotalCount: 5,
        sqAnswerCount: 5,
        sqMarksPerQuestion: 2,
        sqTotalMarks: 10,
        mcqCount: 30,
        mcqTime: '৩০ মিনিট',
        writtenTime: '২ ঘণ্টা ৩০ মিনিট',
        combinedMarks: 100,
        showMathToolbarByDefault: false,
        sections: alim ? ALIM_HISTORY_SECTIONS : [],
        defaultCqItems: [
          {
            id: 'hist_cq_1',
            sectionId: alim ? 'HIST_KA' : undefined,
            stimulusText:
              'হযরত মুহাম্মদ (সা.) মদিনায় হিজরত করার পর সেখানে বসবাসরত মুসলিম, ইহুদি ও অন্যান্য গোত্রের মধ্যে শান্তি-শৃঙ্খলা ও সাম্প্রদায়িক সম্প্রীতি প্রতিষ্ঠার লক্ষ্যে একটি লিখিত সংবিধান প্রণয়ন করেন।',
            qKa: 'মদিনা সনদ কত খ্রিস্টাব্দে প্রণীত হয়?',
            qKha: 'হিজরত বলতে কী বোঝায়? সংক্ষেপে লেখো।',
            qGa: 'উদ্দীপকে ইঙ্গিতকৃত সনদটির প্রধান শর্তসমূহ ব্যাখ্যা করো।',
            qGha: '“মদিনা সনদ ছিল পৃথিবীর ইতিহাসে সর্বপ্রথম লিখিত সংবিধান ও মানবাধিকারের দলিল”—মূল্যায়ন করো।',
          },
          ...(alim
            ? [
                {
                  id: 'hist_cq_2',
                  sectionId: 'HIST_KHA',
                  stimulusText:
                    'আব্বাসীয় খলিফা আল-মামুন জ্ঞান-বিজ্ঞান ও অনুবাদ কর্মের পৃষ্ঠপোষকতার জন্য বাগদাদে একটি বিশ্ববিখ্যাত গবেষণাগার ও গ্রন্থাগার প্রতিষ্ঠা করেন, যা মুসলিম সভ্যতাকে স্বর্ণযুগে পৌঁছে দেয়।',
                  qKa: 'বায়তুল হিকমাহ কে প্রতিষ্ঠা করেন?',
                  qKha: 'আব্বাসীয় যুগকে ইসলামের স্বর্ণযুগ বলা হয় কেন?',
                  qGa: 'উদ্দীপকে উল্লিখিত প্রতিষ্ঠানটির জ্ঞান-বিজ্ঞান চর্চায় অবদান আলোচনা করো।',
                  qGha: 'বিশ্বসভ্যতার বিকাশে আব্বাসীয় খিলাফতের সাংস্কৃতিক ও বৈজ্ঞানিক অবদান মূল্যায়ন করো।',
                },
              ]
            : []),
        ],
        defaultSqItems: [
          { id: 'hist_sq_1', questionText: 'খুলাফায়ে রাশেদিন বলতে কাদের বোঝানো হয়?', marks: 2 },
        ],
        defaultMcqItems: [
          {
            id: 'hist_mcq_1',
            entryType: 'SIMPLE',
            questionText: 'হিজরি সন গণনা শুরু হয় কোন খলিফার আমলে?',
            options: ['হযরত আবু বকর (রা.)', 'হযরত উমর (রা.)', 'হযরত উসমান (রা.)', 'হযরত আলি (রা.)'],
            correctIndex: 1,
          },
        ],
      };
  }
}

export function getStandardInstructionsByMode(
  config: StandardSubjectConfig,
  mode: StandardPaperMode
): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  if (mode === 'MCQ_ONLY') {
    return {
      timeAllowed: config.mcqTime,
      totalMarks: config.mcqCount,
      generalInstructions: [
        `বিশেষ দ্রষ্টব্য: প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের (${toBengaliNumber(config.mcqCount)}টি) উত্তর দিতে হবে।`,
      ],
    };
  }

  if (mode === 'CQ_ONLY') {
    if (config.hasShortQuestions) {
      return {
        timeAllowed: config.writtenTime,
        totalMarks: config.cqTotalMarks + config.sqTotalMarks,
        generalInstructions: [
          `বিশেষ দ্রষ্টব্য: ক অংশ থেকে যেকোনো ${toBengaliNumber(config.cqAnswerCount)}টি সৃজনশীল প্রশ্নের (${toBengaliNumber(config.cqTotalMarks)} নম্বর) এবং খ অংশ থেকে যেকোনো ${toBengaliNumber(config.sqAnswerCount)}টি সংক্ষিপ্ত প্রশ্নের (${toBengaliNumber(config.sqTotalMarks)} নম্বর) উত্তর দিতে হবে।`,
        ],
      };
    }

    const sectionHint =
      config.key === 'math'
        ? 'ক, খ ও গ বিভাগ থেকে কমপক্ষে ২টি করে এবং ঘ বিভাগ থেকে কমপক্ষে ১টিসহ মোট ৭টি প্রশ্নের উত্তর দিতে হবে।'
        : config.key === 'islamic_history' && config.sections.length === 2
        ? 'ক ও খ প্রতিটি বিভাগ থেকে কমপক্ষে ৩টি করে মোট ৭টি প্রশ্নের উত্তর দিতে হবে।'
        : `প্রদত্ত ${toBengaliNumber(config.cqTotalCount)}টি সৃজনশীল প্রশ্ন থেকে যেকোনো ${toBengaliNumber(config.cqAnswerCount)}টি প্রশ্নের উত্তর দিতে হবে।`;

    return {
      timeAllowed: config.writtenTime,
      totalMarks: config.cqTotalMarks,
      generalInstructions: [
        `বিশেষ দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। ${sectionHint}`,
      ],
    };
  }

  // COMBINED
  if (config.hasShortQuestions) {
    return {
      timeAllowed: '৩ ঘণ্টা',
      totalMarks: config.combinedMarks,
      generalInstructions: [
        `বিশেষ দ্রষ্টব্য: সৃজনশীল ${toBengaliNumber(config.cqTotalMarks)} নম্বর (${toBengaliNumber(config.cqTotalCount)}টি থেকে ${toBengaliNumber(config.cqAnswerCount)}টি), সংক্ষিপ্ত প্রশ্ন ${toBengaliNumber(config.sqTotalMarks)} নম্বর (${toBengaliNumber(config.sqTotalCount)}টি থেকে ${toBengaliNumber(config.sqAnswerCount)}টি) এবং বহুনির্বাচনি ${toBengaliNumber(config.mcqCount)} নম্বর (${toBengaliNumber(config.mcqCount)}টি)। [${config.practicalNote || 'ব্যবহারিক: ২৫ নম্বর'}]`,
      ],
    };
  }

  const combinedHint =
    config.key === 'math'
      ? 'সৃজনশীল অংশে ক, খ ও গ বিভাগ থেকে কমপক্ষে ২টি করে এবং ঘ বিভাগ থেকে ১টিসহ মোট ৭টি (৭০ নম্বর) এবং বহুনির্বাচনি ৩০টি (৩০ নম্বর) প্রশ্নের উত্তর দিতে হবে।'
      : config.key === 'islamic_history' && config.sections.length === 2
      ? 'সৃজনশীল অংশে ক ও খ প্রতিটি বিভাগ থেকে কমপক্ষে ৩টিসহ মোট ৭টি (৭০ নম্বর) এবং বহুনির্বাচনি ৩০টি (৩০ নম্বর) প্রশ্নের উত্তর দিতে হবে।'
      : `সৃজনশীল অংশে যেকোনো ${toBengaliNumber(config.cqAnswerCount)}টি (${toBengaliNumber(config.cqTotalMarks)} নম্বর) এবং বহুনির্বাচনি সকল ${toBengaliNumber(config.mcqCount)}টি (${toBengaliNumber(config.mcqCount)} নম্বর) প্রশ্নের উত্তর দিতে হবে।`;

  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: config.combinedMarks,
    generalInstructions: [`বিশেষ দ্রষ্টব্য: ${combinedHint}`],
  };
}
