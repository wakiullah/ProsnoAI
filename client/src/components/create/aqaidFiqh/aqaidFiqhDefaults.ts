import { BanglaPaperMode } from '../bangla1st/bangla1stDefaults';

export function isDakhilAqaidFiqh(subject?: string, subjectCode?: string): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  if (s.includes('আল ফিকহ') || c === '২০৩' || c === '২০৪') return false;
  return s.includes('আকাইদ') || (s.includes('ফিকহ') && !s.includes('হাদিস'));
}

export function isAlimFiqh1st(subject?: string, subjectCode?: string): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  return (
    c === '২০৩' ||
    s.includes('الفقه الأول') ||
    (s.includes('ফিকহ') && (s.includes('১ম') || s.includes('প্রথম')))
  );
}

export function isAlimFiqh2nd(subject?: string, subjectCode?: string): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  return (
    c === '২০৪' ||
    s.includes('الفقه الثاني') ||
    s.includes('أصول الفقه') ||
    (s.includes('ফিকহ') &&
      (s.includes('২য়') || s.includes('২য়') || s.includes('দ্বিতীয়') || s.includes('দ্বিতীয়')))
  );
}

export function isAlimFiqhPaper(subject?: string, subjectCode?: string): boolean {
  return isAlimFiqh1st(subject, subjectCode) || isAlimFiqh2nd(subject, subjectCode);
}

export function getAqaidFiqhInstructions(mode: BanglaPaperMode): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  if (mode === 'MCQ_ONLY_30') {
    return {
      timeAllowed: '৪০ মিনিট',
      totalMarks: 40,
      generalInstructions: [
        'বিশেষ দ্রষ্টব্য: প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের উত্তর দিতে হবে (১×৪০ = ৪০)।',
      ],
    };
  }
  if (mode === 'CQ_ONLY_70') {
    return {
      timeAllowed: '২ ঘণ্টা ২০ মিনিট',
      totalMarks: 60,
      generalInstructions: [
        'দ্রষ্টব্য: প্রতিটি বিভাগের শিরোনামের নিচে প্রদত্ত নির্দেশনা অনুযায়ী মোট ৬টি প্রশ্নের উত্তর দাও (১০×৬ = ৬০)।',
      ],
    };
  }
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      'দ্রষ্টব্য: বহুনির্বাচনি অংশে ৪০টি প্রশ্নের সকলটির উত্তর (১×৪০=৪০) এবং রচনামূলক অংশে খ–চ বিভাগ থেকে নির্দেশনা অনুযায়ী মোট ৬টি প্রশ্নের উত্তর (১০×৬=৬০) দিতে হবে।',
    ],
  };
}

