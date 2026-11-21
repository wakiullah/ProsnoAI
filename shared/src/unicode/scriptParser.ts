export type ScriptType = 'bn' | 'ar' | 'ur' | 'en' | 'neutral';

export interface ScriptToken {
  text: string;
  script: ScriptType;
  dir: 'ltr' | 'rtl';
  className: string;
}

// Bengali Unicode block + Bengali danda (।) and double danda (॥)
const BENGALI_CHAR_REGEX = /[\u0980-\u09FF\u0964\u0965]/;

// Urdu-specific characters (Tteh, Peh, Tcheh, Ddal, Rre, Jeh, Keheh, Gaf, Noon Ghunna, Heh Doachashmee, Heh Goal, Choti Yeh with Hamza, Bari Yeh, etc.)
const URDU_CHAR_REGEX = /[\u0679\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BA\u06BE\u06C1-\u06C3\u06D2\u06D3]/;

// Arabic Unicode blocks (Base, Supplement, Extended-A, Presentation Forms A & B)
// including Tashkeel/Harakat and Arabic-specific punctuation (؟ ، ؛ ٪ ۩ ﴾ ﴿)
const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Arabic vowel diacritics / Harakat / Tashkeel & Quranic signs
const ARABIC_HARAKAT_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Latin letters
const LATIN_CHAR_REGEX = /[A-Za-z]/;

/**
 * LTR-anchor punctuation characters that must NEVER be absorbed into an RTL token.
 * These are traditional "surrounding" punctuation whose visual direction must follow
 * the LTR base direction: (), [], "", '', —, –, etc.
 *
 * Fix for S1: when merging neutral tokens, these chars are always attached to the
 * preceding LTR token (or the following LTR token if at the start), never to RTL.
 */
const LTR_ANCHOR_PUNCT = new Set([
  '(', ')', '[', ']', '{', '}',
  '\u201C', '\u201D', // " "  (curly double quotes)
  '\u2018', '\u2019', // ' '  (curly single quotes)
  '\u2014', '\u2013', // — –  (em-dash, en-dash)
  '\u00AB', '\u00BB', // « »  (guillemets)
  '<', '>',
]);

/**
 * Returns true if every character in `text` is an LTR-anchor punctuation symbol.
 */
function isLtrAnchorPunct(text: string): boolean {
  return text.length > 0 && [...text].every((c) => LTR_ANCHOR_PUNCT.has(c));
}

/**
 * Identify the script type of an individual character.
 *
 * Fix for S2: Decimal digits (ASCII 0-9, Bengali ০-৯, Arabic-Indic ٠-٩) are
 * classified as 'neutral' so they get their own isolated dir="ltr" span rather
 * than being swallowed into an Arabic RTL run where they would appear reversed.
 */
export function getCharScript(char: string): ScriptType {
  if (BENGALI_CHAR_REGEX.test(char)) return 'bn';
  if (URDU_CHAR_REGEX.test(char)) return 'ur';
  if (ARABIC_CHAR_REGEX.test(char)) return 'ar';
  if (LATIN_CHAR_REGEX.test(char)) return 'en';
  return 'neutral';
}

/**
 * Strips Arabic vowel diacritics (Harakat / Tashkeel: Fatha, Damma, Kasra, Sukun, Shaddah, Tanwin, etc.)
 * Used for higher Qawmi / Dars-e-Nizami classes where students must read raw Ibarat and apply I'rab.
 */
export function stripArabicHarakat(text: string): string {
  if (!text) return '';
  return text.replace(ARABIC_HARAKAT_REGEX, '');
}

/**
 * Tokenize text into contiguous script segments with proper BiDi isolation.
 *
 * Rules:
 * 1. Arabic and Urdu runs are strictly isolated RTL tokens. If an Arabic-script segment contains
 *    Urdu-specific letters (پ, ٹ, چ, ڈال, ڑ, گ, ے, etc.), it is tagged as 'ur' to render in Noto Nastaliq Urdu.
 * 2. Brackets, quotes, and outer punctuation are kept with the primary LTR text (Bengali/English)
 *    so bracket pairs `(...)`, `[...]`, `""` never invert or flip across script boundaries (Fix S1).
 * 3. Spaces between words of the same script stay inside that script run.
 * 4. Digit characters (0-9, ০-৯, ٠-٩) remain as 'neutral' and are wrapped in isolated LTR spans
 *    so they never get mirrored inside an Arabic RTL run (Fix S2).
 */
