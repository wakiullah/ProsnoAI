/**
 * Google Fonts URLs for high-quality Bangladeshi exam printing
 * - Noto Serif Bengali: Highest fidelity for Bengali conjuncts (যুক্তাক্ষর)
 * - Amiri: Authentic Quranic/Standard Arabic typography with diacritics (Harakat)
 * - Noto Nastaliq Urdu: Traditional, elegant Nastaliq calligraphy for Urdu/Persian
 * - Inter & Times New Roman: Clean Latin serif/sans-serif
 */
export const GOOGLE_FONTS_EMBED_URL =
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';

/**
 * Shared CSS rules for BiDi isolation and multi-script typography
 */
export const MULTI_SCRIPT_CSS = `
/* Script isolation to prevent BiDi leakage & reversed punctuation */
.script-bn, .font-bn {
  font-family: 'Noto Serif Bengali', 'Kalpurush', 'SolaimanLipi', serif;
  direction: ltr;
  unicode-bidi: isolate;
}

.script-ar, .font-ar {
  font-family: 'Amiri', 'Scheherazade New', 'Lateef', serif;
  direction: rtl;
  unicode-bidi: isolate;
  font-size: 1.12em; /* Arabic script often benefits from slight enlargement */
  line-height: 1.7;
  font-feature-settings: "kern" 1, "liga" 1;
}

.script-ur, .font-ur {
  font-family: 'Noto Nastaliq Urdu', serif;
  direction: rtl;
  unicode-bidi: isolate;
  font-size: 1.15em;
  line-height: 2.1; /* Generous line-height so Nastaliq ascenders/descenders never clip */
  font-feature-settings: "kern" 1, "liga" 1;
}

.script-en, .font-en {
  font-family: 'Times New Roman', 'Inter', serif;
  direction: ltr;
  unicode-bidi: isolate;
}

.script-neutral {
  direction: ltr;
  unicode-bidi: isolate;
}

/* Ornamental Quranic/Hadith brackets styling */
.quran-ayah {
  font-family: 'Amiri', serif;
  direction: rtl;
  unicode-bidi: isolate;
  color: #1e3a5f;
  padding: 0 4px;
}
`;
