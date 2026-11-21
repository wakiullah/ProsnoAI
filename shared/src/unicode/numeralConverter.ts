import { NumberingFormat } from '../types/examPaper';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const UR_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts English or Arabic digits in any string to Bengali digits (০-৯)
 */
export function convertToBengaliDigits(input: number | string): string {
  return String(input)
    .replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d, 10)])
    .replace(/[٠-٩]/g, (d) => BN_DIGITS[AR_DIGITS.indexOf(d)])
    .replace(/[۰-۹]/g, (d) => BN_DIGITS[UR_DIGITS.indexOf(d)]);
}

/**
 * Converts English, Bengali, or Urdu digits in any string to Arabic-Indic digits (٠-٩)
 */
export function convertToArabicDigits(input: number | string): string {
  return String(input)
    .replace(/[0-9]/g, (d) => AR_DIGITS[parseInt(d, 10)])
    .replace(/[০-৯]/g, (d) => AR_DIGITS[BN_DIGITS.indexOf(d)])
    .replace(/[۰-۹]/g, (d) => AR_DIGITS[UR_DIGITS.indexOf(d)]);
}

/**
 * Converts English digits 0-9 in any string to Eastern Arabic-Indic / Urdu digits (۰-۹)
 */
export function convertToUrduDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => UR_DIGITS[parseInt(d, 10)]);
}

/**
 * Format any number or string containing numbers into the target script's numerals
 */
export function formatNumberByScript(
  input: number | string,
  script: NumberingFormat = 'bn'
): string {
  switch (script) {
    case 'bn':
      return convertToBengaliDigits(input);
    case 'ar':
      return convertToArabicDigits(input);
    case 'ur':
      return convertToUrduDigits(input);
    case 'en':
    default:
      return String(input);
  }
}

/**
 * Format question number prefix (e.g. "১ নং প্রশ্ন:", "السؤال ١:", "سوال نمبر ۱:", "Question 1:")
 */
export function formatQuestionNumber(
  order: number,
  script: NumberingFormat = 'bn',
  style: 'full' | 'dot' = 'dot'
): string {
  const numStr = formatNumberByScript(order, script);
  if (style === 'full') {
    switch (script) {
      case 'bn':
        return `${numStr} নং প্রশ্ন:`;
      case 'ar':
        return `السؤال ${numStr}:`;
      case 'ur':
        return `سوال نمبر ${numStr}:`;
      case 'en':
      default:
        return `Question ${numStr}:`;
    }
  }
  return `${numStr}.`;
}

/**
 * Format question marks badge (e.g. "[১০]", "[١٠]", "[۱۰]", "[10]")
 */
export function formatMarksBadge(
  marks: number | string,
  script: NumberingFormat = 'bn'
): string {
  return `[${formatNumberByScript(marks, script)}]`;
}

/**
 * Format sub-question part label (e.g. "(১)", "(١)", "(۱)", "(a)")
 */
export function formatSubQuestionPart(
  part: string | number,
  script: NumberingFormat = 'bn',
  index: number = 0
): string {
  const str = String(part).trim();
  // If it's already wrapped in parentheses, strip them
  const raw = str.replace(/^\((.+)\)$/, '$1');

  // If raw is numeric (1, 2, 3...)
  if (/^\d+$/.test(raw)) {
    return `(${formatNumberByScript(raw, script)})`;
  }

  // If standard Bengali letters (ক, খ, গ, ঘ)
  const bnLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
  const arLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
  const urLetters = ['الف', 'ب', 'ج', 'د', 'ہ', 'و'];
  const enLetters = ['a', 'b', 'c', 'd', 'e', 'f'];

  const foundIdx = bnLetters.indexOf(raw);
  if (foundIdx !== -1) {
    if (script === 'ar') return `(${arLetters[foundIdx] || raw})`;
    if (script === 'ur') return `(${urLetters[foundIdx] || raw})`;
    if (script === 'en') return `(${enLetters[foundIdx] || raw})`;
    return `(${raw})`;
  }

  return `(${formatNumberByScript(raw, script)})`;
}

/**
 * Format marks formula (e.g., "৫ × ৩ = ১৫", "5 × 3 = 15")
 */
export function formatMarksFormula(
  requiredCount?: number,
  marksPerQuestion?: number,
  totalMarks?: number,
  script: NumberingFormat = 'bn'
): string | undefined {
  if (typeof requiredCount === 'number' && typeof marksPerQuestion === 'number') {
    const computedTotal = totalMarks !== undefined ? totalMarks : requiredCount * marksPerQuestion;
    const reqStr = formatNumberByScript(requiredCount, script);
    const marksStr = formatNumberByScript(marksPerQuestion, script);
    const totStr = formatNumberByScript(computedTotal, script);
    return `${marksStr} × ${reqStr} = ${totStr}`;
  }
  if (typeof totalMarks === 'number') {
    return formatNumberByScript(totalMarks, script);
  }
  return undefined;
}
