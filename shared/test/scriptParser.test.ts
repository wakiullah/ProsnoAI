import { parseMultiScript, renderMultiScriptHtml, stripArabicHarakat } from '../src/unicode/scriptParser';

function runTests() {
  console.log('--- Testing Multi-Script Unicode Parser ---');

  // Test 1: Mixed Bengali + Arabic (Madrasah / Islamic studies question)
  const madrasahQuestion =
    'নিচের হাদীসটির অর্থ ও ব্যাখ্যা লেখ: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ" (সহীহ বুখারী ১)';
  console.log('\n[Input 1]:', madrasahQuestion);
  const tokens1 = parseMultiScript(madrasahQuestion);
  console.log('[Tokens 1]:');
  tokens1.forEach((t) => console.log(`  - [${t.script.toUpperCase()} | ${t.dir}]: "${t.text}"`));

  const html1 = renderMultiScriptHtml(madrasahQuestion);
  console.log('[Rendered HTML 1]:\n ', html1);

  // Assertions for Test 1
  const hasArabicToken = tokens1.some((t) => t.script === 'ar');
  const hasBengaliToken = tokens1.some((t) => t.script === 'bn');
  if (!hasArabicToken || !hasBengaliToken) {
    throw new Error('Test 1 Failed: Expected both Arabic and Bengali tokens.');
  }

  // Test 2: Mixed Bengali + English (Science / ICT question)
  const ictQuestion =
    'কম্পিউটারের CPU (Central Processing Unit) এর প্রধান তিনটি অংশ কী কী?';
  console.log('\n[Input 2]:', ictQuestion);
  const tokens2 = parseMultiScript(ictQuestion);
  console.log('[Tokens 2]:');
  tokens2.forEach((t) => console.log(`  - [${t.script.toUpperCase()} | ${t.dir}]: "${t.text}"`));

  const hasEnglishToken = tokens2.some((t) => t.script === 'en');
  if (!hasEnglishToken) {
    throw new Error('Test 2 Failed: Expected English token for CPU.');
  }

  // Test 3: Trilingual (Bengali + Arabic + English)
  const trilingual =
    'ইসলামের ইতিহাসে الخلفاء الراشدون (Rightly Guided Caliphs) কারা ছিলেন?';
  console.log('\n[Input 3]:', trilingual);
  const tokens3 = parseMultiScript(trilingual);
  console.log('[Tokens 3]:');
  tokens3.forEach((t) => console.log(`  - [${t.script.toUpperCase()} | ${t.dir}]: "${t.text}"`));

  const hasAllThree =
    tokens3.some((t) => t.script === 'bn') &&
    tokens3.some((t) => t.script === 'ar') &&
    tokens3.some((t) => t.script === 'en');

  if (!hasAllThree) {
    throw new Error('Test 3 Failed: Expected all three scripts (bn, ar, en).');
  }

  // Test 4: Urdu script detection (Qawmi Talimul Islam / Urdu literature)
  const urduQuestion = 'উর্দু কিতাবের এই বাক্যটি পড়ো: "یہ کتاب بہت اچھی ہے" এবং অর্থ লেখ।';
  console.log('\n[Input 4]:', urduQuestion);
  const tokens4 = parseMultiScript(urduQuestion);
  console.log('[Tokens 4]:');
  tokens4.forEach((t) => console.log(`  - [${t.script.toUpperCase()} | ${t.dir}]: "${t.text}"`));

  const hasUrduToken = tokens4.some((t) => t.script === 'ur');
  if (!hasUrduToken) {
    throw new Error('Test 4 Failed: Expected Urdu token for "یہ کتاب بہت اچھی ہے".');
  }
  const urduHtml = renderMultiScriptHtml(urduQuestion);
  if (!urduHtml.includes('font-ur') || !urduHtml.includes('dir="rtl"')) {
    throw new Error('Test 4 Failed: Rendered HTML should include font-ur and dir="rtl".');
  }

  // Test 5: Arabic Harakat stripping utility
  const textWithHarakat = 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى';
  const strippedText = stripArabicHarakat(textWithHarakat);
  console.log('\n[Input 5 - With Harakat]:', textWithHarakat);
  console.log('[Stripped Harakat]:', strippedText);
  // Verify that Fatha, Damma, Kasra, Shaddah, Sukun are removed
  const harakatRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;
  if (harakatRegex.test(strippedText)) {
    throw new Error('Test 5 Failed: Stripped text still contains diacritics.');
  }

  // Test 6: Numeral and Digit Conversions (bn, ar, ur, en)
  console.log('\n--- Testing Multi-Script Numerals and Marks Formatting ---');
  const {
    convertToBengaliDigits,
    convertToArabicDigits,
    convertToUrduDigits,
    formatQuestionNumber,
    formatMarksBadge,
    formatSubQuestionPart,
    formatMarksFormula,
  } = require('../src/unicode/numeralConverter');

  if (convertToBengaliDigits(10) !== '১০') throw new Error('Bengali numeral failed');
  if (convertToArabicDigits(10) !== '١٠') throw new Error('Arabic numeral failed');
  if (convertToUrduDigits(10) !== '۱۰') throw new Error('Urdu numeral failed');

  // Question number full style
  if (formatQuestionNumber(1, 'bn', 'full') !== '১ নং প্রশ্ন:') throw new Error('BN full failed');
  if (formatQuestionNumber(1, 'ar', 'full') !== 'السؤال ١:') throw new Error('AR full failed');
  if (formatQuestionNumber(1, 'ur', 'full') !== 'سوال نمبر ۱:') throw new Error('UR full failed');
  if (formatQuestionNumber(1, 'en', 'full') !== 'Question 1:') throw new Error('EN full failed');

  // Marks badge
  if (formatMarksBadge(10, 'bn') !== '[১০]') throw new Error('BN marks badge failed');
  if (formatMarksBadge(10, 'ar') !== '[١٠]') throw new Error('AR marks badge failed');
  if (formatMarksBadge(10, 'ur') !== '[۱۰]') throw new Error('UR marks badge failed');
  if (formatMarksBadge(10, 'en') !== '[10]') throw new Error('EN marks badge failed');

  // Subquestion part
  if (formatSubQuestionPart('1', 'bn') !== '(১)') throw new Error('BN subpart failed');
  if (formatSubQuestionPart('1', 'ar') !== '(١)') throw new Error('AR subpart failed');
  if (formatSubQuestionPart('1', 'ur') !== '(۱)') throw new Error('UR subpart failed');

  // Marks formula
  if (formatMarksFormula(5, 2, 10, 'bn') !== '২ × ৫ = ১০') throw new Error('Marks formula failed');

  console.log('✅ All Numeral & Question Numbering tests passed successfully!');
  console.log('\n✅ All Multi-Script & Urdu Unicode Parser tests passed successfully!');
}

runTests();
