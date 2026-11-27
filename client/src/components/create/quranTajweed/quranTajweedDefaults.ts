import { BanglaPaperMode, isAlimGrade } from '../bangla1st/bangla1stDefaults';

export function isAlimQuranPaper(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  const g = grade || '';

  if (c === '২০১' || s.includes('القرآن المجيد') || s.includes('القران المجيد')) {
    return true;
  }

  const isQuranName =
    s.includes('কুরআন') || s.includes('কোরআন') || s.includes('তাজবীদ') || s.includes('তাজভিদ');
  const isAlim = isAlimGrade(g) || g.includes('العالم') || g.includes('عالم');

  return isQuranName && isAlim;
}

export function isDakhilJuniorGrade(grade?: string): boolean {
  const g = grade || '';
  return (
    g.includes('৫ম') ||
    g.includes('৬ষ্ঠ') ||
    g.includes('৭ম') ||
    g.includes('৮ম') ||
    g.includes('ষষ্ঠ') ||
    g.includes('সপ্তম') ||
    g.includes('অষ্টম') ||
    g.includes('জেডিসি') ||
    g.includes('ইবতেদায়ী') ||
    g.includes('ইবতেদায়ী') ||
    /\b(5|6|7|8)\b/.test(g)
  );
}

export function isDakhilJuniorQuran(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (isAlimQuranPaper(subject, subjectCode, grade)) return false;
  const s = subject || '';
  const isQuranName =
    s.includes('কুরআন') ||
    s.includes('কোরআন') ||
    s.includes('তাজবীদ') ||
    s.includes('তাজভিদ');
  return isQuranName && isDakhilJuniorGrade(grade);
}

export function isDakhilQuranTajweed(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (isAlimQuranPaper(subject, subjectCode, grade)) return false;
  if (isDakhilJuniorGrade(grade)) return false;
  const s = subject || '';
  return (
    s.includes('কুরআন') ||
    s.includes('কোরআন') ||
    s.includes('তাজবীদ') ||
    s.includes('তাজভিদ')
  );
}

export function getDakhilJuniorQuranInstructions(mode: BanglaPaperMode): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  if (mode === 'MCQ_ONLY_30') {
    return {
      timeAllowed: '২০ মিনিট',
      totalMarks: 20,
      generalInstructions: [
        'বিশেষ দ্রষ্টব্য: প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের উত্তর দিতে হবে (১×২০ = ২০)।',
      ],
    };
  }
  if (mode === 'CQ_ONLY_70') {
    return {
      timeAllowed: '২ ঘণ্টা ৪০ মিনিট',
      totalMarks: 80,
      generalInstructions: [
        '[দ্রষ্টব্য : ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। লিখিত ৬৫ + মৌখিক ১৫ = ৮০]',
      ],
    };
  }
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      '[দ্রষ্টব্য : ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। বহুনির্বাচনি ২০ + লিখিত ৬৫ + মৌখিক ১৫ = ১০০]',
    ],
  };
}

export function getDakhilQuranInstructions(mode: BanglaPaperMode): {
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
        'দ্রষ্টব্য: খ বিভাগ থেকে ৪টি (১০×৪=৪০), গ বিভাগ থেকে ২টি (৫×২=১০) এবং ঘ বিভাগ থেকে ২টি (৫×২=১০) প্রশ্নের উত্তর দাও।',
      ],
    };
  }
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      'দ্রষ্টব্য: বহুনির্বাচনি অংশে ৪০টি প্রশ্নের সকলটির উত্তর (১×৪০=৪০) এবং রচনামূলক অংশে খ, গ ও ঘ বিভাগ থেকে নির্দেশনা অনুযায়ী উত্তর (৬০) দিতে হবে।',
    ],
  };
}

