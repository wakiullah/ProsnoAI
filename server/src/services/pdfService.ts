import fs from 'fs';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { ExamPaperData } from 'proshno-shared';
import { generateQuestionPaperHtml } from './pdfTemplates/questionPaperTemplate';
import { generateAnswerKeyHtml } from './pdfTemplates/answerKeyTemplate';
import { generateOmrSheetHtml } from './pdfTemplates/omrSheetTemplate';

let browserInstance: Browser | null = null;
let cachedFontCss: string | null = null;

/**
 * Returns Base64-embedded CSS @font-face declarations for offline, pixel-perfect
 * rendering of Arabic fonts (Traditional Arabic, Noto Naskh Arabic, Lateef).
 */
export function getEmbeddedFontCss(): string {
  if (cachedFontCss !== null) return cachedFontCss;

  const fontDirCandidates = [
    path.resolve(__dirname, '../../public/fonts'),
    path.resolve(__dirname, '../../../client/public/fonts'),
    path.resolve(process.cwd(), 'public/fonts'),
    path.resolve(process.cwd(), '../client/public/fonts'),
  ];

  const fontDir = fontDirCandidates.find(
    (dir) =>
      fs.existsSync(dir) &&
      (fs.existsSync(path.join(dir, 'Amiri-Regular.ttf')) ||
        fs.existsSync(path.join(dir, 'TraditionalArabic.ttf')))
  );

  let fontFaces = '';
  if (fontDir) {
    try {
      const amiriRegPath = fs.existsSync(path.join(fontDir, 'Amiri-Regular.ttf'))
        ? path.join(fontDir, 'Amiri-Regular.ttf')
        : path.join(fontDir, 'TraditionalArabic.ttf');
      const amiriBoldPath = path.join(fontDir, 'Amiri-Bold.ttf');

      if (fs.existsSync(amiriRegPath)) {
        const regBase64 = fs.readFileSync(amiriRegPath).toString('base64');
        const boldBase64 = fs.existsSync(amiriBoldPath)
          ? fs.readFileSync(amiriBoldPath).toString('base64')
          : null;

        fontFaces += `
          @font-face {
            font-family: 'Traditional Arabic';
            src: url('data:font/truetype;charset=utf-8;base64,${regBase64}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: block;
          }
          @font-face {
            font-family: 'Amiri';
            src: url('data:font/truetype;charset=utf-8;base64,${regBase64}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: block;
          }
        `;

        if (boldBase64) {
          fontFaces += `
            @font-face {
              font-family: 'Traditional Arabic';
              src: url('data:font/truetype;charset=utf-8;base64,${boldBase64}') format('truetype');
              font-weight: 700;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Traditional Arabic';
              src: url('data:font/truetype;charset=utf-8;base64,${boldBase64}') format('truetype');
              font-weight: 800;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Amiri';
              src: url('data:font/truetype;charset=utf-8;base64,${boldBase64}') format('truetype');
              font-weight: 700;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Amiri';
              src: url('data:font/truetype;charset=utf-8;base64,${boldBase64}') format('truetype');
              font-weight: 800;
              font-style: normal;
              font-display: block;
            }
          `;
        }
      }

      const notoPath = path.join(fontDir, 'NotoNaskhArabic.ttf');
      if (fs.existsSync(notoPath)) {
        const notoBase64 = fs.readFileSync(notoPath).toString('base64');
        // Variable font (contains fvar table): single 100..900 declaration provides native bold weights
        fontFaces += `
          @font-face {
            font-family: 'Noto Naskh Arabic';
            src: url('data:font/truetype;charset=utf-8;base64,${notoBase64}') format('truetype');
            font-weight: 100 900;
            font-style: normal;
            font-display: block;
          }
        `;
      }

      const lateefRegPath = path.join(fontDir, 'Lateef-Regular.ttf');
      const lateefSemiBoldPath = path.join(fontDir, 'Lateef-SemiBold.ttf');
      const lateefBoldPath = path.join(fontDir, 'Lateef-Bold.ttf');
      if (fs.existsSync(lateefRegPath)) {
        const lateefRegBase64 = fs.readFileSync(lateefRegPath).toString('base64');
        fontFaces += `
          @font-face {
            font-family: 'Lateef';
            src: url('data:font/truetype;charset=utf-8;base64,${lateefRegBase64}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: block;
          }
        `;
        if (fs.existsSync(lateefSemiBoldPath)) {
          const lateefSemiBase64 = fs.readFileSync(lateefSemiBoldPath).toString('base64');
          // Map 600 & 700 to Lateef SemiBold for crisp, balanced question headings (not overly heavy)
          fontFaces += `
            @font-face {
              font-family: 'Lateef';
              src: url('data:font/truetype;charset=utf-8;base64,${lateefSemiBase64}') format('truetype');
              font-weight: 600;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Lateef';
              src: url('data:font/truetype;charset=utf-8;base64,${lateefSemiBase64}') format('truetype');
              font-weight: 700;
              font-style: normal;
              font-display: block;
            }
          `;
        }
        if (fs.existsSync(lateefBoldPath)) {
          const lateefBoldBase64 = fs.readFileSync(lateefBoldPath).toString('base64');
          fontFaces += `
            @font-face {
              font-family: 'Lateef';
              src: url('data:font/truetype;charset=utf-8;base64,${lateefBoldBase64}') format('truetype');
              font-weight: 800;
              font-style: normal;
              font-display: block;
            }
          `;
        }
      }
    } catch (e) {
      console.warn('[pdfService] Failed reading embedded font files:', e);
    }
  }

  cachedFontCss = fontFaces;
  return cachedFontCss;
}

