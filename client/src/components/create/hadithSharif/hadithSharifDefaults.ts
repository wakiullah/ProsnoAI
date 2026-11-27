import { BanglaPaperMode, isAlimGrade } from '../bangla1st/bangla1stDefaults';

export function isAlimHadithPaper(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  const g = grade || '';

  if (
    c === '২০২' ||
    c === '٢٠٢' ||
    c === '202' ||
    s.includes('الحديث وأصول الحديث') ||
    s.includes('الحديث واصول الحديث')
  ) {
    return true;
  }

  const isHadithName =
    s.includes('হাদিস') ||
    s.includes('হাদীস') ||
    s.toLowerCase().includes('hadith') ||
    s.includes('الحديث');
  const isAlim = isAlimGrade(g) || g.includes('العالم') || g.includes('عالم');

  return isHadithName && isAlim;
}

export function isDakhilHadith(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (isAlimHadithPaper(subject, subjectCode, grade)) return false;
  const s = subject || '';
  const c = subjectCode || '';
  const g = grade || '';

  if (
    g.includes('ফাযিল') ||
    g.includes('কামিল') ||
    g.includes('আলিম') ||
    g.includes('العالم')
  ) {
    return false;
  }

  return (
    s.includes('হাদিস') ||
    s.includes('হাদীস') ||
    s.toLowerCase().includes('hadith') ||
    (c === '১০২' && !s.includes('বাংলা'))
  );
}

export function getDakhilHadithInstructions(mode: BanglaPaperMode): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  if (mode === 'MCQ_ONLY_30') {
    return {
      timeAllowed: '৪০ মিনিট',
      totalMarks: 40,
      generalInstructions: [
        'বিশেষ দ্রষ্টব্য: ক বিভাগে মোট ৪০টি বহুনির্বাচনি প্রশ্ন রয়েছে। প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের উত্তর দিতে হবে (১×৪০ = ৪০)।',
      ],
    };
  }
  if (mode === 'CQ_ONLY_70') {
    return {
      timeAllowed: '২ ঘণ্টা ২০ মিনিট',
      totalMarks: 60,
      generalInstructions: [
        'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। খ বিভাগ থেকে যে কোনো ৫টি (১০×৫=৫০) এবং গ বিভাগ থেকে ১৩নং প্রশ্নসহ যে কোনো ২টি (৫×২=১০) প্রশ্নের উত্তর দাও।',
      ],
    };
  }
  return {
    timeAllowed: '৩ ঘণ্টা',
    totalMarks: 100,
    generalInstructions: [
      'দ্রষ্টব্য: ক বিভাগ (বহুনির্বাচনি) থেকে ৪০টি প্রশ্নের সকলটির উত্তর (১×৪০=৪০), খ বিভাগ থেকে যে কোনো ৫টি (১০×৫=৫০) এবং গ বিভাগ থেকে ১৩নং প্রশ্নসহ যে কোনো ২টি (৫×২=১০) প্রশ্নের উত্তর দিতে হবে।',
    ],
  };
}