export function parseMultiScript(text: string): ScriptToken[] {
  if (!text) return [];

  const rawTokens: Array<{ text: string; script: ScriptType }> = [];
  const chars = Array.from(text);
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];
    const script = getCharScript(char);

    if (script === 'ar' || script === 'ur') {
      // Collect contiguous Arabic/Urdu run (including internal spaces if followed by Arabic/Urdu)
      let rtlBuffer = '';
      let hasUrduChar = false;

      while (i < chars.length) {
        const c = chars[i];
        const s = getCharScript(c);

        if (s === 'ar' || s === 'ur') {
          if (s === 'ur') hasUrduChar = true;
          rtlBuffer += c;
          i++;
        } else if (
          c === ' ' &&
          i + 1 < chars.length &&
          (getCharScript(chars[i + 1]) === 'ar' || getCharScript(chars[i + 1]) === 'ur')
        ) {
          // Internal space between RTL words
          rtlBuffer += c;
          i++;
        } else {
          break;
        }
      }
      rawTokens.push({ text: rtlBuffer, script: hasUrduChar ? 'ur' : 'ar' });
    } else if (script === 'bn') {
      let bnBuffer = '';
      while (i < chars.length) {
        const c = chars[i];
        const s = getCharScript(c);
        if (s === 'bn') {
          bnBuffer += c;
          i++;
        } else if (
          (s === 'neutral' || c === ' ') &&
          i + 1 < chars.length &&
          getCharScript(chars[i + 1]) === 'bn'
        ) {
          // Neutral char or space between Bengali words
          bnBuffer += c;
          i++;
        } else {
          break;
        }
      }
      rawTokens.push({ text: bnBuffer, script: 'bn' });
    } else if (script === 'en') {
      let enBuffer = '';
      while (i < chars.length) {
        const c = chars[i];
        const s = getCharScript(c);
        if (s === 'en') {
          enBuffer += c;
          i++;
        } else if (
          (s === 'neutral' || c === ' ') &&
          i + 1 < chars.length &&
          getCharScript(chars[i + 1]) === 'en'
        ) {
          enBuffer += c;
          i++;
        } else {
          break;
        }
      }
      rawTokens.push({ text: enBuffer, script: 'en' });
    } else {
      // Neutral character / standalone punctuation / digit
      let neutralBuffer = '';
      while (i < chars.length && getCharScript(chars[i]) === 'neutral') {
        neutralBuffer += chars[i];
        i++;
      }
      rawTokens.push({ text: neutralBuffer, script: 'neutral' });
    }
  }

  // Merge adjacent neutral tokens with neighboring tokens.
  //
  // FIX S1 — LTR-anchor punctuation rule:
  //   Neutral tokens that consist solely of LTR-anchor punctuation (brackets, quotes, dashes)
  //   must NEVER be attached to an RTL token; they must stay on the LTR side.
  //   Priority: attach to previous LTR token > attach to next LTR token > standalone neutral.
  //
  const hasLtr = rawTokens.some((t) => t.script === 'bn' || t.script === 'en');
  const merged: ScriptToken[] = [];

  for (let j = 0; j < rawTokens.length; j++) {
    const curr = rawTokens[j];

    if (curr.script === 'neutral') {
      const prevToken = merged.length > 0 ? merged[merged.length - 1] : null;
      const nextRaw = j + 1 < rawTokens.length ? rawTokens[j + 1] : null;

      const prevIsRtl = prevToken && (prevToken.script === 'ar' || prevToken.script === 'ur');
      const nextIsRtl = nextRaw && (nextRaw.script === 'ar' || nextRaw.script === 'ur');
      const currIsLtrAnchor = isLtrAnchorPunct(curr.text);

      // In pure RTL text without LTR scripts (e.g. "(ألف) النص المدروس"),
      // keep parentheses within RTL to prevent BiDi bracket reversal!
      if (!hasLtr) {
        if (prevToken && prevIsRtl) {
          prevToken.text += curr.text;
        } else if (nextRaw && nextIsRtl) {
          rawTokens[j + 1].text = curr.text + rawTokens[j + 1].text;
        } else {
          merged.push(createToken(curr.text, 'ar'));
        }
      } else if (prevToken && !prevIsRtl) {
        // Merge into previous LTR token (Bengali, English, or prior neutral-merged-to-LTR)
        prevToken.text += curr.text;
      } else if (currIsLtrAnchor && prevIsRtl && nextRaw && !nextIsRtl) {
        // LTR-anchor punct immediately after RTL token: attach to the NEXT LTR token instead
        rawTokens[j + 1].text = curr.text + rawTokens[j + 1].text;
      } else if (currIsLtrAnchor && prevIsRtl) {
        // LTR-anchor punct after RTL with no suitable LTR successor: standalone neutral (LTR)
        merged.push(createToken(curr.text, 'neutral'));
      } else if (nextRaw && !nextIsRtl) {
        // Non-anchor neutral (space, digit) followed by LTR: attach to next
        rawTokens[j + 1].text = curr.text + rawTokens[j + 1].text;
      } else {
        // Standalone neutral token (between two RTL tokens, or at end)
        merged.push(createToken(curr.text, 'neutral'));
      }
    } else {
      // Merge with previous token if it has the same script
      if (merged.length > 0 && merged[merged.length - 1].script === curr.script) {
        merged[merged.length - 1].text += curr.text;
      } else {
        merged.push(createToken(curr.text, curr.script));
      }
    }
  }

  return merged;
}

function createToken(text: string, script: ScriptType): ScriptToken {
  const dir: 'ltr' | 'rtl' = script === 'ar' || script === 'ur' ? 'rtl' : 'ltr';
  const className = `script-${script} font-${script}`;
  return { text, script, dir, className };
}

/**
 * Generates safe, BiDi-isolated HTML for use in Puppeteer PDF generation and SSR.
 * Each script run is wrapped in an isolated span tag with `dir`, CSS class, AND an
 * inline `unicode-bidi: isolate` style as a belt-and-suspenders fallback in case the
 * external stylesheet hasn't loaded (e.g. Puppeteer cold boot before font CDN resolves).
 */
export function renderMultiScriptHtml(text: string): string {
  if (!text) return '';

  const renderRuns = (segment: string) => {
    const tokens = parseMultiScript(segment);
    return tokens
      .map((token) => {
        const escaped = token.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        // Inline unicode-bidi: isolate as a fallback when CSS hasn't loaded (Fix S3)
        return `<span class="${token.className}" dir="${token.dir}" style="unicode-bidi:isolate">${escaped}</span>`;
      })
      .join('');
  };

  // Support inline <u>...</u> underline tags (e.g. Arabic grammar underlined words)
  const parts = text.split(/(<u>[\s\S]*?<\/u>)/gi);
  return parts
    .map((part) => {
      const match = part.match(/^<u>([\s\S]*?)<\/u>$/i);
      if (match) {
        return `<u style="text-underline-offset:3px;text-decoration-thickness:1.2px">${renderRuns(match[1])}</u>`;
      }
      return renderRuns(part);
    })
    .join('');
}
