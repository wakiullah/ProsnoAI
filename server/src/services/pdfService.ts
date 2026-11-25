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
    path.resolve(process.cwd(), 'server/public/fonts'),
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
    // Use local HTTP loopback URLs instead of inlining ~5MB of duplicate Base64 into every HTML string.
    // Chromium fetches only the fonts actually used on the page in <2ms and caches them across renders,
    // preventing 25s Navigation timeouts on low-RAM/CPU Render containers.
    const port = process.env.PORT || 5000;
    const base = `http://127.0.0.1:${port}/fonts`;

    const hasAmiriReg = fs.existsSync(path.join(fontDir, 'Amiri-Regular.ttf'));
    const hasTradAr = fs.existsSync(path.join(fontDir, 'TraditionalArabic.ttf'));
    const hasAmiriBold = fs.existsSync(path.join(fontDir, 'Amiri-Bold.ttf'));
    const regFile = hasAmiriReg ? 'Amiri-Regular.ttf' : hasTradAr ? 'TraditionalArabic.ttf' : null;

    if (regFile) {
      fontFaces += `
        @font-face {
          font-family: 'Traditional Arabic';
          src: url('${base}/${regFile}') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Amiri';
          src: url('${base}/${regFile}') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `;
    }

    if (hasAmiriBold) {
      fontFaces += `
        @font-face {
          font-family: 'Traditional Arabic';
          src: url('${base}/Amiri-Bold.ttf') format('truetype');
          font-weight: 700 800;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Amiri';
          src: url('${base}/Amiri-Bold.ttf') format('truetype');
          font-weight: 700 800;
          font-style: normal;
          font-display: swap;
        }
      `;
    }

    if (fs.existsSync(path.join(fontDir, 'NotoNaskhArabic.ttf'))) {
      fontFaces += `
        @font-face {
          font-family: 'Noto Naskh Arabic';
          src: url('${base}/NotoNaskhArabic.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
      `;
    }

    if (fs.existsSync(path.join(fontDir, 'Lateef-Regular.ttf'))) {
      fontFaces += `
        @font-face {
          font-family: 'Lateef';
          src: url('${base}/Lateef-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `;
      if (fs.existsSync(path.join(fontDir, 'Lateef-SemiBold.ttf'))) {
        fontFaces += `
          @font-face {
            font-family: 'Lateef';
            src: url('${base}/Lateef-SemiBold.ttf') format('truetype');
            font-weight: 600 700;
            font-style: normal;
            font-display: swap;
          }
        `;
      }
      if (fs.existsSync(path.join(fontDir, 'Lateef-Bold.ttf'))) {
        fontFaces += `
          @font-face {
            font-family: 'Lateef';
            src: url('${base}/Lateef-Bold.ttf') format('truetype');
            font-weight: 800;
            font-style: normal;
            font-display: swap;
          }
        `;
      }
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
      '--no-zygote',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--mute-audio',
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
    // PDF output is vector-based; deviceScaleFactor: 1 saves 4x framebuffer RAM on 512MB Render containers
    await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1 });

    await page.setContent(finalHtml, {
      // domcontentloaded avoids 25s hangs when external font/CDN links are slow on Render
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for local loopback / system fonts to finish loading (capped at 5s so it never hangs)
    await page.evaluate(async () => {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
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
