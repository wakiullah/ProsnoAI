import { isAlimGrade } from '../bangla1st/bangla1stDefaults';

export function isAlimArabic2ndPaper(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  const s = subject || '';
  const c = subjectCode || '';
  const g = grade || '';

  if (c === '২০৬' || s.includes('الورقة الثانية') || s.includes('الأدب العربي')) {
    return true;
  }

  const isAr2nd =
    s.includes('আরবি ২য়') ||
    s.includes('আরবি ২য়') ||
    s.includes('আরবি দ্বিতীয়') ||
    s.includes('قواعد اللغة العربية') ||
    s.includes('কাওয়াইদুল') ||
    c === '১৩৪';

  const isAlim =
    isAlimGrade(g) ||
    g.includes('العالم') ||
    g.includes('عالم');

  return isAr2nd && isAlim;
}

export interface AlimQawaidQuestionItem {
  id: string;
  text: string;
  placeholder: string;
}

export const DEFAULT_ALIM_AR2_QAWAID_QUESTIONS: AlimQawaidQuestionItem[] = [
  {
    id: 'aa2_q1',
    text: '',
    placeholder: 'الكلمة ما هى؟ وكم قسما لها؟ بين كل قسم مع الأمثلة.',
  },
  {
    id: 'aa2_q2',
    text: '',
    placeholder: 'الاسم المعرب ما هو؟ وكم قسما له؟ بين بالأمثلة.',
  },
  {
    id: 'aa2_q3',
    text: '',
    placeholder: 'الأسماء المرفوعات ما هى وكم هى؟ اكتب ممثلا.',
  },
  {
    id: 'aa2_q4',
    text: '',
    placeholder: 'الفاعل ما هو؟ وكم قسما له؟ بين بالأمثلة.',
  },
  {
    id: 'aa2_q5',
    text: '',
    placeholder: 'ما هو المستثنى؟ وكم قسما له؟ بين كل قسم بالأمثلة.',
  },
  {
    id: 'aa2_q6',
    text: '',
    placeholder: 'ما هى التوابع؟ وكم قسما لها؟ اكتب اقسامها بالأمثلة.',
  },
  {
    id: 'aa2_q7',
    text: '',
    placeholder: 'الحروف المشبهة بالفعل كم هى وما هى؟ بين عملها بالتمثيل.',
  },
  {
    id: 'aa2_q8',
    text: '',
    placeholder: 'الاسم المشتق ما هو؟ وكم قسما له؟ اذكر بالمثال.',
  },
  {
    id: 'aa2_q9',
    text: '',
    placeholder: 'عرف الفعل اللازم والمتعدى. كيف يصير اللازم متعديا؟ اكتب بالأمثلة.',
  },
  {
    id: 'aa2_q10',
    text: '',
    placeholder: 'ما معنى الإعلال؟ وكم قسما له؟ بين بالأمثلة.',
  },
];

export const DEFAULT_ALIM_AR2_Q12_PLACEHOLDERS = [
  'الكذب رأس كل خطيئة، الكذب يهلك الكاذب، لا يصدقه أحد، الكاذب لا يفلح ولا يرتقى فى حياته، وهو يخسر فى كل خطواته، نحن لا نكذب أبدا.',
  'القرآن أفضل الكتب السماوية، تلاوته أفضل العبادات، يعطى الله بتلاوته كل حرف عشر حسنات، تعلم القرآن وتعليمه خير الأعمال، قال النبى صلى الله عليه وسلم : "خيركم من تعلم القرآن وعلمه".',
];

export const DEFAULT_ALIM_AR2_Q13_PLACEHOLDERS = [
  'আমাদের নবি মোহাম্মদ (স) ৫৭০ খ্রি. মক্কার বিখ্যাত কুরাইশ বংশে জন্ম গ্রহণ করেন। তাঁর মাতা আমেনা। জন্মের পূর্বেই তাঁর পিতা আবদুল্লাহ মারা যান। ছয় বছর বয়সে তাঁর মা মারা যান। মায়ের মৃত্যুর পর দাদার কাছে লালিত-পালিত হন।',
  'মসজিদ আল্লাহর ঘর। ইহা ইসলামি শিক্ষা ও সংস্কৃতির প্রাণকেন্দ্র। মুসলিম সমাজে আর্থ-সামাজিক উন্নয়নে মসজিদ গুরুত্বপূর্ণ ভূমিকা পালন করে। বাংলাদেশে প্রায় প্রতিটি গ্রাম ও শহরে মসজিদ রয়েছে। আমাদের উচিত মসজিদে গিয়ে জামায়াতের সাথে নামায আদায় করা।',
];

export const DEFAULT_ALIM_AR2_Q14_PLACEHOLDERS = [
  'اشترى زيد ثلاثة قلم.',
  'كان أبا بكر عالما.',
  'رأيت احدى عشرة كوكبا.',
  'جاءت الطالب راكب.',
  'وجدت تسعة عشرة كتابا.',
  'وكان الله عليم حكيم.',
  'جاء رجل صالحة فى السوق.',
];

export const DEFAULT_ALIM_AR2_Q15_PLACEHOLDERS = [
  'اكتب عريضة بالعربية إلى مدير المدرسة تطلب منه الرخصة لثلاثة أيام.',
  'اكتب بالعربية رسالة إلى ابيك تخبره عن نجاحك فى الامتحان المركزى للعالم.',
];

export const DEFAULT_ALIM_AR2_Q16_PLACEHOLDERS = [
  'حب الوطن؛',
  'تعليم النسوان؛',
  'الصلاة.',
];
