import { QuestionData } from 'proshno-shared';

export interface SarfNahwSectionData {
  includeBanner: boolean;
  bannerTitle: string;
  // Q1 Sarf
  includeQ1: boolean;
  q1Number: string;
  q1Title: string;
  q1MarksFormula: string;
  q1SubQuestions: string[];
  // Q2 Nahw
  includeQ2: boolean;
  q2Number: string;
  q2Title: string;
  q2MarksFormula: string;
  q2SubQuestions: string[];
}

export const DEFAULT_SARF_SUBQUESTIONS = [
  'ما هو علم الصرف لغة واصطلاحًا؟',
  'كم قسمًا للفعل المجرد؟ اذكر أوزان الثلاثي المجرد ممثلًا-',
  'ما هو الاسم الفاعل؟ وكيف يصاغ الاسم الفاعل؟ بين بالأمثلة-',
  'اكتب قواعد الهمزة الابتدائية بالأمثلة-',
];

export const DEFAULT_NAHW_SUBQUESTIONS = [
  'ما هو تعريف الاسم؟ اذكر مثالًا له-',
  'عرف الجملة ثم اذكر أقسام الجملة ومثل لها-',
  'عرف الاسم المنصرف ، بين بالأمثلة-',
  'عرف الاسم المبنى وكم قسمًا له؟ اذكر بالأمثلة-',
  'الأسماء المرفوعة كم هى وما هى؟ اذكر كل قسم بالأمثلة-',
  'التوابع ما هى؟ وكم قسمًا لها؟ بين بالأمثلة-',
];

export const DEFAULT_ARABIC_2ND_BANNER = '(أ) القواعد واختبار القواعد : الدرجات - ٥٠';

export interface IkhtibarItemConfig {
  id: string; // e.g., 'item_a', 'item_b', ...
  letter: string; // 'أ', 'ب', 'ج', ...
  title: string;
  type: 'word_list' | 'sentence_list' | 'cloze_box' | 'tashkeel';
  wordListText?: string;
  sentences?: string[];
  boxWords?: string[];
  passageText?: string;
  enabled: boolean;
}