export function getAlimFiqhInstructions(isSecondPaper: boolean): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: isSecondPaper
      ? []
      : ['الملاحظة : أجب عن خمسة فقط والدرجات متساوية'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: DAKHIL (CLASS 6–10) AQAID & FIQH WRITTEN SECTIONS (60 MARKS)
// ─────────────────────────────────────────────────────────────────────────────

export interface AqaidFiqhQuestionItem {
  id: string;
  text: string;
  placeholder: string;
}

export interface AqaidFiqhSectionConfig {
  id: string;
  titleLine: string; // e.g. খ বিভাগ—আকাইদ
  instructionLine: string; // e.g. (যে কোনো একটি প্রশ্নের উত্তর দাও)
  marksLine: string; // e.g. মান—১০×১=১০
  sectionMarks: number;
  questions: AqaidFiqhQuestionItem[];
}

export const DEFAULT_AQAID_FIQH_SECTIONS: AqaidFiqhSectionConfig[] = [
  {
    id: 'aqaid_sec_kha',
    titleLine: 'খ বিভাগ—আকাইদ',
    instructionLine: '(যে কোনো একটি প্রশ্নের উত্তর দাও)',
    marksLine: 'মান—১০×১=১০',
    sectionMarks: 10,
    questions: [
      {
        id: 'aq_q1',
        text: '',
        placeholder:
          'إسلام এর শাব্দিক ও পারিভাষিক পরিচয় দাও। "নিশ্চয়ই আল্লাহর কাছে একমাত্র মনোনীত দীন ইসলাম"—ব্যাখ্যা কর।',
      },
      {
        id: 'aq_q2',
        text: '',
        placeholder:
          "معجزة কাকে বলে? ৩ জন নবি ও রসূলের ১টি করে মু'জিযার বর্ণনা দাও। মুহাম্মাদ (সা) এর উপর অবতীর্ণ চিরস্থায়ী মু'জিযা কোনটি? বুঝিয়ে লেখ।",
      },
    ],
  },
  {
    id: 'aqaid_sec_ga',
    titleLine: 'গ বিভাগ—ফিকহ',
    instructionLine: '(যে কোনো দুটি প্রশ্নের উত্তর দাও)',
    marksLine: 'মান—১০×২=২০',
    sectionMarks: 20,
    questions: [
      {
        id: 'aq_q3',
        text: '',
        placeholder:
          'طهارة শব্দের অর্থ কী? وضوء ভঙ্গের কারণসমূহ কয়টি ও কী কী? কোন কোন পানি দ্বারা طهارة অর্জন করা জায়েয এবং কোন কোন পানি দ্বারা জায়েয নয়? লেখ।',
      },
      {
        id: 'aq_q4',
        text: '',
        placeholder: 'مسافر কাকে বলে? مسافر ব্যক্তির নামাজ আদায়ের পদ্ধতি বর্ণনা কর।',
      },
      {
        id: 'aq_q5',
        text: '',
        placeholder: 'حج এর সংজ্ঞা দাও। حج কত প্রকার ও কী কী? حج এর মিকাতগুলো বিস্তারিত লেখ।',
      },
    ],
  },
  {
    id: 'aqaid_sec_gha',
    titleLine: 'ঘ বিভাগ—উসূলুল ফিকহ',
    instructionLine: '(যে কোনো একটি প্রশ্নের উত্তর দাও)',
    marksLine: 'মান—১০×১=১০',
    sectionMarks: 10,
    questions: [
      {
        id: 'aq_q6',
        text: '',
        placeholder: 'عام কাকে বলে? عام কত প্রকার ও কী কী? প্রত্যেক প্রকারের বর্ণনা দাও।',
      },
      {
        id: 'aq_q7',
        text: '',
        placeholder:
          'أمر এর সংজ্ঞা দাও। أمر এর حكم কী? فعل الرسول صلى الله عليه وسلم উম্মতের জন্য واجب কি-না? ইমামদের মতামতসহ বর্ণনা কর।',
      },
    ],
  },
  {
    id: 'aqaid_sec_uma',
    titleLine: 'ঙ বিভাগ—আখলাক',
    instructionLine: '(যে কোনো একটি প্রশ্নের উত্তর দাও)',
    marksLine: 'মান—১০×১=১০',
    sectionMarks: 10,
    questions: [
      {
        id: 'aq_q8',
        text: '',
        placeholder: 'দুঃস্থ, অসহায় ও রোগীর সেবা সম্পর্কে হাদিসের আলোকে বর্ণনা কর।',
      },
      {
        id: 'aq_q9',
        text: '',
        placeholder: 'الصدق এর সংজ্ঞা দাও। সত্যবাদিতার প্রয়োজনীয়তা এবং সুফল বর্ণনা কর।',
      },
    ],
  },
  {
    id: 'aqaid_sec_cha',
    titleLine: 'চ বিভাগ—ইলমুল ফিকহ ও উসূলুল ফিকহের ইতিহাস',
    instructionLine: '(যে কোনো একটি প্রশ্নের উত্তর দাও)',
    marksLine: 'মান—১০×১=১০',
    sectionMarks: 10,
    questions: [
      {
        id: 'aq_q10',
        text: '',
        placeholder: 'কুদুরি গ্রন্থ প্রণেতার জীবনী আলোচনা কর।',
      },
      {
        id: 'aq_q11',
        text: '',
        placeholder:
          'ইমাম আবু হানিফা (র) এর জীবনী এবং ফিকহ শাস্ত্রে তাঁর অবদান সংক্ষেপে লেখ।',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: ALIM (1ST & 2ND YEAR) — AL-FIQH 1ST PAPER (203) & 2ND PAPER (204)
// ─────────────────────────────────────────────────────────────────────────────

export interface AlimFiqhQuestionItem {
  id: string;
  arabicText: string;
  arabicPlaceholder: string;
  includeBengali: boolean;
  bengaliText: string;
  bengaliPlaceholder: string;
}

export interface AlimFiqhSectionConfig {
  id: string;
  headerLines: string[]; // Centered underlined Arabic header lines
  sectionLabelBn: string; // Friendly Bengali label in modal
  sectionMarks: number;
  questions: AlimFiqhQuestionItem[];
}

export const DEFAULT_ALIM_FIQH_1ST_SECTIONS: AlimFiqhSectionConfig[] = [
  {
    id: 'alim_f1_main',
    headerLines: ['الملاحظة : أجب عن خمسة فقط والدرجات متساوية'],
    sectionLabelBn: 'আল ফিকহ প্রথম পত্র (৭টি প্রশ্ন থেকে যেকোনো ৫টি — ২০×৫ = ১০০)',
    sectionMarks: 100,
    questions: [
      {
        id: 'af1_q1',
        arabicText: '',
        arabicPlaceholder:
          'عرف الحج لغة وشرعا - ما المراد بالحج الاكبر؟ هل الحج واجب على الفور ام على التراخى؟ بين مع اختلاف الائمة-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder:
          'হজের শাব্দিক ও পারিভাষিক সংজ্ঞা দাও। হজে আকবর বলতে কী বোঝায়? ইমামদের মতানৈক্যসহ আলোচনা কর।',
      },
      {
        id: 'af1_q2',
        arabicText: '',
        arabicPlaceholder:
          'عرف العمرة- ثم بين الفرق بينها وبين الحج مع بيان مع الاحصار مفصلا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'উমরার সংজ্ঞা দাও। হজ ও উমরার মধ্যে পার্থক্য বিস্তারিত আলোচনা কর।',
      },
      {
        id: 'af1_q3',
        arabicText: '',
        arabicPlaceholder:
          'ما معنى النكاح لغة وشرعا ؟ وما حكمه وشرطه وعلله ؟ وما الفرق بين النكاح والبيع ؟ بين بالتفصيل-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'নিকাহের শাব্দিক ও পারিভাষিক অর্থ কী? এর হুকুম, শর্ত ও ক্রয়-বিক্রয়ের সাথে পার্থক্য লেখ।',
      },
      {
        id: 'af1_q4',
        arabicText: '',
        arabicPlaceholder:
          'عرف الطلاق - وكم قسما له بنسبة الفاظ الوقوع والحكم؟ بين مع ذكر الصريح والكناية مع بيان حكمهما بالتفصيل-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'তালাকের সংজ্ঞা দাও। শব্দ ও হুকুমের দিক থেকে তালাক কত প্রকার? বিস্তারিত বর্ণনা কর।',
      },
      {
        id: 'af1_q5',
        arabicText: '',
        arabicPlaceholder: 'ما هو المهر ؟ ومتى يجب المهر ؟ وبين أقل مقدار المهر مدللا ؟',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'মোহর কী? কখন মোহর ওয়াজিব হয়? প্রমাণসহ মোহরের সর্বনিম্ন পরিমাণ বর্ণনা কর।',
      },
      {
        id: 'af1_q6',
        arabicText: '',
        arabicPlaceholder:
          'عرف الصيد لغة وشرعا؟ هل الصيد مخصوص بالكلب ام لا؟ وما هي شرائط حل الصيد؟ بين واضحا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'শিকারের শাব্দিক ও পারিভাষিক সংজ্ঞা দাও। শিকার হালাল হওয়ার শর্তসমূহ স্পষ্টভাবে লেখ।',
      },
      {
        id: 'af1_q7',
        arabicText: '',
        arabicPlaceholder:
          'عرف الذبيحة- بما يجب الذبيح وبما لا؟ بين حكم ذبيحة مجنون و تارك التسمية بالوضاحة-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'যবেহের সংজ্ঞা দাও। পাগল ও বিসমিল্লাহ ত্যাগকারীর যবেহের হুকুম স্পষ্টভাবে বর্ণনা কর।',
      },
    ],
  },
];

export const DEFAULT_ALIM_FIQH_2ND_SECTIONS: AlimFiqhSectionConfig[] = [
  {
    id: 'alim_f2_usul',
    headerLines: [
      'أصول الفقه : الدرجات : ١٥ × ٤ = ٦٠',
      '(أجب عن أربعة فقط والدرجة متساوية)',
    ],
    sectionLabelBn: '১ম বিভাগ: أصول الفقه — উসূলুল ফিকহ (৭টি থেকে ৪টি = ৬০ নম্বর)',
    sectionMarks: 60,
    questions: [
      {
        id: 'af2_q1',
        arabicText: '',
        arabicPlaceholder:
          'ما معنى اصول الشرع؟ وما الفرق بينه وبين اصول الفقه؟ وما موضوعه وغرضه؟ بين مفصلا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'উসূলে শরয়ের অর্থ কী? এর সাথে উসূলুল ফিকহের পার্থক্য, আলোচ্য বিষয় ও উদ্দেশ্য বিস্তারিত লেখ।',
      },
      {
        id: 'af2_q2',
        arabicText: '',
        arabicPlaceholder:
          'عرف الكتاب لغة واصطلاحا مع بيان فوائد قيوده - ثم أوضح هل القرآن اسم للنظم والمعنى جميعا أم لا ؟',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'কিতাবের শাব্দিক ও পারিভাষিক সংজ্ঞা দাও। কুরআন কি শব্দ ও অর্থ উভয়ের নাম? ব্যাখ্যা কর।',
      },
      {
        id: 'af2_q3',
        arabicText: '',
        arabicPlaceholder:
          'علام فرع المصنف (رح) بقوله "فلا يجوز الحاق التعديل بامر الركوع والسجود على سبيل الفرض"؟ أوضح مع بيان اختلاف الأئمة-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'গ্রন্থকারের উক্ত বক্তব্যের ওপর কী মাসআলা নির্গত হয়েছে? ইমামদের মতানৈক্যসহ ব্যাখ্যা কর।',
      },
      {
        id: 'af2_q4',
        arabicText: '',
        arabicPlaceholder: 'ما هو الخاص ؟ ثم اذكر حكمه وأقسامه بالوضاحة-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'খাস কাকে বলে? এর হুকুম ও প্রকারসমূহ স্পষ্টভাবে উল্লেখ কর।',
      },
      {
        id: 'af2_q5',
        arabicText: '',
        arabicPlaceholder:
          'عرف النهى لغة واصطلاحا مع بيان فوائد قيوده ؟ هل فعل النبي صلى الله عليه وسلم موجب على الأمة ؟ بين مع الدلائل -',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'নাহির শাব্দিক ও পারিভাষিক সংজ্ঞা দাও। নবিজির (সা) কাজ উম্মতের ওপর ওয়াজিব কি-না? দলিলসহ লেখ।',
      },
      {
        id: 'af2_q6',
        arabicText: '',
        arabicPlaceholder:
          'عرف الاداء والقضاء- هل يجوز الاداء بنية القضاء والقضاء بنية الاداء؟ بين مفصلا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'আদা ও কাজা কাকে বলে? কাজার নিয়তে আদা ও আদার নিয়তে কাজা জায়েয কি-না? বিস্তারিত লেখ।',
      },
      {
        id: 'af2_q7',
        arabicText: '',
        arabicPlaceholder: 'ما معنى الحقيقة لغة واصطلاحا ؟ ثم اذكر حكمها وأقسامها بالتفصيل-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'হাকিকতের শাব্দিক ও পারিভাষিক অর্থ কী? এর হুকুম ও প্রকারসমূহ বিস্তারিত উল্লেখ কর।',
      },
    ],
  },
  {
    id: 'alim_f2_faraid_a',
    headerLines: [
      'الفرائض : الدرجات : ٤٠',
      '(أ) الدرجات : ١٥ × ٢ = ٣٠',
      '(أجب عن اثنين فقط والدرجات متساوية)',
    ],
    sectionLabelBn: '২য় বিভাগ (أ): الفرائض — আল-ফারায়িয (৪টি থেকে ২টি = ৩০ নম্বর)',
    sectionMarks: 30,
    questions: [
      {
        id: 'af2_q8',
        arabicText: '',
        arabicPlaceholder:
          'عرف علم الفرائض- اذكر مع بيان موضوعه وغرضه مع بيان وجه التسميته-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'ইলমুল ফারায়িযের সংজ্ঞা, আলোচ্য বিষয়, উদ্দেশ্য ও নামকরণের কারণ বর্ণনা কর।',
      },
      {
        id: 'af2_q9',
        arabicText: '',
        arabicPlaceholder: 'اذكر أحوال الأخت لأب وأم بالتمثيل -',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'সহোদর বোনের (মীরাসের) অবস্থাগুলো উদাহরণসহ উল্লেখ কর।',
      },
      {
        id: 'af2_q10',
        arabicText: '',
        arabicPlaceholder:
          'ما معنى المانع؟ لغة واصطلاحا- ثم بين اقسام الموانع من الارث موضحا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'মানে (প্রতিবন্ধক)-এর শাব্দিক ও পারিভাষিক অর্থ কী? মীরাসের প্রতিবন্ধকসমূহ ব্যাখ্যা কর।',
      },
      {
        id: 'af2_q11',
        arabicText: '',
        arabicPlaceholder: 'عرف الجد الصحيح- ثم بين احوال الجد الصحيح مفصلا وممثلا-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'জাদ্দে সহিহ কাকে বলে? উদাহরণসহ জাদ্দে সহিহ-এর অবস্থাসমূহ বিস্তারিত বর্ণনা কর।',
      },
    ],
  },
  {
    id: 'alim_f2_faraid_b',
    headerLines: [
      '(ب) الدرجات : ١٠ × ١ = ١٠',
      '(أجب عن واحد فقط)',
    ],
    sectionLabelBn: '২য় বিভাগ (ب): الفرائض — মীরাস বণ্টন / মাসআলা (২টি থেকে ১টি = ১০ নম্বর)',
    sectionMarks: 10,
    questions: [
      {
        id: 'af2_q12',
        arabicText: '',
        arabicPlaceholder:
          'مات رجل عن أب وبنت وزوجة – بين الحالات مع ذكر المسئلة والاسهم-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'এক ব্যক্তি পিতা, কন্যা ও স্ত্রী রেখে মারা গেল—মাসআলা ও অংশসহ সবার অবস্থা বর্ণনা কর।',
      },
      {
        id: 'af2_q13',
        arabicText: '',
        arabicPlaceholder: 'بين احوال بنات الابن بالتمثيل-',
        includeBengali: false,
        bengaliText: '',
        bengaliPlaceholder: 'পৌত্রীদের (ছেলের মেয়ের) অবস্থাসমূহ উদাহরণসহ বর্ণনা কর।',
      },
    ],
  },
];

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export function toArabicNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? ARABIC_INDIC_DIGITS[Number(ch)] : ch))
    .join('');
}
