import { GenerateQuestionsRequest } from 'proshno-shared';

export function buildSystemPrompt(): string {
  return `You are a Senior Exam Paper Creator & Curriculum Specialist for all Bangladeshi Education Systems:
1. NCTB (National Curriculum and Textbook Board: Primary, Secondary, Higher Secondary)
2. Alia Madrasah Education Board (Dakhil, Alim, Fazil, Kamil)
3. Qawmi Madrasah Education Boards (Befaqul Madarisil Arabia Bangladesh, Al-Haiatul Ulya Lil-Jami'atil Qawmia Bangladesh: Ibtidaiyyah, Mutawassitah, Sanabiyyah, Fazilat, Dawra-e-Hadith)
4. Noorani Board (নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ: শিশু শ্রেণি, ১ম শ্রেণি, ২য় শ্রেণি, ৩য় শ্রেণি)

You strictly adhere to Bangladeshi exam and board patterns:
- Bengali questions must use authentic Bengali terminology, natural phrasing, and board formatting (ক, খ, গ, ঘ).
- STRICT QURANIC & HADITH INTEGRITY:
  * For Quranic verses and Hadith texts, output 100% authentic Uthmani or Indo-Pak script without altering or fabricating diacritics.
  * Visually enclose authentic Quranic verses with ornamental brackets ﴿ ... ﴾.
- ARABIC HARAKAT (TASHKEEL) CONTROL:
  * If Harakat Control is "WITHOUT_HARAKAT" (standard in higher Qawmi Kitab exams such as Sharhe Bekaya, Hedaya, Jalalayn, Mishkat, Nurul Anwar), output Arabic texts (Ibarat) WITHOUT vowel diacritics (no Fatha, Damma, Kasra, Sukun) so that students can independently analyze and apply I'rab.
  * If Harakat Control is "WITH_HARAKAT" (standard in Noorani, Alia Dakhil/Alim, and Hadith/Quran texts), include full accurate diacritics.
- URDU & PERSIAN SCRIPT SUPPORT:
  * For Qawmi classes with Urdu/Persian subjects (e.g. Talimul Islam, Gulistan, Bostan), output authentic Urdu script and vocabulary.
- ALIA BOARD ARABIC FORMATS:
  * Support Al-Fahm (Comprehension with صحيح / خطأ), Al-Qawaid (Grammar), and Al-Insha (Dialogue/Letters).

OUTPUT RULE:
Return ONLY a valid JSON object matching the requested schema. Do not include markdown code fences (\`\`\`json) or any conversational text.`;
}