export function getAlimHadithInstructions(): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  return {
    timeAllowed: 'ثلاث ساعات',
    totalMarks: 100,
    generalInstructions: ['[الملاحظة : أجب عن خمسة من مجموعة ( أ ) وعن إثنين من مجموعة (ب).]'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: DAKHIL (CLASS 6–10) HADITH SHARIF WRITTEN (60 MARKS: খ ৫০ + গ ১০)
// ─────────────────────────────────────────────────────────────────────────────

export interface DakhilHadithKhaQuestion {
  id: string;
  kaInstruction: string;
  kaHadith: string;
  kaHadithPlaceholder: string;
  kaMarks: number;
  khaHeading: string;
  khaAlifText: string;
  khaAlifPlaceholder: string;
  khaAlifMarks: number;
  khaBaInstruction: string;
  khaBaWords: string;
  khaBaWordsPlaceholder: string;
  khaBaMarks: number;
}

export interface DakhilHadithGaQuestion {
  id: string;
  text: string;
  placeholder: string;
  marks: number;
}

export interface DakhilHadithWrittenState {
  startNumber: number; // default 2 (since 1 is ক বিভাগ MCQ)
  khaTitle: string;
  khaInstruction: string;
  khaMarksLine: string;
  khaQuestions: DakhilHadithKhaQuestion[];
  gaTitle: string;
  gaInstruction: string;
  gaMarksLine: string;
  gaQuestions: DakhilHadithGaQuestion[];
}

export const DEFAULT_DAKHIL_HADITH_WRITTEN: DakhilHadithWrittenState = {
  startNumber: 2,
  khaTitle: 'খ বিভাগ',
  khaInstruction: '(যে কোনো পাঁচটি প্রশ্নের উত্তর দাও)',
  khaMarksLine: 'মান—১০×৫=৫০',
  khaQuestions: [
    {
      id: 'dh_q2',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن عبد الله بن عمر رضي الله تعالى عنه أن رجلا سأل رسول الله صلى الله عليه وسلم : أي الإسلام خير؟ قال تطعم الطعام وتقرأ السلام على من عرفت ومن لم تعرف- (متفق عليه)\nعن أبي هريرة رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم : لا تدخلون الجنة حتى تؤمنوا ولا تؤمنوا حتى تحابوا أولا أدلكم على شيء إذا فعلتموه تحاببتم أفشوا السلام بينكم- (رواه مسلم)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'تطعم الطعام এর তাৎপর্য লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'سَأَلَ، تُطْعِمُ، الْجَنَّةُ، لَمْ تَعْرِفْ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q3',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن قتادة رضي الله تعالى عنه قال قلت لأنس رضي الله تعالى عنه أكانت المصافحة في أصحاب رسول الله صلى الله عليه وسلم؟ قال نعم- (رواه البخاري)\nعن أبي هريرة رضي الله تعالى عنه قال قبل رسول الله صلى الله عليه وسلم الحسن بن علي وعنده الأقرع بن حابس فقال الأقرع أن لي عشرة من الولد ما قبلت منهم أحدا فنظر إليه رسول الله صلى الله عليه وسلم ثم قال من لا يرحم لا يرحم- (متفق عليه)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'المصافحة والمعانقة এর পরিচয় দাও।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'نَظَرَ، قَبَّلَ، لَا يَرْحَمُ، رَضِيَ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q4',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن عائشة رضي الله تعالى عنها قالت ما رأيت النبي صلى الله عليه وسلم مستجمعا ضاحكا حتى أرى منه لهواته إنما كان يتبسم- (رواه البخاري)\nعن عبد الله بن الحارث بن جزء رضي الله تعالى عنه قال ما رأيت أحدا أكثر تبسما من رسول الله صلى الله عليه وسلم- (رواه الترمذي)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'تبسم ও ضحك এর মধ্যে পার্থক্য লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'يَتَبَسَّمُ، أَكْثَرُ، رَأَيْتُ، مُسْتَجْمِعًا-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q5',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن أبي هريرة رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم تجدون شر الناس يوم القيامة ذا الوجهين، الذي يأتي هؤلاء بوجه وهؤلاء بوجه- (متفق عليه)\nعن حذيفة قال سمعت رسول الله صلى الله عليه وسلم يقول : لا يدخل الجنة قتات- (متفق عليه وفي رواية مسلم نمام)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'لا يدخل الجنة قتات এর ব্যাখ্যা লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'لَا يَدْخُلُ، سَمِعْتُ، قَتَّاتٌ، نَمَّامٌ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q6',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن أنس رضي الله تعالى عنه قال إن كان النبي صلى الله عليه وسلم ليخالطنا حتى يقول لأخ لي صغير يا أبا عمير ما فعل النغير كان له نغير يلعب به فمات- (متفق عليه)\nعن أنس رضي الله تعالى عنه عن النبي صلى الله عليه وسلم قال لامرأة عجوز أنه لا تدخل الجنة عجوز فقالت وما لهن؟ وكانت تقرأ القرآن فقال لها أما تقرئين القرآن؟ إنا أنشأنهن إنشاء فجعلنهن أبكارا- (رواه رزين وفي شرح السنة بلفظ المصابيح)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'لا تدخل الجنة عجوز এর মর্মার্থ লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'يَلْعَبُ، مَاتَ، يُخَالِطُ، أَبْكَارٌ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q7',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن أنس رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم : انصر أخاك ظالما أو مظلوما، فقال رجل يا رسول الله صلى الله عليه وسلم! أنصره مظلوما فكيف أنصره ظالما؟ قال تمنعه من الظلم فذلك نصرك إياه- (متفق عليه)\nعن ابن عباس رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم : ليس منا من لم يرحم صغيرنا ولم يوقر كبيرنا ويأمر بالمعروف وينه عن المنكر- (رواه الترمذي وقال هذا حديث غريب)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'انصر أخاك ظالما أو مظلوما এর ব্যাখ্যা কর।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'اُنْصُرْ، ظَالِمٌ، لَمْ يَرْحَمْ، الْمَعْرُوفُ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q8',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن ابن مسعود رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم : لا يدخل النار أحد في قلبه مثقال حبة من خردل من إيمان- ولا يدخل الجنة أحد في قلبه مثقال حبة من خردل من كبر- (رواه مسلم)\nعن أبي هريرة رضي الله تعالى عنه قال قال رسول الله صلى الله عليه وسلم : يقول الله تعالى الكبرياء ردائي والعظمة إزاري فمن نازعني واحدا منهما أدخلته النار- وفي رواية قذفته في النار (رواه مسلم)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'الكبرياء ردائي والعظمة إزاري এর ব্যাখ্যা লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'النَّارُ، أَدْخَلْتُ، يَقُولُ، رِدَاءٌ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q9',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن عمر بن أبي سلمة رضي الله تعالى عنه قال كنت غلاما في حجر رسول الله صلى الله عليه وسلم وكانت يدي تطيش في الصفحة فقال لي رسول الله صلى الله عليه وسلم : "سم الله وكل بيمينك وكل مما يليك"- (متفق عليه)\nعن جابر رضي الله تعالى عنه أن النبي صلى الله عليه وسلم أمر بلعق الأصابع والصفحة وقال إنكم لا تدرون في أية البركة؟ (رواه مسلم)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'وكل مما يليك এর মর্মার্থ লেখ।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'سَمِّ، كُلْ، أَمَرَ، الْأَصَابِعُ-',
      khaBaMarks: 2,
    },
    {
      id: 'dh_q10',
      kaInstruction: 'বাংলায় অনুবাদ কর:',
      kaHadith: '',
      kaHadithPlaceholder:
        'عن ابن عمر رضي الله تعالى عنهما قال قال رسول الله صلى الله عليه وسلم : "كل مسكر خمر وكل مسكر حرام ومن شرب الخمر في الدنيا فمات وهو يدمنها لم يتب لم يشربها في الآخرة"- (رواه مسلم)\nعن جابر بن عبد الله رضي الله تعالى عنهما أنه سمع رسول الله صلى الله عليه وسلم يقول عام الفتح وهو بمكة "إن الله ورسوله حرم بيع الخمر"- (رواه البخاري)',
      kaMarks: 5,
      khaHeading: 'উত্তর দাও:',
      khaAlifText: '',
      khaAlifPlaceholder: 'ইসলামে মদ পানের বিধান কী? কুরআন ও সুন্নাহর আলোকে বর্ণনা কর।',
      khaAlifMarks: 3,
      khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
      khaBaWords: '',
      khaBaWordsPlaceholder: 'مُسْكِرٌ، يُدْمِنُ، سَمِعَ، حَرَّمَ-',
      khaBaMarks: 2,
    },
  ],
  gaTitle: 'গ বিভাগ',
  gaInstruction: '(১৩নং প্রশ্নসহ যে কোনো দুটি প্রশ্নের উত্তর দাও)',
  gaMarksLine: 'মান—৫×২=১০',
  gaQuestions: [
    {
      id: 'dh_ga_1',
      text: '',
      placeholder: 'حديث কাকে বলে? উহার আলোচ্য বিষয় ও উদ্দেশ্য লেখ।',
      marks: 5,
    },
    {
      id: 'dh_ga_2',
      text: '',
      placeholder: 'মতন অনুসারে হাদিসের প্রকারসমূহ সংজ্ঞাসহ লেখ।',
      marks: 5,
    },
    {
      id: 'dh_ga_3',
      text: '',
      placeholder:
        'প্রশ্নপত্রে উল্লিখিত হাদিসগুলো ব্যতিত সিলেবাসের মধ্য হতে একটি হাদিস রাবীর নামসহ হরকত দিয়ে লেখ।',
      marks: 5,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: ALIM (1ST & 2ND YEAR) AL-HADITH WA USULUL HADITH (FULL ARABIC, 100 MARKS)
// ─────────────────────────────────────────────────────────────────────────────

export interface AlimHadithGroupAItem {
  id: string;
  hadithText: string;
  hadithPlaceholder: string;
  hadithMarks: number; // default 10
  subAText: string;
  subAPlaceholder: string;
  subAMarks: number; // default 3
  subBText: string;
  subBPlaceholder: string;
  subBMarks: number; // default 3
}

export interface AlimHadithGroupBItem {
  id: string;
  text: string;
  placeholder: string;
  marks: number; // default 10
}

export interface AlimHadithState {
  groupATitle: string;
  groupAMarksLine: string;
  groupAInstruction: string;
  groupAItems: AlimHadithGroupAItem[];
  groupBTitle: string;
  groupBMarksLine: string;
  groupBItems: AlimHadithGroupBItem[];
}

export const DEFAULT_ALIM_HADITH_STATE: AlimHadithState = {
  groupATitle: 'مجموعة (أ)—الحديث',
  groupAMarksLine: 'الدرجة—١٦×٥=٨٠',
  groupAInstruction: '(ترجم الأحاديث الآتية ثم أجب عن الأسئلة الملحقة بها)',
  groupAItems: [
    {
      id: 'ah_a_1',
      hadithText: '',
      hadithPlaceholder:
        'عن عبد الله بن عمرو رضي الله عنه قال قال رسول الله صلى الله عليه وسلم : المسلم من سلم المسلمون من لسانه ويده والمهاجر من هجر ما نهى الله عنه. هذا لفظ البخاري ولمسلم قال إن رجلا سأل النبي صلى الله عليه وسلم أي المسلمين خير؟ قال من سلم المسلمون من لسانه ويده.',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'بين سبب تخصيص اللسان واليد في هذا الحديث.',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : سَأَلَ، الْمُسْلِمُ، هَجَرَ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_2',
      hadithText: '',
      hadithPlaceholder:
        'عن عبد الله بن عمر قال قال رسول الله صلى الله عليه وسلم : إن أحدكم إذا مات عرض عليه مقعده بالغداة والعشي. إن كان من أهل الجنة فمن أهل الجنة وإن كان من أهل النار فمن أهل النار فيقال هذا مقعدك حتى يبعثك الله إليه يوم القيامة. (متفق عليه)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'اشرح قوله عليه السلام "حتى يبعثك الله إليه".',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : عُرِضَ، مَقْعَدٌ، يَبْعَثُ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_3',
      hadithText: '',
      hadithPlaceholder:
        'عن معاوية قال قال رسول الله صلى الله عليه وسلم : من يرد الله به خيرا يفقهه في الدين وإنما أنا قاسم والله يعطي. (متفق عليه)\nوعن أبي هريرة (رض) قال قال رسول الله صلى الله عليه وسلم : إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة إلا من صدقة جارية أو علم ينتفع به أو ولد صالح يدعو له. (رواه مسلم)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'اذكر أوصاف ولد صالح مختصرا.',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : اِنْقَطَعَ، يَنْتَفِعُ، صَالِحٌ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_4',
      hadithText: '',
      hadithPlaceholder:
        'عن عائشة رضي الله عنها قالت قال رسول الله صلى الله عليه وسلم : عشر من الفطرة قص الشارب وإعفاء اللحية والسواك واستنشاق الماء وقص الأظفار وغسل البراجم ونتف الإبط وحلق العانة وانتقاص الماء يعني الاستنجاء. قال الراوي ونسيت العاشرة إلا أن تكون المضمضة. (رواه مسلم)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'بين فضائل السواك مختصرا.',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : قَالَتْ، يَعْنِي، نَسِيتُ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_5',
      hadithText: '',
      hadithPlaceholder:
        'عن حذيفة رضي الله عنه قال قال رسول الله صلى الله عليه وسلم : فضلنا على الناس بثلاث : جعلت صفوفنا كصفوف الملائكة وجعلت لنا الأرض كلها مسجدا وجعلت تربتها لنا طهورا إذا لم نجد الماء. (رواه مسلم)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'ما المراد بقوله عليه الصلوة والسلام "جعلت تربتها لنا طهورا إذا لم نجد الماء"؟ بين.',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : جُعِلَتْ، لَمْ نَجِدْ، صُفُوفٌ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_6',
      hadithText: '',
      hadithPlaceholder:
        'عن ابن مسعود رضي الله عنه قال سألت النبي صلى الله عليه وسلم : أي الأعمال أحب إلى الله؟ قال الصلوة لوقتها. قلت ثم أي؟ قال بر الوالدين. قلت ثم أي؟ قال الجهاد في سبيل الله. قال حدثني بهن ولو استزدته لزادني. (متفق عليه)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'أوضح قوله النبي صلى الله عليه وسلم : الجهاد في سبيل الله.',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : الأَعْمَالُ، سَأَلْتُ، الْجِهَادُ.',
      subBMarks: 3,
    },
    {
      id: 'ah_a_7',
      hadithText: '',
      hadithPlaceholder:
        'عن أبي هريرة رضي الله عنه قال قال رسول الله صلى الله عليه وسلم : أحب البلاد إلى الله مساجدها وأبغض البلاد إلى الله أسواقها. (رواه مسلم)\nوعن عثمان رضي الله عنه قال قال رسول الله صلى الله عليه وسلم : من بنى لله مسجدا بنى الله له بيتا في الجنة. (متفق عليه)',
      hadithMarks: 10,
      subAText: '',
      subAPlaceholder: 'أوضح قوله عليه السلام "أبغض البلاد إلى الله أسواقها".',
      subAMarks: 3,
      subBText: '',
      subBPlaceholder: 'حقق : أَبْغَضُ، مَسَاجِدُ، بَنَى.',
      subBMarks: 3,
    },
  ],
  groupBTitle: 'مجموعة (ب)—أصول الحديث',
  groupBMarksLine: 'الدرجة—١٠×٢=٢٠',
  groupBItems: [
    {
      id: 'ah_b_1',
      text: '',
      placeholder: 'عرف السند لغة واصطلاحا. ثم بين المرفوع والموقوف والمقطوع مفصلا.',
      marks: 10,
    },
    {
      id: 'ah_b_2',
      text: '',
      placeholder: 'عرف الناسخ والمنسوخ ثم بين حكمهما مفصلا.',
      marks: 10,
    },
    {
      id: 'ah_b_3',
      text: '',
      placeholder: 'عرف الصحيح ثم بين شرائط الصحيح مفصلا.',
      marks: 10,
    },
    {
      id: 'ah_b_4',
      text: '',
      placeholder: 'عرف المرسل. وما حكمه؟ بين.',
      marks: 10,
    },
  ],
};