export function getAlimQuranInstructions(): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  return {
    timeAllowed: 'ثلاث ساعات',
    totalMarks: 100,
    generalInstructions: ['[الملاحظة : أجب عن ستة من مجموعة ( أ ) وعن واحد من مجموعة ( ب ) -]'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: DAKHIL (CLASS 6–10) QURAN MAJID & TAJWEED WRITTEN (60 MARKS)
// ─────────────────────────────────────────────────────────────────────────────

export interface DakhilQuranAyatQuestion {
  id: string;
  kaInstruction: string;
  kaAyat: string;
  kaAyatPlaceholder: string;
  kaMarks: number;
  khaText: string;
  khaPlaceholder: string;
  khaArabicLine: string;
  khaArabicPlaceholder?: string;
  khaMarks: number;
  gaInstruction: string;
  gaWords: string;
  gaWordsPlaceholder: string;
  gaMarks: number;
}

export interface DakhilQuranSurahGroup {
  id: string;
  surahName: string;
  questions: DakhilQuranAyatQuestion[];
}

export interface DakhilQuranShortItem {
  id: string;
  text: string;
  placeholder: string;
  marks: number;
}

export interface DakhilQuranWrittenState {
  startNumber: number; // default 2 (since 1 is MCQ)
  khaTitle: string;
  khaInstruction: string;
  khaMarksLine: string;
  surahGroups: DakhilQuranSurahGroup[];
  gaTitle: string;
  gaInstruction: string;
  gaMarksLine: string;
  gaQuestions: DakhilQuranShortItem[];
  ghaTitle: string;
  ghaInstruction: string;
  ghaMarksLine: string;
  ghaQuestions: DakhilQuranShortItem[];
}

export const DEFAULT_DAKHIL_QURAN_WRITTEN: DakhilQuranWrittenState = {
  startNumber: 2,
  khaTitle: 'খ বিভাগ—কুরআন মাজিদ',
  khaInstruction: '(সূরা আলে ইমরান থেকে কমপক্ষে একটিসহ যে কোনো চারটি প্রশ্নের উত্তর দাও)',
  khaMarksLine: 'মান—১০×৪=৪০',
  surahGroups: [
    {
      id: 'surah_baqara',
      surahName: 'সূরা আল-বাকারা',
      questions: [
        {
          id: 'dq_q2',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُمْ بِمُؤْمِنِينَ- يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنْفُسَهُمْ وَمَا يَشْعُرُونَ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'আয়াতে কারিমাগুলোর শানে নুযূল লেখ।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'يُخَادِعُونَ، آمَنُوا، يَشْعُرُونَ، أَنْفُسَ-',
          gaMarks: 2,
        },
        {
          id: 'dq_q3',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً قَالُوا أَتَجْعَلُ فِيهَا مَنْ يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'سجدة التعظيم কাকে বলে? ইসলামের দৃষ্টিতে এর হুকুম আলোচনা কর।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'خَلِيفَةً، جَاعِلٌ، نُسَبِّحُ، أَعْلَمُ-',
          gaMarks: 2,
        },
        {
          id: 'dq_q4',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ- وَلَا تَقُولُوا لِمَنْ يُقْتَلُ فِي سَبِيلِ اللَّهِ أَمْوَاتٌ بَلْ أَحْيَاءٌ وَلَكِنْ لَا تَشْعُرُونَ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'সবর কাকে বলে? সবর কত প্রকার ও কী কী? লেখ।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'اسْتَعِينُوا، أَمْوَاتٌ، لَا تَشْعُرُونَ، بَشِّرْ-',
          gaMarks: 2,
        },
        {
          id: 'dq_q5',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ- أَيَّامًا مَعْدُودَاتٍ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'অসুস্থ ও মুসাফিরের জন্য রোজা রাখার হুকুম কী? লেখ।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'تَطَوَّعَ، كُتِبَ، تَتَّقُونَ، أَيَّامًا-',
          gaMarks: 2,
        },
      ],
    },
    {
      id: 'surah_ale_imran',
      surahName: 'সূরা আলে ইমরান',
      questions: [
        {
          id: 'dq_q6',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'الم- اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ- نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ وَأَنْزَلَ التَّوْرَاةَ وَالْإِنْجِيلَ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'الم- الله لا اله الا هو الحى القيوم ........ الخ এর শানে নুযূল লেখ।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'الْفُرْقَانَ، نَزَّلَ، لَا يَخْفَى، يُصَوِّرُ-',
          gaMarks: 2,
        },
        {
          id: 'dq_q7',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'قُلْ إِنْ كُنْتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ وَاللَّهُ غَفُورٌ رَحِيمٌ-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'তারকিব কর:',
          khaArabicLine: '',
          khaArabicPlaceholder: 'فَإِنَّ اللَّهَ لَا يُحِبُّ الْكَافِرِينَ-',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'لَا يُحِبُّ، اصْطَفَى، الْعَالَمِينَ، نَذَرْتُ-',
          gaMarks: 2,
        },
        {
          id: 'dq_q8',
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaAyat: '',
          kaAyatPlaceholder:
            'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ- وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا-',
          kaMarks: 5,
          khaText: '',
          khaPlaceholder: 'اِتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ আয়াতাংশের ব্যাখ্যা কর।',
          khaArabicLine: '',
          khaMarks: 3,
          gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          gaWords: '',
          gaWordsPlaceholder: 'اتَّقُوا، مُسْلِمُونَ، يُبَيِّنُ، وَلَا تَفَرَّقُوا-',
          gaMarks: 2,
        },
      ],
    },
  ],
  gaTitle: 'গ বিভাগ—নির্বাচিত বিষয়সমূহ',
  gaInstruction: '(যে কোনো দুটি প্রশ্নের উত্তর দাও)',
  gaMarksLine: 'মান—৫×২=১০',
  gaQuestions: [
    {
      id: 'dq_ga1',
      text: '',
      placeholder: 'غُلُولٌ বা দুর্নীতি বলতে কী বুঝ? দুর্নীতির হুকুম ও কুফল বর্ণনা কর।',
      marks: 5,
    },
    {
      id: 'dq_ga2',
      text: '',
      placeholder: 'رِبَا বা সুদ কাকে বলে? رِبَا কত প্রকার ও কী কী? এর কুফল বর্ণনা কর।',
      marks: 5,
    },
    {
      id: 'dq_ga3',
      text: '',
      placeholder: '"ইসলাম একটি পূর্ণাঙ্গ জীবন ব্যবস্থা"—ব্যাখ্যা কর।',
      marks: 5,
    },
    {
      id: 'dq_ga4',
      text: '',
      placeholder:
        'إِطَاعَةُ الرَّسُولِ বলতে কী বুঝ? আল্লাহ তায়ালার ভালোবাসা পেতে রসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম এর আনুগত্যের গুরুত্ব বর্ণনা কর।',
      marks: 5,
    },
  ],
  ghaTitle: 'ঘ বিভাগ—তাজভিদ',
  ghaInstruction: '(যে কোনো দুটি প্রশ্নের উত্তর দাও)',
  ghaMarksLine: 'মান—৫×২=১০',
  ghaQuestions: [
    {
      id: 'dq_gha1',
      text: '',
      placeholder: 'لَحَنٌ কাকে বলে? لَحَنٌ কত প্রকার ও কী কী? প্রত্যেক প্রকার উদাহরণসহ লেখ।',
      marks: 5,
    },
    {
      id: 'dq_gha2',
      text: '',
      placeholder: 'নূন সাকিন ও তানভিন কাকে বলে? তা কত প্রকার ও কী কী? উদাহরণসহ লেখ।',
      marks: 5,
    },
    {
      id: 'dq_gha3',
      text: '',
      placeholder: 'مِيمٌ سَاكِنٌ কাকে বলে? তা পড়ার নিয়ম কয়টি ও কী কী? উদাহরণসহ লেখ।',
      marks: 5,
    },
    {
      id: 'dq_gha4',
      text: '',
      placeholder: 'مَدٌّ কাকে বলে? مد فرعى কত প্রকার ও কী কী? লেখ।',
      marks: 5,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: ALIM QURAN MAJID (CODE 201, 100% ARABIC RTL, 100 MARKS)
// ─────────────────────────────────────────────────────────────────────────────

export interface AlimQuranGroupAItem {
  id: string;
  ayatText: string;
  ayatPlaceholder: string;
  ayatMarks: number;
  subAText: string;
  subAPlaceholder: string;
  subAMarks: number;
  subBText: string;
  subBPlaceholder: string;
  subBMarks: number;
}

export interface AlimQuranGroupBItem {
  id: string;
  text: string;
  placeholder: string;
  marks: number;
}

export interface AlimQuranState {
  groupATitle: string;
  groupAMarksLine: string;
  groupAInstruction: string;
  groupAItems: AlimQuranGroupAItem[];
  groupBTitle: string;
  groupBMarksLine: string;
  groupBItems: AlimQuranGroupBItem[];
}

export const DEFAULT_ALIM_QURAN_STATE: AlimQuranState = {
  groupATitle: 'مجموعة ( أ )',
  groupAMarksLine: 'الدرجات—٩٠',
  groupAInstruction: '(ترجم الآيات الكريمة ثم أجب عن الأسئلة الملحقة)',
  groupAItems: [
    {
      id: 'aq_a1',
      ayatText: '',
      ayatPlaceholder:
        'حرمت عليكم أمهاتكم وبناتكم وأخواتكم وعماتكم وخالاتكم وبنات الأخ وبنات الأخت وأمهاتكم اللاتي أرضعنكم وأخواتكم من الرضاعة ... إن الله كان غفورا رحيما-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'بين سبب نزول هذه الآيات الكريمة-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : حُرِّمَتْ، لَمْ تَكُونُوا، أَصْلَابَ-',
      subBMarks: 3,
    },
    {
      id: 'aq_a2',
      ayatText: '',
      ayatPlaceholder:
        'إنا أنزلنا إليك الكتاب بالحق لتحكم بين الناس بما أراك الله ولا تكن للخائنين خصيما- واستغفر الله إن الله كان غفورا رحيما-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'بين سبب نزول هذه الآيات الكريمة-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : أَنْزَلْنَا، لَا يُحِبُّ، مُحِيطًا-',
      subBMarks: 3,
    },
    {
      id: 'aq_a3',
      ayatText: '',
      ayatPlaceholder:
        'يا أيها الذين آمنوا إذا قمتم إلى الصلاة فاغسلوا وجوهكم وأيديكم إلى المرافق وامسحوا برءوسكم وأرجلكم إلى الكعبين ... لعلكم تشكرون-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'ما معنى التيمم؟ وما فرائضه؟ بين-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : آمَنُوا، قُمْتُمْ، اِمْسَحُوا-',
      subBMarks: 3,
    },
    {
      id: 'aq_a4',
      ayatText: '',
      ayatPlaceholder:
        'إذ قال الحواريون يا عيسى ابن مريم هل يستطيع ربك أن ينزل علينا مائدة من السماء قال اتقوا الله إن كنتم مؤمنين ... فإني أعذبه عذابا لا أعذبه أحدا من العالمين-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'من الحواريون؟ بين-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : يَسْتَطِيعُ، أُعَذِّبُ، نَأْكُلَ-',
      subBMarks: 3,
    },
    {
      id: 'aq_a5',
      ayatText: '',
      ayatPlaceholder:
        'الحمد لله الذي خلق السماوات والأرض وجعل الظلمات والنور ثم الذين كفروا بربهم يعدلون- هو الذي خلقكم من طين ثم قضى أجلا ...',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'ما المراد بالظلمات والنور؟ بين-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : خَلَقَكُمْ، تَمْتَرُونَ، تَكْسِبُونَ-',
      subBMarks: 3,
    },
    {
      id: 'aq_a6',
      ayatText: '',
      ayatPlaceholder:
        'يا بني آدم قد أنزلنا عليكم لباسا يواري سوآتكم وريشا ولباس التقوى ذلك خير ... قل إن الله لا يأمر بالفحشاء أتقولون على الله ما لا تعلمون-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: "ما المراد بقوله تعالى 'لباس التقوى'؟ بين-",
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : لَا يَفْتِنَنَّ، وَجَدْنَا، يَذَّكَّرُونَ-',
      subBMarks: 3,
    },
    {
      id: 'aq_a7',
      ayatText: '',
      ayatPlaceholder:
        'واعلموا أنما غنمتم من شيء فإن لله خمسه وللرسول ولذي القربى واليتامى والمساكين وابن السبيل ... وإن الله لسميع عليم-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'ما الفرق بين الغنيمة والفيء؟ بين بالاختصار-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : غَنِمْتُمْ، يَحْيَ، الدُّنْيَا-',
      subBMarks: 3,
    },
    {
      id: 'aq_a8',
      ayatText: '',
      ayatPlaceholder:
        'لقد نصركم الله في مواطن كثيرة ويوم حنين إذ أعجبتكم كثرتكم فلم تغن عنكم شيئا وضاقت عليكم الأرض بما رحبت ... ثم يتوب الله من بعد ذلك على من يشاء والله غفور رحيم-',
      ayatMarks: 9,
      subAText: '',
      subAPlaceholder: 'بين سبب نزول هذه الآيات الكريمة-',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق الكلمات : ضَاقَتْ، مُدْبِرِينَ، لَمْ تُغْنِ-',
      subBMarks: 3,
    },
  ],
  groupBTitle: 'مجموعة ( ب )',
  groupBMarksLine: 'الدرجات—١٠',
  groupBItems: [
    {
      id: 'aq_b1',
      text: '',
      placeholder: 'بين سبب نزول سورة النساء مع ذكر وجه تسميتها-',
      marks: 10,
    },
    {
      id: 'aq_b2',
      text: '',
      placeholder: 'بين سبب نزول سورة الأنفال مع ذكر وجه تسميتها-',
      marks: 10,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 0: DAKHIL CLASS 6–8 QURAN MAJID & TAJWEED (WRITTEN 65 + ORAL 15 = 80)
// ─────────────────────────────────────────────────────────────────────────────

export interface DakhilJuniorQuranState {
  startNumber: number; // default 2 (after MCQ 20)
  writtenBanner: string;
  // Q2: আয়াতের অনুবাদ (৫ × ৩ = ১৫)
  q2Title: string;
  q2MarksText: string;
  q2Marks: number;
  q2Ayats: { id: string; text: string; placeholder: string }[];
  // Q3: বর্ণনামূলক প্রশ্নের উত্তর দাও (৫ × ৩ = ১৫)
  q3Title: string;
  q3MarksText: string;
  q3Marks: number;
  q3Items: { id: string; text: string; placeholder: string }[];
  // Q4: তাহকিক কর (২ × ৫ = ১০)
  q4Title: string;
  q4MarksText: string;
  q4Marks: number;
  q4Words: string;
  q4Placeholder: string;
  // Q5: তারকিব কর (৫ × ১ = ৫)
  q5Title: string;
  q5MarksText: string;
  q5Marks: number;
  q5Items: { id: string; text: string; placeholder: string }[];
  // Q6: হরকতসহ সূরা/আয়াত মুখস্থ লিখ (৫ × ১ = ৫)
  q6Title: string;
  q6MarksText: string;
  q6Marks: number;
  q6Items: { id: string; text: string; placeholder: string }[];
  // Q7: বর্ণনামূলক প্রশ্নের উত্তর দাও — তাজভিদ (৫ × ২ = ১০)
  q7Title: string;
  q7MarksText: string;
  q7Marks: number;
  q7Items: { id: string; text: string; placeholder: string }[];
  // Q8: নিচে দাগ দেওয়া অংশগুলোর তাজভিদের কায়দা চিহ্নিত কর (১ × ৫ = ৫)
  q8Title: string;
  q8MarksText: string;
  q8Marks: number;
  q8Text: string;
  q8Placeholder: string;
  // Oral Banner
  oralBanner: string;
  // Q9: দেখে দেখে তিলাওয়াত কর (৫)
  q9Title: string;
  q9MarksText: string;
  q9Marks: number;
  q9Ayat: string;
  q9Placeholder: string;
  // Q10: তাজভিদের কায়দা বল (৫)
  q10Title: string;
  q10MarksText: string;
  q10Marks: number;
  q10Text: string;
  q10Placeholder: string;
  // Q11: সূরা মুখস্থ বলো (১টি) (৫)
  q11Title: string;
  q11MarksText: string;
  q11Marks: number;
  q11Items: { id: string; text: string; placeholder: string }[];
}

export const DEFAULT_DAKHIL_JUNIOR_QURAN: DakhilJuniorQuranState = {
  startNumber: 2,
  writtenBanner: 'লিখিত অংশ : মান-৬৫',
  q2Title: 'আয়াতের অনুবাদ লেখ (যেকোনো ৩টি) :',
  q2MarksText: '৫ × ৩ = ১৫',
  q2Marks: 15,
  q2Ayats: [
    {
      id: 'jq_2a',
      text: '',
      placeholder:
        'إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ مُبَارَكًا وَهُدًى لِلْعَالَمِينَ- فِيهِ آيَاتٌ بَيِّنَاتٌ مَقَامُ إِبْرَاهِيمَ ...',
    },
    {
      id: 'jq_2b',
      text: '',
      placeholder:
        'فَإِذَا قَضَيْتُمُ الصَّلَاةَ فَاذْكُرُوا اللَّهَ قِيَامًا وَقُعُودًا وَعَلَى جُنُوبِكُمْ ... إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا-',
    },
    {
      id: 'jq_2c',
      text: '',
      placeholder:
        'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ-',
    },
    {
      id: 'jq_2d',
      text: '',
      placeholder:
        'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا-',
    },
    {
      id: 'jq_2e',
      text: '',
      placeholder:
        'إِنَّ اللَّهَ لَا يَغْفِرُ أَنْ يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَلِكَ لِمَنْ يَشَاءُ وَمَنْ يُشْرِكْ بِاللَّهِ فَقَدْ ضَلَّ ضَلَالًا بَعِيدًا-',
    },
  ],
  q3Title: 'বর্ণনামূলক প্রশ্নের উত্তর দাও (যেকোনো ৩টি) :',
  q3MarksText: '৫ × ৩ = ১৫',
  q3Marks: 15,
  q3Items: [
    { id: 'jq_3a', text: '', placeholder: 'হজ্জের ফরয ও ওয়াজিবসমূহ লেখ।' },
    { id: 'jq_3b', text: '', placeholder: 'যিকিরের ফযিলত সম্পর্কে লেখ।' },
    { id: 'jq_3c', text: '', placeholder: 'দরুদ পাঠের ফযিলত বর্ণনা কর।' },
    { id: 'jq_3d', text: '', placeholder: 'পর্দার গুরুত্ব ও প্রয়োজনীয়তা সম্পর্কে আলোচনা কর।' },
    { id: 'jq_3e', text: '', placeholder: 'সমাজে প্রচলিত ৪টি দুর্নীতির ক্ষেত্র উল্লেখ করে তা ব্যাখ্যা কর।' },
  ],
  q4Title: 'তাহকিক কর (যেকোনো ৫টি) :',
  q4MarksText: '২ × ৫ = ১০',
  q4Marks: 10,
  q4Words: '',
  q4Placeholder: 'كَفَرَ - وُضِعَ - عُيُونٌ - رَتِّلْ - قُمْ - جَنَّاتٍ - أُدْعُ - النَّبِيُّ .',
  q5Title: 'তারকিব কর (যেকোনো ১টি) :',
  q5MarksText: '৫ × ১ = ৫',
  q5Marks: 5,
  q5Items: [
    { id: 'jq_5a', text: '', placeholder: 'فَإِنَّ اللَّهَ غَنِيٌّ عَنِ الْعَالَمِينَ' },
    { id: 'jq_5b', text: '', placeholder: 'أُجِيبُ دَعْوَةَ الدَّاعِ' },
  ],
  q6Title: 'হরকতসহ সূরা/আয়াত মুখস্থ লিখ (যেকোনো ১টি) :',
  q6MarksText: '৫ × ১ = ৫',
  q6Marks: 5,
  q6Items: [
    { id: 'jq_6a', text: '', placeholder: 'সূরা আল ফাজর ১-৫ আয়াত মুখস্থ লিখ।' },
    { id: 'jq_6b', text: '', placeholder: 'সূরা আল বালাদ ১-৫ আয়াত মুখস্থ লিখ।' },
  ],
  q7Title: 'বর্ণনামূলক প্রশ্নের উত্তর দাও :',
  q7MarksText: '৫ × ২ = ১০',
  q7Marks: 10,
  q7Items: [
    { id: 'jq_7a', text: '', placeholder: 'وَقْفٌ কাকে বলে? وَقْفٌ কত প্রকার ও কী কী? লেখ।' },
    { id: 'jq_7b', text: '', placeholder: 'سَكْتَةٌ কাকে বলে? কুরআনে কতস্থানে সাকতা করা হয়? আয়াতসহ উল্লেখ কর।' },
    { id: 'jq_7c', text: '', placeholder: 'সাকতা বলতে কী বুঝ?' },
  ],
  q8Title: 'নিচে দাগ দেওয়া অংশগুলোর তাজভিদের কায়দা চিহ্নিত কর (যেকোনো ৫টি) :',
  q8MarksText: '১ × ৫ = ৫',
  q8Marks: 5,
  q8Text: '',
  q8Placeholder:
    'مَنْ <u>ثَقُلَتْ</u> - عِيشَةٍ <u>رَّاضِيَةٍ</u> - مَنْ <u>خَفَّتْ</u> - يَوْمَئِذٍ عَنِ <u>النَّعِيمِ</u> - إِنَّ <u>الْإِنْسَانَ</u> - مَالًا <u>وَعَدَّدَهُ</u> - عَلَيْهِمْ <u>مُؤْصَدَةٌ</u> .',
  oralBanner: 'মৌখিক : মান-১৫',
  q9Title: 'দেখে দেখে তিলাওয়াত কর :',
  q9MarksText: '৫',
  q9Marks: 5,
  q9Ayat: '',
  q9Placeholder:
    'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ (٦) إِرَمَ ذَاتِ الْعِمَادِ (٧) الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ (٨) وَثَمُودَ الَّذِينَ جَابُوا الصَّخْرَ بِالْوَادِ (٩) وَفِرْعَوْنَ ذِي الْأَوْتَادِ (١٠)',
  q10Title: 'তাজভিদের কায়দা বল :',
  q10MarksText: '৫',
  q10Marks: 5,
  q10Text: '',
  q10Placeholder:
    'فِي جَنَّةٍ <u>عَالِيَةٍ</u> - أَعُوذُ <u>بِاللَّهِ</u> - عَيْنٌ <u>جَارِيَةٌ</u> - مِنْ <u>بَيْنِ</u> الصُّلْبِ - إِلَّا لِمَنِ <u>ارْتَضَى</u> .',
  q11Title: 'সূরা মুখস্থ বলো (১টি) :',
  q11MarksText: '৫',
  q11Marks: 5,
  q11Items: [
    { id: 'jq_11a', text: '', placeholder: 'সূরা আল আলা' },
    { id: 'jq_11b', text: '', placeholder: 'সূরা আল গাশিয়া।' },
  ],
};
