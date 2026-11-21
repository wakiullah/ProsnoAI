import { ExamPaperData, GOOGLE_FONTS_EMBED_URL, MULTI_SCRIPT_CSS, renderMultiScriptHtml } from 'proshno-shared';

export function generateOmrSheetHtml(paper: ExamPaperData, totalMcqs: number = 30): string {
  const { headerConfig } = paper;

  // Determine how many columns to display (2 columns for <= 50, 4 columns for > 50)
  const cols = totalMcqs <= 50 ? 2 : 4;
  const perCol = Math.ceil(totalMcqs / cols);

  const columnBlocksHtml = Array.from({ length: cols })
    .map((_, colIdx) => {
      const startNum = colIdx * perCol + 1;
      const endNum = Math.min((colIdx + 1) * perCol, totalMcqs);

      const rows = [];
      for (let num = startNum; num <= endNum; num++) {
        const paddedNum = num < 10 ? `0${num}` : `${num}`;
        rows.push(`
          <div class="omr-row">
            <span class="omr-q-num">${paddedNum}</span>
            <div class="bubbles-group">
              <span class="bubble">ক</span>
              <span class="bubble">খ</span>
              <span class="bubble">গ</span>
              <span class="bubble">ঘ</span>
            </div>
          </div>
        `);
      }

      return `<div class="omr-column">${rows.join('')}</div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>OMR Sheet - ${headerConfig.examTitle}</title>
  <link rel="stylesheet" href="${GOOGLE_FONTS_EMBED_URL}">
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-size: 10pt;
      font-family: 'Inter', 'Noto Serif Bengali', sans-serif;
      color: #1a202c;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
      /* On-screen preview padding to ensure proper margins in the live view */
      padding: 12mm 15mm 12mm 15mm;
    }

    @media print {
      body {
        padding: 0 !important;
      }
    }

    ${MULTI_SCRIPT_CSS}

    /* OMR Alignment Markers (Corner & Side Timing Marks) */
    .omr-marker {
      position: absolute;
      width: 14px;
      height: 14px;
      background: #000000;
    }
    .marker-tl { top: -4px; left: -4px; }
    .marker-tr { top: -4px; right: -4px; }
    .marker-bl { bottom: -4px; left: -4px; }
    .marker-br { bottom: -4px; right: -4px; }

    .sheet-container {
      border: 2px solid #000000;
      padding: 12px;
      position: relative;
    }

    .omr-header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #000000;
    }

    .inst-title {
      font-size: 1.35em;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .sheet-subtitle {
      font-size: 1.1em;
      font-weight: 700;
      margin-top: 2px;
      text-transform: uppercase;
    }

    .info-bar {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-weight: 600;
      font-size: 0.9em;
    }

    /* Student Info & Sets Section */
    .candidate-section {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1.5px solid #000000;
    }

    .box-card {
      border: 1px solid #000000;
      padding: 6px 10px;
    }

    .box-title {
      font-weight: 700;
      font-size: 0.85em;
      margin-bottom: 6px;
      text-transform: uppercase;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2px;
    }

    .roll-grid {
      display: flex;
      gap: 4px;
    }

    .digit-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .digit-box {
      width: 18px;
      height: 20px;
      border: 1px solid #000000;
      margin-bottom: 4px;
    }

    .small-bubble {
      width: 15px;
      height: 15px;
      border: 1px solid #000000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      font-weight: 600;
    }

    .set-bubbles-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }

    .set-option {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }

    /* MCQ Answer Grid */
    .omr-grid-container {
      display: flex;
      justify-content: space-around;
      gap: 16px;
      margin-bottom: 16px;
    }

    .omr-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .omr-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 6px;
      border-bottom: 1px dotted #e2e8f0;
    }

    .omr-q-num {
      font-weight: 700;
      font-size: 0.88em;
      min-width: 24px;
    }

    .bubbles-group {
      display: flex;
      gap: 8px;
    }

    .bubble {
      width: 19px;
      height: 19px;
      border: 1.2px solid #000000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 700;
      background: #ffffff;
    }

    /* Signatures Section */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding: 0 20px;
    }

    .sig-line {
      width: 200px;
      border-top: 1px solid #000000;
      text-align: center;
      padding-top: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="sheet-container">
    <div class="omr-marker marker-tl"></div>
    <div class="omr-marker marker-tr"></div>
    <div class="omr-marker marker-bl"></div>
    <div class="omr-marker marker-br"></div>

    <header class="omr-header">
      <div class="inst-title">${renderMultiScriptHtml(headerConfig.institutionName)}</div>
      <div class="sheet-subtitle">বহুনির্বাচনী উত্তরপত্র (OMR ANSWER SHEET)</div>
      <div class="info-bar">
        <span>পরীক্ষা: ${renderMultiScriptHtml(headerConfig.examTitle)}</span>
        <span>বিষয়: ${renderMultiScriptHtml(headerConfig.subject)}</span>
        <span>পূর্ণমান: ${headerConfig.totalMarks}</span>
      </div>
    </header>

    <section class="candidate-section">
      <!-- Roll Number Section -->
      <div class="box-card">
        <div class="box-title">পরীক্ষার্থীর রোল নম্বর (ROLL NO)</div>
        <div class="roll-grid">
          ${Array.from({ length: 6 })
            .map(
              () => `
            <div class="digit-col">
              <div class="digit-box"></div>
              ${Array.from({ length: 10 })
                .map((_, d) => `<span class="small-bubble">${d}</span>`)
                .join('')}
            </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- Set Code Section -->
      <div class="box-card">
        <div class="box-title">প্রশ্ন সেট কোড (SET)</div>
        <div class="set-bubbles-group">
          <div class="set-option"><span class="small-bubble" style="width: 20px; height: 20px;">ক</span> Set A</div>
          <div class="set-option"><span class="small-bubble" style="width: 20px; height: 20px;">খ</span> Set B</div>
          <div class="set-option"><span class="small-bubble" style="width: 20px; height: 20px;">গ</span> Set C</div>
          <div class="set-option"><span class="small-bubble" style="width: 20px; height: 20px;">ঘ</span> Set D</div>
        </div>
      </div>

      <!-- Instructions Section -->
      <div class="box-card">
        <div class="box-title">নির্দেশাবলি</div>
        <ul style="font-size: 7.8pt; line-height: 1.4; padding-left: 12px; margin-top: 4px;">
          <li>কালো কালির বলপয়েন্ট কলম দিয়ে বৃত্ত ভরাট করুন।</li>
          <li>প্রতিটি প্রশ্নের জন্য কেবল একটি বৃত্ত ভরাট করুন।</li>
          <li>বৃত্তের বাইরে দাগ দেওয়া সম্পূর্ণ নিষিদ্ধ।</li>
          <li>উত্তরপত্র ভাঁজ করা যাবে না।</li>
        </ul>
      </div>
    </section>

    <!-- OMR Question Rows -->
    <main class="omr-grid-container">
      ${columnBlocksHtml}
    </main>

    <footer class="signatures-row">
      <div class="sig-line">পরীক্ষার্থীর স্বাক্ষর</div>
      <div class="sig-line">কক্ষ পরিদর্শকের স্বাক্ষর ও তারিখ</div>
    </footer>
  </div>
</body>
</html>`;
}