export function ensureEmbeddedFonts(html: string): string {
  const fontCss = getEmbeddedFontCss();
  if (!fontCss) return html;

  if (html.includes('id="proshno-embedded-fonts"')) {
    return html;
  }

  const styleTag = `<style id="proshno-embedded-fonts">\n${fontCss}\n</style>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${styleTag}\n</head>`);
  }
  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>\n${styleTag}`);
  }
  return `${styleTag}\n${html}`;
}

/**
 * Returns a live Chromium browser singleton, re-launching if the previous instance
 * crashed or disconnected. Safe to call concurrently — pages are isolated.
 */
async function getBrowser(): Promise<Browser> {
  // Re-use existing instance only if it is still connected
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // Null out any stale reference before launching a new browser
  browserInstance = null;

  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  // Auto-null the instance reference when it unexpectedly closes
  browserInstance.on('disconnected', () => {
    browserInstance = null;
    console.warn('[ProshnoAI PDF] Chromium browser disconnected — will re-launch on next request.');
  });

  return browserInstance;
}

/**
 * Opens a new page from the browser singleton. If the browser has silently crashed
 * (connected but newPage() throws), nulls out the instance and retries once with a
 * fresh browser.
 */
async function newPageSafe(): Promise<ReturnType<Browser['newPage']>> {
  let browser = await getBrowser();
  try {
    return await browser.newPage();
  } catch (err) {
    console.warn('[ProshnoAI PDF] newPage() failed — browser may have crashed. Re-launching...', err);
    browserInstance = null;
    browser = await getBrowser();
    return browser.newPage();
  }
}

export interface PdfRenderOptions {
  format?: 'A4' | 'Legal';
  landscape?: boolean;
}

/**
 * Renders an HTML string to a print-ready PDF buffer using Puppeteer.
 *
 * Uses `networkidle2` (at most 2 open connections) instead of `networkidle0`
 * to avoid 30-second hangs when the server cannot reach external font CDNs.
 * Hard timeout is 20 seconds — sufficient for local/cached font loads.
 */
export async function renderHtmlToPdf(
  html: string,
  options: PdfRenderOptions = { format: 'A4' }
): Promise<Buffer> {
  const finalHtml = ensureEmbeddedFonts(html);
  const page = await newPageSafe();

  try {
    const isLegal = options.format === 'Legal';
    const viewportWidth = isLegal ? 816 : 794;
    const viewportHeight = isLegal ? 1344 : 1123;
    await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: 2 });

    await page.setContent(finalHtml, {
      // networkidle2: at most 2 open connections — avoids 30s hangs on CDN timeouts
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: 25000,
    });

    // Wait for all Base64 and embedded fonts to finish loading in Chromium
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
        // Trigger reflow to finalize glyph layout & line heights
        void document.body.offsetHeight;
      }
    });

    const hasDiscreteA4Pages = finalHtml.includes('proshno-a4-page');

    // When rendering discrete WYSIWYG A4 pages cloned from live preview, emulate 'screen' media
    // so @media print rules never alter spacing, margins, or typography between preview and PDF.
    if (hasDiscreteA4Pages) {
      await page.emulateMediaType('screen');
    }

    const pdfBuffer = await page.pdf({
      ...(hasDiscreteA4Pages
        ? {
            width: isLegal ? '215.9mm' : '210mm',
            height: isLegal ? '355.6mm' : '297mm',
          }
        : {
            format: options.format || 'A4',
          }),
      landscape: options.landscape || false,
      printBackground: true,
      preferCSSPageSize: true,
      margin: hasDiscreteA4Pages
        ? {
            top: '0mm',
            right: '0mm',
            bottom: '0mm',
            left: '0mm',
          }
        : undefined,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    // Always close the page to free memory, even on error
    await page.close();
  }
}

/**
 * Generate Question Paper PDF
 */
export async function generateQuestionPaperPdf(
  paper: ExamPaperData,
  activeSetName?: string
): Promise<Buffer> {
  const html = generateQuestionPaperHtml(paper, activeSetName);
  return renderHtmlToPdf(html, { format: paper.layoutConfig.paperSize });
}

/**
 * Generate Teacher's Answer Key & Marking Guide PDF
 */
export async function generateAnswerKeyPdf(
  paper: ExamPaperData,
  activeSetName?: string
): Promise<Buffer> {
  const html = generateAnswerKeyHtml(paper, activeSetName);
  return renderHtmlToPdf(html, { format: paper.layoutConfig.paperSize });
}

/**
 * Generate OMR Answer Sheet PDF
 */
export async function generateOmrSheetPdf(
  paper: ExamPaperData,
  totalMcqs?: number
): Promise<Buffer> {
  const mcqCount =
    totalMcqs ||
    paper.questions.filter(
      (q) => q.typology === 'SIMPLE_MCQ' || q.typology === 'MULTIPLE_COMPLETION_MCQ'
    ).length ||
    30;

  const html = generateOmrSheetHtml(paper, mcqCount);
  return renderHtmlToPdf(html, { format: 'A4' });
}