export function buildUserPrompt(req: GenerateQuestionsRequest): string {
  const languageNames = req.languages
    .map((l) => (l === 'bn' ? 'Bengali' : l === 'ar' ? 'Arabic' : l === 'ur' ? 'Urdu' : 'English'))
    .join(', ');

  const streamInfo = req.educationStream ? `Education Stream: ${req.educationStream}` : 'Education Stream: GENERAL';
  const harakatInfo = req.harakatMode ? `Harakat (Diacritics) Control: ${req.harakatMode}` : 'Harakat Control: WITH_HARAKAT';

  const contextInstruction =
    req.mode === 'document' && req.documentText
      ? `\n\nSOURCE DOCUMENT TEXT:\n${req.documentText.slice(0, 8000)}\n\nINSTRUCTION: Strictly generate questions based ONLY on the source text provided above.`
      : '';

  const additional = req.additionalPrompt ? `\nAdditional requirements: ${req.additionalPrompt}` : '';

  let typologySpecificGuide = '';

  switch (req.typology) {
    case 'SIMPLE_MCQ':
      typologySpecificGuide = `Generate ${req.count} Simple MCQs.
Each question must have:
- stemOrPassage: clear question stem.
- options: Exactly 4 options with labels "ক", "খ", "গ", "ঘ" (or "a", "b", "c", "d" if English, or "أ", "ب", "ج", "د" if Arabic).
- correctAnswer: The correct option label (e.g., "ক" or "a").
- explanation: Detailed explanation.
- marks: 1`;
      break;

    case 'MULTIPLE_COMPLETION_MCQ':
      typologySpecificGuide = `Generate ${req.count} Multiple Completion / Multiple Select MCQs (বহুপদী সমাপ্তিসূচক প্রশ্ন).
Format:
- stemOrPassage: Question stem (e.g. "নিচের তথ্যগুলো লক্ষ্য কর:" or direct context)
- statements: Exactly 3 numbered statements ("i. ...", "ii. ...", "iii. ...")
- options: Exactly 4 combination options:
  - ক) i ও ii
  - খ) i ও iii
  - গ) ii ও iii
  - ঘ) i, ii ও iii
- correctAnswer: The correct option label
- explanation: Detailed explanation
- marks: 1`;
      break;

    case 'PASSAGE_GROUP':
      typologySpecificGuide = `Generate ${req.count} Passage-Based Group Question sets (অভিন্ন তথ্যভিত্তিক প্রশ্ন or Reading Comprehension / আল-ফাহম Al-Fahm).
Each set must contain:
- stemOrPassage: A short stimulus / passage (e.g., "নিচের উদ্দীপক / অনুচ্ছেদটি পড়ে পরবর্তী প্রশ্নগুলোর উত্তর দাও:" followed by a paragraph, Quranic/Hadith passage, or Arabic Nass).
- passageQuestions: An array of 2 to 3 linked questions directly testing the passage. Each linked question must have order, questionText, typology ('SIMPLE_MCQ' or 'DESCRIPTIVE'), options (if MCQ), correctAnswer, explanation, and marks.`;
      break;

    case 'CQ':
      typologySpecificGuide = `Generate ${req.count} Creative Questions (সৃজনশীল প্রশ্ন / CQ) strictly following Bloom's Taxonomy:
Each question must have:
- stemOrPassage: An engaging, realistic stimulus/stem (উদ্দীপক).
- subQuestions: An array of exactly 4 hierarchical sub-questions:
  1. part: "ক", bloomLevel: "knowledge", bloomTitle: "জ্ঞানমূলক", marks: 1 (textbook recall)
  2. part: "খ", bloomLevel: "comprehension", bloomTitle: "অনুধাবনমূলক", marks: 2 (understanding/explanation)
  3. part: "গ", bloomLevel: "application", bloomTitle: "প্রয়োগমূলক", marks: 3 (application to উদ্দীপক)
  4. part: "ঘ", bloomLevel: "higher_order", bloomTitle: "উচ্চতর দক্ষতা", marks: 4 (analysis & evaluation)
- marks: 10 (Total sum: 1 + 2 + 3 + 4)`;
      break;

    case 'FILL_BLANKS':
      typologySpecificGuide = `Generate ${req.count} Fill in the Blanks questions.
- stemOrPassage: A passage or numbered sentences with blanks indicated as (a) _____, (b) _____, etc.
- hasClues: true (provide 8-10 words in wordClues) or false (without clues)
- wordClues: array of strings containing clues if hasClues is true
- correctAnswer: array of correct fill words corresponding to blanks
- marks: 5`;
      break;

    case 'MATCHING':
      typologySpecificGuide = `Generate ${req.count} Matching Table questions (মিলকরণ).
- stemOrPassage: Instruction (e.g. "বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে অর্থপূর্ণ বাক্য তৈরি কর:")
- matchingColumns:
  - colA: Array of 4 to 5 phrases
  - colB: Array of 4 to 5 matching phrases (shuffled)
  - correctPairs: Array of mappings: [{ "a": 0, "b": 2, "fullSentence": "..." }]
- marks: 5`;
      break;

    case 'TARJAMA_TASHREEH':
      typologySpecificGuide = `Generate ${req.count} Tarjama & Tashreeh questions (তরজমা ও তাশরীহ - Arabic Ibarat Translation & Explanation).
- stemOrPassage: The Arabic Ibarat (respecting Harakat Control: ${req.harakatMode || 'WITH_HARAKAT'}).
- subQuestions: Exactly 2 sub-tasks:
  1. part: "১", questionText: "উক্ত ইবারতটির প্রাঞ্জল বঙ্গানুবাদ (তরজমা) লেখ।", marks: 4
  2. part: "২", questionText: "ইবারতটির প্রাসঙ্গিক ব্যাখ্যা ও বিধানসমূহ (তাশরীহ) বিশদভাবে লেখ।", marks: 6
- correctAnswer: Model translation and explanation summary.
- marks: 10`;
      break;

    case 'TAHQEEQ_SIGHA':
      typologySpecificGuide = `Generate ${req.count} Tahqeeq & Sigha questions (তাহকীক ও সিগাহ - Arabic Morphological Analysis).
- stemOrPassage: "নিচের শব্দগুলোর সিগাহ, বাহাস, বাব, মাদ্দা ও অর্থসহ তাহকীক কর:" followed by a sentence or selection of 4 to 5 Arabic words.
- tahqeeqWords: Array of 4 to 5 word analysis objects:
  [
    {
      "lafz": "يَنصُرُونَ",
      "sigha": "جمع مذكر غائب (জমা মুজাক্কার গায়েব)",
      "bahas": "إثبات فعل مضارع معروف (ইসবাত ফে'লে মুযারে মারূফ)",
      "baab": "نَصَرَ - يَنْصُرُ (নাসারা ইয়ানসুরু)",
      "maddah": "ن - ص - ر (নূন, সাদ, রা)",
      "meaning": "তারা সাহায্য করছে বা করবে"
    }
  ]
- marks: 5`;
      break;

    case 'TARKIB_IRAB':
      typologySpecificGuide = `Generate ${req.count} Tarkib & I'rab questions (তারকীব ও এ'রাব বিশ্লেষণ - Arabic Syntax Analysis).
- stemOrPassage: "নিচের বাক্যটির পূর্ণাঙ্গ এরাব লাগাও এবং তারকীব কর:" followed by an Arabic sentence without diacritics.
- correctAnswer: Complete syntactic tree breakdown (মুবতাদা, খবর, ফে'ল, ফায়েল, মাফ'উল, মুযাফ, মুযাফ ইলাইহি, ইত্যাদি).
- marks: 5`;
      break;

    case 'HURUF_TAJWEED':
      typologySpecificGuide = `Generate ${req.count} Noorani/Tajweed Kid-Friendly questions (হরুফ জোড়া লাগানো / আলাদা করা / তাজবীদ / মাসনূন দোয়া).
- stemOrPassage: Instructions and Arabic words/letters (e.g. হরুফ আলাদা কর: "مَسْجِدٌ = م + س + ج + د" or হরুফ যুক্ত কর or তাজবীদের মাদ্দ ও গুন্নাহর নিয়ম).
- answerSpaceLines: 4 (writing lines for kids)
- marks: 5`;
      break;

    case 'QAWAID_MISAL':
      typologySpecificGuide = `Generate ${req.count} Grammar Rules & Identification questions (ব্যাকরণ ও নির্ণয়মূলক প্রশ্ন - নিয়ম, রূপান্তর ও উদাহরণ).
Applicable universally to General NCTB, Alia, and Qawmi boards:
- For Bangla Grammar: "নিচের যেকোনো ৫টি শব্দের সমাস / প্রত্যয় / সন্ধি বিচ্ছেদ নির্ণয় কর:" or "যেকোনো ৫টি শব্দের বানান শুদ্ধ করে লেখ:" or "যেকোনো ৫টি বাক্যের রূপান্তর কর:" followed by numbered examples.
- For English Grammar: "Change the following sentences according to directions (any 5):" followed by 6-7 numbered sentences.
- For Arabic/Madrasah Grammar: "নিচের বাক্যগুলোর মধ্য হতে যে কোন ৪টি اسم ও ৪টি فعل নির্ণয় কর এবং প্রত্যেকটির علامت বর্ণনা কর: (যে কোন ৪টি)" or "নিচের মিছালগুলো হতে ৪টি مركب مفيد ও ৪টি مركب غير مفيد -এর প্রকার নির্ণয় কর:" followed by Arabic examples with harakat.
- correctAnswer: Complete, accurate answers and solutions for all items.
- marks: 5 to 16`;
      break;

    case 'MULTI_PART':
    case 'QAWMI_CQ':
      typologySpecificGuide = `Generate ${req.count} Multi-part / Sub-question structured questions (বহুধাপ / উপ-প্রশ্নযুক্ত প্রশ্ন - ক, খ, গ... ও চয়েস সহ).
This is the universal multi-part question structure used in General NCTB, Alia, and Qawmi boards (distinct from rigid 4-step Bloom's CQ).
Each question has a main title/topic and 2 to 4 structured sub-questions labeled 'ক', 'খ', 'গ' (or 'a', 'b', 'c'):
- Sub-questions adapt to the subject:
  * For Bangla/English Grammar: (ক) ব্যাকরণিক নিয়ম বা সংজ্ঞা, (খ) বাক্য বা শব্দ নির্ণয়/রূপান্তর (যেমন: যেকোনো ৫টি), (গ) উদাহরণসহ প্রয়োগ।
  * For Arabic/Madrasah: (ক) বাক্য হতে ইসম/ফেয়েল/মিছাল নির্ণয় (যেকোনো ৪টি), (খ) প্রকারভেদ ও সংজ্ঞা, (গ) তারকীব বা হারাকাত লাগানো।
  * For Math/Science/Commerce/Arts: (ক) সূত্র বা সংজ্ঞা, (খ) ব্যাখ্যা বা প্রমাণ, (গ) প্রয়োগমূলক গাণিতিক সমস্যা।
- subQuestions array format:
  [
    { "part": "ক", "questionText": "...", "marks": 4 },
    { "part": "খ", "questionText": "... (যে কোনো ৫টির উত্তর দাও)", "marks": 8 },
    { "part": "গ", "questionText": "...", "marks": 8 }
  ]
- marks: Total of sub-question marks (e.g. 10 to 32)`;
      break;

    case 'DESCRIPTIVE':
    default:
      typologySpecificGuide = `Generate ${req.count} Short, Broad, or Grammatical questions.
Each question must have:
- stemOrPassage: Question or instruction text
- correctAnswer: Model answer or solution guidelines
- marks: 2 to 5`;
      break;
  }

  return `Generate questions with the following parameters:
- Subject: ${req.subject}
- Class/Grade: ${req.grade}
- ${streamInfo}
- ${harakatInfo}
- Chapter: ${req.chapter || 'Not specified'}
- Topic: ${req.topic || 'General curriculum'}
- Typology: ${req.typology}
- Difficulty: ${req.difficulty}
- Primary Languages: ${languageNames}
${typologySpecificGuide}
${additional}
${contextInstruction}

Return a JSON object in this exact shape:
{
  "questions": [
    {
      "subject": "${req.subject}",
      "grade": "${req.grade}",
      "chapter": "${req.chapter || ''}",
      "typology": "${req.typology}",
      "educationStream": "${req.educationStream || 'GENERAL'}",
      "harakatMode": "${req.harakatMode || 'WITH_HARAKAT'}",
      "stemOrPassage": "...",
      "statements": ["..."], // if MULTIPLE_COMPLETION_MCQ
      "options": [ {"label": "ক", "text": "...", "isCorrect": true}, ... ], // if MCQ
      "subQuestions": [ ... ], // if CQ or TARJAMA_TASHREEH
      "passageQuestions": [ ... ], // if PASSAGE_GROUP
      "matchingColumns": { "colA": [...], "colB": [...], "correctPairs": [...] }, // if MATCHING
      "tahqeeqWords": [ {"lafz": "...", "sigha": "...", "bahas": "...", "baab": "...", "maddah": "...", "meaning": "..."} ], // if TAHQEEQ_SIGHA
      "answerSpaceLines": 0, // if HURUF_TAJWEED or Noorani, e.g. 2, 4
      "wordClues": ["..."], // if FILL_BLANKS
      "correctAnswer": "...",
      "explanation": "...",
      "marks": 1,
      "difficulty": "${req.difficulty}",
      "languages": ${JSON.stringify(req.languages)},
      "sourceType": "${req.mode === 'document' ? 'PDF' : 'AI'}"
    }
  ]
}`;
}
