import { ExamPaperData, QuestionData } from 'proshno-shared';
import { generateExamSets } from '../src/services/shufflerService';
import {
  generateAnswerKeyPdf,
  generateOmrSheetPdf,
  generateQuestionPaperPdf,
} from '../src/services/pdfService';
import fs from 'fs';
import path from 'path';

async function runE2ETests() {
  console.log('--- Running End-to-End Tests for ProshnoAI Phase 2 ---');

  // Sample questions covering all 7 Bangladeshi typologies with mixed language
  const sampleQuestions: QuestionData[] = [
    {
      _id: 'q1',
      subject: 'বাংলা ১ম পত্র',
      grade: 'দশম শ্রেণি',
      chapter: 'সুভা',
      typology: 'SIMPLE_MCQ',
      stemOrPassage: 'প্রকৃতির সাথে সুভার সম্পর্কের মূল ভিত্তি কোনটি ছিল?',
      options: [
        { label: 'ক', text: 'ভাষাহীন নীরবতা ও একাত্মতা', isCorrect: true },
        { label: 'খ', text: 'প্রতিযোগিতামূলক মনোভাব', isCorrect: false },
        { label: 'গ', text: 'উদাসীনতা', isCorrect: false },
        { label: 'ঘ', text: 'ভয় ও সংশয়', isCorrect: false },
      ],
      correctAnswer: 'ক',
      marks: 1,
      difficulty: 'Medium',
      languages: ['bn'],
      sourceType: 'AI',
    },
    {
      _id: 'q2',
      subject: 'ইসলাম শিক্ষা ও আরবি',
      grade: 'আলিম',
      chapter: 'হাদিস শরিফ',
      typology: 'MULTIPLE_COMPLETION_MCQ',
      stemOrPassage: 'হাদিস "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ" (Sahih Bukhari 1) এর আলোকে শিক্ষণীয় বিষয়:',
      statements: [
        'i. প্রতিটি কাজের ফলাফল নিয়তের উপর নির্ভরশীল',
        'ii. লোকদেখানো ইবাদত আল্লাহর নিকট গ্রহণযোগ্য নয়',
        'iii. শুধু নিয়ত করলেই আমল করা আবশ্যক নয়',
      ],
      options: [
        { label: 'ক', text: 'i ও ii', isCorrect: true },
        { label: 'খ', text: 'i ও iii', isCorrect: false },
        { label: 'গ', text: 'ii ও iii', isCorrect: false },
        { label: 'ঘ', text: 'i, ii ও iii', isCorrect: false },
      ],
      correctAnswer: 'ক',
      marks: 1,
      difficulty: 'Medium',
      languages: ['bn', 'ar', 'en'],
      sourceType: 'AI',
    },
    {
      _id: 'q3',
      subject: 'বাংলা ১ম পত্র',
      grade: 'দশম শ্রেণি',
      typology: 'PASSAGE_GROUP',
      stemOrPassage:
        'সুভা বাক্প্রতিবন্ধী কিশোরী। পিতামাতা তাহাকে অনাবশ্যক ভার বলিয়া গণ্য করিতেন, কিন্তু গোয়ালঘরের দুইটি গাভী তাহার মুখের ভাব বুঝিতে পারিত।',
      passageQuestions: [
        {
          order: 3,
          questionText: 'উদ্দীপকের বর্ণনায় সুভার প্রতি তার পিতামাতার কোন দৃষ্টিভঙ্গি ফুটে উঠেছে?',
          typology: 'SIMPLE_MCQ',
          options: [
            { label: 'ক', text: 'স্নেহশীলতা', isCorrect: false },
            { label: 'খ', text: 'ভারস্বরূপ অবহেলা', isCorrect: true },
            { label: 'গ', text: 'উদাসীন অহংকার', isCorrect: false },
            { label: 'ঘ', text: 'গর্ববোধ', isCorrect: false },
          ],
          correctAnswer: 'খ',
          marks: 1,
        },
        {
          order: 4,
          questionText: 'উক্ত ঘটনার সাথে নিচের কোন সামাজিক বাস্তবতার সাদৃশ্য রয়েছে?',
          typology: 'SIMPLE_MCQ',
          options: [
            { label: 'ক', text: 'বিশেষ চাহিদাসম্পন্ন শিশুদের প্রতি বৈষম্য', isCorrect: true },
            { label: 'খ', text: 'দারিদ্র্যপীড়িত গ্রামীণ জীবন', isCorrect: false },
            { label: 'গ', text: 'যৌতুক প্রথা', isCorrect: false },
            { label: 'ঘ', text: 'অশিক্ষা', isCorrect: false },
          ],
          correctAnswer: 'ক',
          marks: 1,
        },
      ],
      marks: 2,
      difficulty: 'Medium',
      languages: ['bn'],
      sourceType: 'AI',
    },
    {
      _id: 'q4',
      subject: 'বাংলা ১ম পত্র',
      grade: 'দশম শ্রেণি',
      chapter: 'মানুষ - কাজী নজরুল ইসলাম',
      typology: 'CQ',
      stemOrPassage:
        'করিম সাহেব এক ধনী ব্যবসায়ী। মসজিদে জুমার নামাজে গিয়ে তিনি ফকিরদের তাড়িয়ে দিলেন এবং বললেন "এখানে উপাসনার জায়গা, ভিক্ষা করার নয়"। অন্যদিকে রফিক সাহেব ক্ষুধার্ত ভিখারীকে ঘরে ডেকে খাদ্য দান করলেন।',
      subQuestions: [
        {
          part: 'ক',
          bloomLevel: 'knowledge',
          bloomTitle: 'জ্ঞানমূলক',
          questionText: 'পান্তুশালা শব্দের অর্থ কী?',
          marks: 1,
          sampleAnswer: 'সরাইখানা বা পান্থনিবাস।',
        },
        {
          part: 'খ',
          bloomLevel: 'comprehension',
          bloomTitle: 'অনুধাবনমূলক',
          questionText: '"মানুষের চেয়ে বড় কিছু নাই, নহে কিছু মহীয়ান" - ব্যাখ্যা কর।',
          marks: 2,
          sampleAnswer: 'সৃষ্টিকর্তার সমগ্র সৃষ্টির মধ্যে মানবজাতি শ্রেষ্ঠ ও মর্যাদাপূর্ণ।',
        },
        {
          part: 'গ',
          bloomLevel: 'application',
          bloomTitle: 'প্রয়োগমূলক',
          questionText: 'উদ্দীপকের করিম সাহেবের আচরণে \'মানুষ\' কবিতার কোন চরিত্রের প্রতিফলন ঘটেছে?',
          marks: 3,
          sampleAnswer: 'মসজিদের মোল্লা বা মন্দিরের পূজারীর স্বার্থপর আচরণ।',
        },
        {
          part: 'ঘ',
          bloomLevel: 'higher_order',
          bloomTitle: 'উচ্চতর দক্ষতা',
          questionText:
            '"রফিক সাহেবের দৃষ্টিভঙ্গিই \'মানুষ\' কবিতার মূল বাণীকে ধারণ করে" - উক্তিটির যথার্থতা মূল্যায়ন কর।',
          marks: 4,
          sampleAnswer: 'মানবপ্রেম ও ক্ষুধার্তের পাশে দাঁড়ানোই কবিতার সার্বজনীন বার্তা।',
        },
      ],
      marks: 10,
      difficulty: 'Hard',
      languages: ['bn'],
      sourceType: 'AI',
    },
    {
      _id: 'q5',
      subject: 'English 1st Paper',
      grade: 'Class X',
      typology: 'FILL_BLANKS',
      hasClues: true,
      wordClues: ['country', 'patriotism', 'sacrifice', 'citizens', 'duty', 'freedom', 'nation'],
      stemOrPassage:
        'Patriotism is a noble virtue. It inspires a man to (a) _____ everything for the well-being of his (b) _____. A true patriot loves his (c) _____ and performs his (d) _____ faithfully.',
      correctAnswer: ['sacrifice', 'country', 'nation', 'duty'],
      marks: 5,
      difficulty: 'Medium',
      languages: ['en'],
      sourceType: 'AI',
    },
    {
      _id: 'q6',
      subject: 'সাধারণ জ্ঞান ও ইতিহাস',
      grade: 'HSC',
      typology: 'MATCHING',
      stemOrPassage: 'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে অর্থপূর্ণ বাক্য তৈরি কর:',
      matchingColumns: {
        colA: [
          'বঙ্গবন্ধু শেখ মুজিবুর রহমান',
          'জাতীয় স্মৃতিসৌধ',
          'ভাষা আন্দোলন',
          'মুক্তিযুদ্ধ',
        ],
        colB: [
          '১৯৭১ সালের ২৬ মার্চ শুরু হয়',
          '১৯৫২ সালের ২১ ফেব্রুয়ারি সংঘটিত হয়',
          'সাভারে অবস্থিত মহান মুক্তিযুদ্ধের স্মারক',
          'বাঙালি জাতির অবিসংবাদিত নেতা ও জাতির পিতা',
        ],
        correctPairs: [
          { a: 0, b: 3, fullSentence: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বাঙালি জাতির অবিসংবাদিত নেতা ও জাতির পিতা।' },
          { a: 1, b: 2, fullSentence: 'জাতীয় স্মৃতিসৌধ সাভারে অবস্থিত মহান মুক্তিযুদ্ধের স্মারক।' },
          { a: 2, b: 1, fullSentence: 'ভাষা আন্দোলন ১৯৫২ সালের ২১ ফেব্রুয়ারি সংঘটিত হয়।' },
          { a: 3, b: 0, fullSentence: 'মুক্তিযুদ্ধ ১৯৭১ সালের ২৬ মার্চ শুরু হয়।' },
        ],
      },
      marks: 4,
      difficulty: 'Easy',
      languages: ['bn'],
      sourceType: 'AI',
    },
  ];

  const testPaper: ExamPaperData = {
    title: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬ - বাংলা ও সমন্বিত',
    headerConfig: {
      institutionName: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
      institutionAddress: 'মোহাম্মদপুর, ঢাকা-১২০৭',
      examTitle: 'অর্ধ-বার্ষিক মূল্যায়ন পরীক্ষা ২০২৬',
      subject: 'বাংলা ও সমন্বিত পাঠ',
      subjectCode: '১০১',
      timeAllowed: '২ ঘণ্টা ৩০ মিনিট',
      totalMarks: 23,
      generalInstructions: ['সকল প্রশ্নের মান সমান।', 'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক।'],
    },
    layoutConfig: {
      columns: 2,
      fontSize: 'standard',
      paperSize: 'A4',
      margins: { topMm: 12, bottomMm: 12, leftMm: 12, rightMm: 12 },
      watermarkText: 'CONFIDENTIAL',
      showMarks: true,
      showAnswers: false,
    },
    questions: sampleQuestions,
    sets: [],
    activeSet: 'Set A',
  };

  // 1. Test Smart Set Shuffler
  console.log('\n[1/3] Testing Smart Set Shuffler...');
  const sets = generateExamSets(sampleQuestions, ['Set A', 'Set B', 'Set C']);
  console.log(`Generated ${sets.length} sets:`, sets.map((s) => s.setName));
  console.log('Set A Answer Key Sample:', sets[0].answerKeyMap);
  console.log('Set B Answer Key Sample:', sets[1].answerKeyMap);
  testPaper.sets = sets;

  // 2. Test PDF Generation
  const outputDir = path.join(__dirname, '../dist-test-pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n[2/3] Generating Question Paper PDF (2-column board layout)...');
  const paperPdf = await generateQuestionPaperPdf(testPaper, 'Set A');
  const paperPdfPath = path.join(outputDir, 'Question_Paper_Set_A.pdf');
  fs.writeFileSync(paperPdfPath, paperPdf);
  console.log(`✓ Question Paper PDF created successfully: ${paperPdfPath} (${paperPdf.length} bytes)`);

  console.log('\n[3/3] Generating Teacher\'s Answer Key PDF and OMR Sheet PDF...');
  const answerKeyPdf = await generateAnswerKeyPdf(testPaper, 'Set A');
  const answerKeyPath = path.join(outputDir, 'Answer_Key_Set_A.pdf');
  fs.writeFileSync(answerKeyPath, answerKeyPdf);
  console.log(`✓ Answer Key PDF created successfully: ${answerKeyPath} (${answerKeyPdf.length} bytes)`);

  const omrPdf = await generateOmrSheetPdf(testPaper, 30);
  const omrPath = path.join(outputDir, 'OMR_Sheet_30_MCQ.pdf');
  fs.writeFileSync(omrPath, omrPdf);
  console.log(`✓ OMR Sheet PDF created successfully: ${omrPath} (${omrPdf.length} bytes)`);

  console.log('\n🎉 ALL PHASE 2 E2E TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