export const DEFAULT_IKHTIBAR_ITEMS: IkhtibarItemConfig[] = [
  {
    id: 'item_a',
    letter: 'أ',
    title: 'عين نوع الفعل من حيث الصحة والعلة من الأفعال الآتية (خمسة فقط) :',
    type: 'word_list',
    wordListText: 'قِيَمٌ، سَفَرْجَلٌ، زُلْزِلَ، اِنْقَسَمَ، يَسْعَى، تَصُوْمُ، اِسْتَخْرَجَ، اِنْفَتَحَ -',
    enabled: true,
  },
  {
    id: 'item_b',
    letter: 'ب',
    title: 'عين الفعل المجرد والفعل المزيد فيما يلى (خمسة فقط) :',
    type: 'word_list',
    wordListText: 'خَرَجَ، تَفَاهَمَ، اِبْتَدَأَ، رَدَّ، اِسْتَفْهَمَ، جَاهَدَ، تَبَيَّنَ، عَلِمَ-',
    enabled: true,
  },
  {
    id: 'item_c',
    letter: 'ج',
    title: 'عين نوع الجموع ماتحتها خط في الجمل التالية :',
    type: 'sentence_list',
    sentences: [
      'قالت <u>الأعراب</u> آمنا-',
      'كرمت <u>الناجحين</u> فى الصف-',
      'اشتريت <u>الكتب</u> من المكتبة-',
      'فى الصف عدد كبير من <u>التلاميذ</u>-',
      'هؤلاء نسوة <u>مهذبات</u>-',
    ],
    enabled: true,
  },
  {
    id: 'item_d',
    letter: 'د',
    title: 'استخرج المبتداء والخبر من الجمل التالية :',
    type: 'sentence_list',
    sentences: [
      'الظلم مرتعه وخيم-',
      'المؤمن بشره فى وجهه-',
      'قراءة القرآن تزيد الإيمان-',
      'الطامع فى وثاق الذل-',
      'الطفل يلعب فى البيت-',
    ],
    enabled: true,
  },
  {
    id: 'item_e',
    letter: 'ه',
    title: 'صحح الجمل الآتية :',
    type: 'sentence_list',
    sentences: [
      'كان عثمان (رض) غنى-',
      'ذهبا خالد إلى المدرسة-',
      'إن الله خالقا-',
      'هذا هى أخوك-',
      'قرأت عشرون كتابا-',
    ],
    enabled: true,
  },
  {
    id: 'item_f',
    letter: 'و',
    title: 'ركب الجمل التالية (اثنين فقط) :',
    type: 'sentence_list',
    sentences: [
      'العلم نور-',
      'خذ الكتاب بقوة-',
      'كان الله عليما حكيما-',
      'إن سعيدا قائم-',
    ],
    enabled: true,
  },
  {
    id: 'item_g',
    letter: 'ز',
    title: 'املأ النص الآتى بكلمة مناسبة من الصندوق :',
    type: 'cloze_box',
    boxWords: ['خادم', 'جلبابا', 'يأخذ', 'كعامة', 'زيت', 'خليفة'],
    passageText:
      'كان عمر (رض) (أ) ............ ثانيا للإسلام، وكان يعيش (ب) ............ الناس، وكان يأخذ من (ج) ............ المال كما تأخذ عامة الناس، وكان يقول أنا (د) ............ حقير للإسلام فقط، وترك مثلا (ه) ............ فى إقامة العدل-',
    enabled: true,
  },
  {
    id: 'item_h',
    letter: 'ح',
    title: 'شكل العبارة الآتية :',
    type: 'tashkeel',
    passageText:
      'عن ابى سعيدن الخدرى (رض) عن رسول الله صلى الله عليه وسلم قال :\nمن رأى منكم منكرا فليغيره بيده فإن لم يستطع فبلسانه فإن لم يستطع فبقلبه وذلك أضعف الإيمان- (رواه مسلم)',
    enabled: true,
  },
];

export const DEFAULT_ARABIC_2ND_PART_B_BANNER = '(ب) الترجمة والإنشاء : الدرجات - ٤٥';

export const DEFAULT_Q4_AR_TO_BN_SENTENCES = [
  'دخلت عائشة فى المكتبة-',
  'الكريم اذا وعد وفى-',
  'أزهار الحديقة جميلة-',
  'الحياء شعبة من الإيمان-',
  'ارحم من فى الأرض يرحمك من فى السماء-',
  'عدو عاقل خير من صديق جاهل-',
  'الجنة تحت أقدام الأمهات-',
];

export const DEFAULT_Q5_BN_TO_AR_SENTENCES = [
  'ইমরান জুমার দিন রোজা রেখেছে।',
  'যেমন কর্ম তেমন ফল।',
  'দয়া করে যে, দয়া পায় সে।',
  'ছাত্রটি আনন্দিত হয়েছে।',
  'পুণ্য পাপকে মুছে ফেলে।',
  'দানশীল ব্যক্তি আল্লাহর বন্ধু।',
  'আল্লাহ যাকে ইচ্ছা হেদায়াত দান করেন।',
];

export const DEFAULT_Q6_APPLICATION_OPTION_1 =
  'اكتب عريضة باللغة العربية إلى مدير المدرسة تطلب منه الرخصة لثلاثة أيام-';

export const DEFAULT_Q6_APPLICATION_OPTION_2 =
  'اكتب رسالة بالعربية إلى أخيك تطلب منه ألف تاكا لشراء الكتب-';

export const DEFAULT_Q7_ESSAY_TOPICS = [
  'قيمة الوقت :',
  'فضيلة العلم :',
  'المدرسة -',
];

