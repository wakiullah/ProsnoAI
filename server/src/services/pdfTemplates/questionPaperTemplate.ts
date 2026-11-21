import {
  ExamPaperData,
  GOOGLE_FONTS_EMBED_URL,
  MULTI_SCRIPT_CSS,
  NumberingFormat,
  QuestionData,
  WritingBoxConfig,
  formatMarksBadge,
  formatNumberByScript,
  formatQuestionNumber,
  formatSubQuestionPart,
  renderMultiScriptHtml,
} from 'proshno-shared';

export function generateQuestionPaperHtml(paper: ExamPaperData, activeSetName?: string): string {
  const { headerConfig, layoutConfig } = paper;
  const isTwoCol = layoutConfig.columns === 2;
  const numberingFormat: NumberingFormat = layoutConfig.numberingFormat || 'bn';

  // Find questions for the active set if specified
  let questionsToRender: QuestionData[] = paper.questions;
  let currentSetName = activeSetName || paper.activeSet || '';

  if (paper.sets && paper.sets.length > 0) {
    const selectedSet =
      paper.sets.find((s) => s.setName === currentSetName) || paper.sets[0];
    currentSetName = selectedSet.setName;
    questionsToRender = selectedSet.questionEntries.map(
      (entry) => entry.customQuestionData || paper.questions.find((q) => q._id?.toString() === entry.questionId) || ({} as QuestionData)
    );
  }

  const isArabicPaper =
    layoutConfig.numberingFormat === 'ar' ||
    Boolean(headerConfig.subject?.includes('আরবি')) ||
    Boolean(headerConfig.subject?.includes('العربية')) ||
    Boolean(headerConfig.subject?.includes('Arabic'));
  const selectedArabicFont = layoutConfig.arabicFont || 'Traditional Arabic';
  const arabicFontFamily = `'${selectedArabicFont}', 'Traditional Arabic', 'Noto Naskh Arabic', 'Lateef', serif`;
  const paperLineHeight = layoutConfig.lineHeight ?? 1.5;

  const isNooraniPreset =
    headerConfig.headerPreset === 'NOORANI' || headerConfig.educationStream === 'NOORANI';
  const fontSizeMap = {
    compact: isArabicPaper ? '11.5px' : (isNooraniPreset ? '13pt' : '9.5pt'),
    standard: isArabicPaper ? '13.5px' : (isNooraniPreset ? '14.5pt' : '11pt'),
    large: isArabicPaper ? '15.5px' : (isNooraniPreset ? '16pt' : '12.5pt'),
  };
  const baseFontSize = layoutConfig.customFontSizePt
    ? `${layoutConfig.customFontSizePt}pt`
    : (fontSizeMap[layoutConfig.fontSize] || (isArabicPaper ? '13.5px' : (isNooraniPreset ? '14.5pt' : '11pt')));

  const watermarkHtml = layoutConfig.watermarkText
    ? `<div class="watermark">${renderMultiScriptHtml(layoutConfig.watermarkText)}</div>`
    : '';

  let questionsHtml = '';

  if (paper.sections && paper.sections.length > 0) {
    const sortedSections = [...paper.sections].sort((a, b) => a.order - b.order);

    const sectionBlocks = sortedSections.map((sec) => {
      const sectionQuestions = questionsToRender.filter((q) => q.sectionId === sec.id);
      if (sectionQuestions.length === 0) return '';

      const sectionQuestionsHtml = sectionQuestions
        .map((q) => {
          const globalIdx = questionsToRender.indexOf(q) + 1;
          return renderSingleQuestion(q, globalIdx, layoutConfig.showMarks, numberingFormat);
        })
        .join('\n');

      return `
      <div class="exam-section-banner">
        <div class="section-title-wrap">
          <span class="section-title">[ ${renderMultiScriptHtml(sec.name)} ]</span>
        </div>
        ${
          sec.instructions || sec.displayMarksFormula
            ? `<div class="section-meta-row">
                 <span class="section-instruction">${sec.instructions ? renderMultiScriptHtml(sec.instructions) : ''}</span>
                 <span class="section-marks-formula">${sec.displayMarksFormula ? renderMultiScriptHtml(sec.displayMarksFormula) : ''}</span>
               </div>`
            : ''
        }
      </div>
      ${sectionQuestionsHtml}
      `;
    });

    const unassigned = questionsToRender.filter(
      (q) => !q.sectionId || !paper.sections?.some((s) => s.id === q.sectionId)
    );
    let unassignedHtml = '';
    if (unassigned.length > 0) {
      const unassignedQuestionsHtml = unassigned
        .map((q) => {
          const globalIdx = questionsToRender.indexOf(q) + 1;
          return renderSingleQuestion(q, globalIdx, layoutConfig.showMarks, numberingFormat);
        })
        .join('\n');

      unassignedHtml = `
      <div class="exam-section-banner">
        <div class="section-title-wrap">
          <span class="section-title">[ সাধারণ প্রশ্নাবলী ]</span>
        </div>
      </div>
      ${unassignedQuestionsHtml}
      `;
    }

    questionsHtml = [...sectionBlocks, unassignedHtml].filter(Boolean).join('\n');
  } else {
    questionsHtml = questionsToRender
      .map((q, idx) => renderSingleQuestion(q, idx + 1, layoutConfig.showMarks, numberingFormat))
      .join('\n');
  }

  const topMargin = layoutConfig.margins?.topMm || 14;
  const bottomMargin = layoutConfig.margins?.bottomMm || 14;
  const leftMargin = layoutConfig.margins?.leftMm || 18;
  const rightMargin = layoutConfig.margins?.rightMm || 18;

  return `<!DOCTYPE html>
<html lang="${isArabicPaper ? 'ar' : 'bn'}" dir="${isArabicPaper ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${headerConfig.examTitle} - ${headerConfig.subject}</title>
  <link rel="stylesheet" href="${GOOGLE_FONTS_EMBED_URL}">
  <style>
    @page {
      size: ${layoutConfig.paperSize};
      margin: ${topMargin}mm ${rightMargin}mm ${bottomMargin}mm ${leftMargin}mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-size: ${baseFontSize};
      font-family: ${isArabicPaper ? arabicFontFamily : "'Noto Serif Bengali', 'Times New Roman', serif"};
      line-height: ${paperLineHeight};
      color: #1a202c;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
      padding: 0;
      font-synthesis: weight style;
    }

    ${MULTI_SCRIPT_CSS}

    .script-ar, .font-ar, [dir="rtl"] {
      font-family: ${arabicFontFamily} !important;
      line-height: ${paperLineHeight} !important;
      font-synthesis: weight style !important;
    }

    /* Clean natural bold for question headings & numbers in PDF */
    .q-number, .q-stem, .q-heading-bold, .section-title, .group-title-banner,
    .q-number .script-ar, .q-stem .script-ar, .q-heading-bold .script-ar,
    .q-number .font-ar, .q-stem .font-ar, .q-heading-bold .font-ar,
    .section-title .script-ar, .group-title-banner .script-ar {
      font-weight: 700 !important;
      font-synthesis: weight style !important;
    }

    .watermark {
      position: fixed;
      top: 35%;
      left: 15%;
      width: 70%;
      text-align: center;
      transform: rotate(-35deg);
      font-size: 55pt;
      font-weight: 700;
      color: rgba(160, 174, 192, 0.12);
      z-index: -1;
      pointer-events: none;
      text-transform: uppercase;
      letter-spacing: 4px;
    }

    /* Exam Header */
    .exam-header {
      text-align: center;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2d3748;
    }

    .institution-name {
      font-size: 1.85em;
      font-weight: 800;
      margin-bottom: 2px;
      color: #1a202c;
    }

    .institution-address {
      font-size: 0.9em;
      color: #4a5568;
      margin-bottom: 4px;
    }

    .exam-title {
      font-size: 1.35em;
      font-weight: 700;
      margin-bottom: 4px;
      text-decoration: none;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 0.95em;
      margin-top: 6px;
      padding: 0 4px;
    }

    .set-badge {
      display: inline-block;
      padding: 2px 10px;
      border: 1.5px solid #2d3748;
      border-radius: 4px;
      font-weight: 700;
      font-size: 1em;
      background: #f7fafc;
    }

    .instructions-box {
      margin-top: 6px;
      font-size: 0.88em;
      font-style: italic;
      color: #4a5568;
      text-align: center;
      line-height: 1.4;
    }

    /* Layout Columns */
    .paper-content {
      text-align: ${isArabicPaper ? 'right' : 'left'};
      ${
        isTwoCol
          ? `column-count: 2;
             column-gap: 24px;
             column-rule: 1px solid #cbd5e0;
             column-fill: balance;`
          : 'display: block;'
      }
    }

    /* Section / Group Banner (বিভাগ / খণ্ড / অংশ - Clean bold, no background, no borders) */
    .exam-section-banner {
      break-inside: avoid;
      page-break-after: avoid;
      break-after: avoid;
      margin: 8px 0 3px 0;
      padding: 3px 0;
      background: transparent;
      border: none;
      text-align: center;
    }

    .section-title-wrap {
      margin-bottom: 2px;
    }

    .section-title {
      font-size: 1.1em;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.3px;
    }

    .section-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.92em;
      font-weight: 600;
      color: #2d3748;
      margin-top: 4px;
      padding: 0 4px;
    }

    .section-instruction {
      font-style: italic;
      color: #4a5568;
      text-align: left;
      flex: 1;
    }

    .section-marks-formula {
      font-weight: 700;
      white-space: nowrap;
      margin-left: 12px;
      color: #1a202c;
      text-align: right;
    }

    /* Question Formatting */
    .question-block {
      break-inside: avoid;
      margin-bottom: 12px;
      padding-bottom: 6px;
    }

    .full-width-block {
      column-span: all;
      break-inside: avoid;
      margin-bottom: 14px;
      background: #f8fafc;
      padding: 8px 12px;
      border-left: 3px solid #4a5568;
      border-radius: 2px;
    }

    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 8px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .q-header-main {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      flex: 1;
    }

    .q-number {
      font-weight: 700;
      flex-shrink: 0;
      margin-inline-end: 2px;
    }

    .q-marks {
      font-size: 0.9em;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      flex-shrink: 0;
      margin-inline-start: 6px;
    }

    .q-stem {
      flex: 1;
      line-height: ${paperLineHeight};
      font-weight: 700;
    }

    .q-paragraph, .passage-text, .ibarat-box {
      text-align: justify;
    }

    /* MCQ Options Grid */
    .mcq-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 12px;
      margin-top: 6px;
      padding-left: 12px;
    }

    .mcq-option {
      display: flex;
      align-items: baseline;
      font-size: 0.96em;
    }

    .opt-label {
      font-weight: 700;
      margin-right: 5px;
      min-width: 18px;
    }

    /* Statements list (i, ii, iii) */
    .statements-list {
      margin: 4px 0 6px 14px;
      list-style-type: none;
    }

    .statement-item {
      font-size: 0.96em;
      line-height: 1.4;
    }

    /* Creative Questions (CQ) */
    .cq-sub-questions {
      margin-top: 6px;
      padding-left: 14px;
    }

    .cq-sub-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 0.96em;
    }

    .cq-part {
      font-weight: 700;
      margin-right: 6px;
    }

    /* Matching Table */
    .matching-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 0.92em;
    }

    .matching-table th, .matching-table td {
      border: 1px solid #cbd5e0;
      padding: 4px 8px;
      vertical-align: top;
      text-align: left;
    }

    .matching-table th {
      background: #edf2f7;
      font-weight: 700;
    }

    /* Fill Blanks Clues Box (Segmented Table with Crisp Vertical Dividers) */
    .word-clues-wrap {
      margin: 6px 0 8px 0;
      display: flex;
      justify-content: center;
    }

    .word-clues-table {
      border-collapse: collapse;
      border: 1.5px solid #1e293b;
      background: #f8fafc;
      margin: 0 auto;
      font-size: 0.92em;
      font-weight: 700;
      color: #0f172a;
    }

    .word-clues-table td {
      border: 1px solid #334155;
      padding: 3px 14px;
      text-align: center;
      white-space: nowrap;
    }

      /* Answer Writing Lines for Noorani / Kids Worksheets */
      .answer-space-lines {
        margin: 6px 0 10px 0;
        width: 100%;
      }

      .writing-line {
        border-bottom: 1.5px dotted #94a3b8;
        height: 24px;
        margin: 3px 0;
        width: 100%;
      }

      /* Qawmi Traditional Preset Styles */
      .qawmi-bismillah {
        font-family: 'Amiri', serif;
        font-size: 1.45em;
        font-weight: 700;
        text-align: center;
        margin-bottom: 3px;
        direction: rtl;
        color: #1e293b;
      }

      .qawmi-choice-banner {
        margin: 6px auto;
        padding: 3px 14px;
        background: #f8fafc;
        border: 1.5px dashed #475569;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.98em;
        text-align: center;
        width: fit-content;
        color: #0f172a;
      }

      /* Noorani Preset Styles */
      .noorani-student-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        border-top: 1px solid #cbd5e1;
        border-bottom: 1.5px solid #1e293b;
        padding: 8px 4px;
        margin-top: 8px;
        font-size: 0.96em;
        font-weight: 600;
        background: #fbfcfe;
      }

      .fill-in-line {
        display: inline-block;
        border-bottom: 1px solid #64748b;
        min-width: 80px;
        height: 14px;
      }

      /* Ibarat quote box for Tarjama/Tashreeh & Tarkib */
      .ibarat-box {
        margin: 6px 0 10px 0;
        padding: 8px 12px;
        background: #fdfdfd;
        border: 1px solid #cbd5e1;
        border-left: 3.5px solid #0f766e;
        border-radius: 3px;
        line-height: 1.9;
        font-size: 1.05em;
      }

      /* Tahqeeq & Sigha Table */
      .tahqeeq-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
        font-size: 0.9em;
      }

      .tahqeeq-table th, .tahqeeq-table td {
        border: 1px solid #cbd5e0;
        padding: 4px 6px;
        text-align: center;
        vertical-align: middle;
      }

      .tahqeeq-table th {
        background: #f1f5f9;
        font-weight: 700;
      }

      /* Noorani Board Grid Header & Boxes */
      .noorani-grid-header {
        border: 1.5px solid #000000;
        margin-bottom: 12px;
        padding: 0;
        background: #ffffff;
      }
      .noorani-grid-header-inner {
        display: flex;
        flex-direction: row;
        width: 100%;
      }
      .noorani-header-left {
        flex: 1;
        border-right: 1.5px solid #000000;
        padding: 8px 12px 6px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .noorani-board-name {
        text-align: center;
        font-size: 1.45em;
        font-weight: 800;
        line-height: 1.25;
        color: #000000;
      }
      .noorani-exam-title {
        text-align: center;
        font-size: 1.18em;
        font-weight: 700;
        margin: 2px 0 4px 0;
        color: #000000;
      }
      .noorani-class-subject {
        display: flex;
        justify-content: space-around;
        font-size: 1.05em;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .noorani-badge-wrap {
        text-align: center;
        margin: 2px 0 6px 0;
      }
      .noorani-answer-badge {
        display: inline-block;
        border: 1.5px solid #000000;
        border-radius: 12px;
        padding: 1px 16px;
        font-size: 1.05em;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .noorani-student-lines {
        font-size: 0.95em;
        margin-bottom: 6px;
      }
      .student-line-row {
        display: flex;
        align-items: baseline;
        margin-bottom: 4px;
      }
      .student-meta-split {
        display: flex;
        gap: 16px;
      }
      .dotted-fill-line {
        flex: 1;
        border-bottom: 1px dotted #000000;
        margin-left: 4px;
        min-height: 12px;
      }
      .noorani-signatures-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000000;
        font-size: 0.82em;
        text-align: center;
      }
      .noorani-signatures-table td {
        border: 1px solid #000000;
        padding: 2px 4px;
      }
      .noorani-header-right {
        width: 145px;
        flex-shrink: 0;
      }
      .noorani-rubric-table {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
        font-size: 0.86em;
        text-align: center;
      }
      .noorani-rubric-table th, .noorani-rubric-table td {
        border: 1px solid #000000;
        padding: 2.5px 4px;
      }
      .rubric-header-main {
        font-weight: 800;
        background: #f8fafc;
        font-size: 1.05em;
        border-top: none !important;
        border-right: none !important;
      }
      .rubric-col-q {
        width: 50%;
        font-weight: 700;
      }
      .rubric-col-marks {
        width: 50%;
        font-weight: 700;
      }
      .rubric-total-row {
        font-weight: 800;
        text-align: left;
        padding-left: 8px;
        height: 28px;
      }

      /* Writing Boxes & Grids */
      .writing-boxes-container {
        margin-top: 6px;
        margin-bottom: 8px;
      }
      .writing-box-row {
        display: flex;
        flex-direction: row;
      }
      .writing-box-item {
        width: 13mm;
        height: 11mm;
        border: 1.5px solid #000000;
        margin-right: -1.5px; /* collapse adjacent borders */
        background: #ffffff;
      }
      .writing-grid-table {
        border-collapse: collapse;
        border: 1.5px solid #000000;
        margin: 0 auto;
        width: 100%;
      }
      .writing-grid-cell {
        border: 1.5px solid #000000;
        height: 12mm;
        text-align: center;
        vertical-align: middle;
        font-size: 1.35em;
        font-weight: 700;
      }
      .writing-grid-cell.text-arabic {
        font-family: 'Scheherazade New', 'Amiri', serif;
        font-size: 1.5em;
        direction: rtl;
      }
      .writing-grid-cell.cross-mark {
        font-family: sans-serif;
        font-weight: bold;
        color: #000000;
        font-size: 1.1em;
      }
      .noorani-handwriting-footer {
        text-align: center;
        margin-top: 14px;
        font-size: 1em;
        font-weight: 700;
        color: #000000;
      }
    </style>
  </head>
  <body>
    ${watermarkHtml}

    ${renderHeaderHtml(headerConfig, currentSetName, numberingFormat, questionsToRender.length, layoutConfig)}

    <main class="paper-content">
      ${questionsHtml}
    </main>

    ${
      headerConfig.handwritingMarks
        ? `<div class="noorani-handwriting-footer">
            সুন্দর ও নির্ভুল হাতের লেখার জন্য- ${formatNumberByScript(headerConfig.handwritingMarks, numberingFormat)} নম্বর।
          </div>`
        : ''
    }
  </body>
  </html>`;
}

function renderHeaderHtml(
  headerConfig: any,
  currentSetName: string,
  numberingFormat: NumberingFormat = 'bn',
  questionCount: number = 7,
  layoutConfig?: any
): string {
  const preset =
    headerConfig.headerPreset ||
    (headerConfig.educationStream === 'QAWMI'
      ? 'QAWMI'
      : headerConfig.educationStream === 'NOORANI'
      ? 'NOORANI'
      : 'NCTB');

  // Choice rule banner if specified (e.g. "যেকোনো ৫টি প্রশ্নের উত্তর দাও")
  let choiceBannerHtml = '';
  if (headerConfig.choiceInstructionText) {
    choiceBannerHtml = `<div class="qawmi-choice-banner">【 ${renderMultiScriptHtml(headerConfig.choiceInstructionText)} 】</div>`;
  } else if (headerConfig.questionsToAnswer) {
    choiceBannerHtml = `<div class="qawmi-choice-banner">【 যেকোনো ${headerConfig.questionsToAnswer}টি প্রশ্নের উত্তর দাও 】</div>`;
  }

  // 1. NOORANI / SHISHU GRID WORKSHEET PRESET (Exact match to board exam image)
  if (preset === 'NOORANI_GRID') {
    const qCount = Math.max(questionCount || 7, 7);
    let rubricRowsHtml = '';
    for (let i = 1; i <= qCount; i++) {
      const qNum = formatNumberByScript(String(i).padStart(2, '0'), numberingFormat);
      rubricRowsHtml += `
        <tr>
          <td class="rubric-col-q">${qNum}</td>
          <td class="rubric-col-marks"></td>
        </tr>`;
    }

    return `
    <header class="noorani-grid-header">
      <div class="noorani-grid-header-inner">
        <!-- Left Section: Board, Exam, Subject, Student, Examiner Table (~72%) -->
        <div class="noorani-header-left">
          <div class="noorani-board-name">${renderMultiScriptHtml(headerConfig.nooraniBoardTitle || headerConfig.institutionName || 'ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ')}</div>
          <div class="noorani-exam-title">${renderMultiScriptHtml(headerConfig.examTitle || 'নূরানী বার্ষিক পরীক্ষা- ২০২৬')}</div>
          <div class="noorani-class-subject">
            <span>শ্রেণি- <b>${renderMultiScriptHtml(headerConfig.grade || headerConfig.jamat || 'নার্সারী')}</b></span>
            <span>বিষয়: <b>${renderMultiScriptHtml(headerConfig.subject || 'আরবী লিখা')}</b></span>
          </div>
          <div class="noorani-badge-wrap">
            <span class="noorani-answer-badge">উত্তর পত্র</span>
          </div>
          <div class="noorani-student-lines">
            <div class="student-line-row">
              <span style="font-weight: 600;">ছাত্র/ছাত্রীর নাম: </span>
              <span class="dotted-fill-line"></span>
            </div>
            <div class="student-meta-split">
              <div style="flex: 1; display: flex; align-items: baseline;">
                <span style="font-weight: 600;">রোল নং : </span>
                <span class="dotted-fill-line"></span>
              </div>
              <div style="flex: 1; display: flex; align-items: baseline;">
                <span style="font-weight: 600;">তারিখ : </span>
                <span class="dotted-fill-line"></span>
              </div>
            </div>
          </div>
          <!-- Examiner Signatures Table -->
          <table class="noorani-signatures-table">
            <tbody>
              <tr>
                <td>পরীক্ষকের স্বাক্ষর</td>
                <td>কক্ষ পরিদর্শকের স্বাক্ষর</td>
                <td style="text-align: left; padding-left: 6px;">সর্বোচ্চ নম্বর =</td>
              </tr>
              <tr>
                <td style="height: 18px;"></td>
                <td></td>
                <td style="text-align: left; padding-left: 6px;">অবস্থান =</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right Section: Score Rubric Sheet (~28%) -->
        <div class="noorani-header-right">
          <table class="noorani-rubric-table">
            <thead>
              <tr>
                <th colspan="2" class="rubric-header-main">পূর্ণমান = ${formatNumberByScript(headerConfig.totalMarks || 100, numberingFormat)}</th>
              </tr>
              <tr>
                <th class="rubric-col-q">প্রশ্ন নং</th>
                <th class="rubric-col-marks">প্রাপ্ত নম্বর</th>
              </tr>
            </thead>
            <tbody>
              ${rubricRowsHtml}
              <tr class="rubric-total-row">
                <td colspan="2"><b>মোট =</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </header>`;
  }

  // 2. QAWMI / BEFAQ TRADITIONAL PRESET
  if (preset === 'QAWMI') {
    const bismillah =
      headerConfig.bismillahText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

    return `
    <header class="exam-header" style="border-bottom: 2px solid #1e293b; padding-bottom: 8px;">
      <div class="qawmi-bismillah">${renderMultiScriptHtml(bismillah)}</div>
      <div class="institution-name" style="font-size: 1.55em; letter-spacing: 0.5px;">${renderMultiScriptHtml(headerConfig.institutionName)}</div>
      ${
        headerConfig.institutionAddress
          ? `<div class="institution-address">${renderMultiScriptHtml(headerConfig.institutionAddress)}</div>`
          : ''
      }
      <div class="exam-title" style="font-size: 1.25em; text-decoration: underline; margin: 4px 0;">${renderMultiScriptHtml(headerConfig.examTitle)}</div>

      <div class="meta-row" style="margin-top: 8px; font-size: 1.02em;">
        <div>কিতাব / বিষয়: <b>${renderMultiScriptHtml(headerConfig.kitab || headerConfig.subject)}</b></div>
        ${currentSetName ? `<div class="set-badge">${renderMultiScriptHtml(currentSetName)}</div>` : ''}
        <div>জামাত: <b>${renderMultiScriptHtml(headerConfig.jamat || headerConfig.grade || '---')}</b></div>
      </div>

      <div class="meta-row" style="margin-top: 4px; font-size: 0.95em; color: #334155;">
        <div>সময়: ${renderMultiScriptHtml(headerConfig.timeAllowed)}</div>
        <div>পূর্ণমান: <b>${headerConfig.totalMarks}</b></div>
      </div>

      ${choiceBannerHtml}

      ${
        headerConfig.generalInstructions && headerConfig.generalInstructions.length > 0
          ? `<div class="instructions-box" style="margin-top: 6px;">
              ${headerConfig.generalInstructions.map((ins: string) => `[ ${renderMultiScriptHtml(ins)} ]`).join(' ')}
            </div>`
          : ''
      }
    </header>`;
  }

  // 2. NOORANI / PRIMARY WORKSHEET PRESET
  if (preset === 'NOORANI') {
    return `
    <header class="exam-header" style="border-bottom: 2px solid #0f172a; padding-bottom: 10px;">
      <div class="institution-name" style="font-size: 1.6em; color: #0f172a;">${renderMultiScriptHtml(headerConfig.institutionName)}</div>
      ${
        headerConfig.institutionAddress
          ? `<div class="institution-address" style="font-size: 0.95em;">${renderMultiScriptHtml(headerConfig.institutionAddress)}</div>`
          : ''
      }
      <div class="exam-title" style="font-size: 1.3em; margin: 3px 0; color: #1e3a8a;">${renderMultiScriptHtml(headerConfig.examTitle)}</div>

      <div class="meta-row" style="margin-top: 6px; font-size: 1.05em;">
        <div>বিষয়: <b>${renderMultiScriptHtml(headerConfig.subject)}</b></div>
        ${currentSetName ? `<div class="set-badge">${renderMultiScriptHtml(currentSetName)}</div>` : ''}
        <div>সময়: ${renderMultiScriptHtml(headerConfig.timeAllowed)}</div>
        <div>পূর্ণমান: <b>${headerConfig.totalMarks}</b></div>
      </div>

      <!-- Student Info Fill-in lines for in-paper worksheet -->
      <div class="noorani-student-meta">
        <div>পরীক্ষার্থীর নাম: <span class="fill-in-line" style="min-width: 160px;"></span></div>
        <div>রোল: <span class="fill-in-line" style="min-width: 60px;"></span></div>
        <div>শ্রেণি: <span class="fill-in-line" style="min-width: 80px;">${renderMultiScriptHtml(headerConfig.grade || headerConfig.jamat || '')}</span></div>
        <div>শাখা: <span class="fill-in-line" style="min-width: 60px;"></span></div>
        <div>তারিখ: <span class="fill-in-line" style="min-width: 90px;"></span></div>
      </div>

      ${choiceBannerHtml}
    </header>`;
  }

  // 3. ARABIC / DAKHIL MADRASAH PRESET
  const isArabicPaper =
    numberingFormat === 'ar' ||
    Boolean(headerConfig.subject?.includes('আরবি')) ||
    Boolean(headerConfig.subject?.includes('العربية')) ||
    Boolean(headerConfig.subject?.includes('Arabic'));

  if (isArabicPaper) {
    const timeAllowed = headerConfig.timeAllowed || 'ثلاث ساعات';
    const totalMarks = headerConfig.totalMarks || 100;
    const arabicTotalMarks = numberingFormat === 'ar' ? formatNumberByScript(totalMarks, 'ar') : totalMarks;

    return `
    <header class="exam-header" dir="rtl" style="font-family: '${layoutConfig.arabicFont || 'Traditional Arabic'}', 'Traditional Arabic', 'Noto Naskh Arabic', serif; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
      <div class="institution-name" style="font-size: 1.35em; font-weight: 800; color: #0f172a;">${renderMultiScriptHtml(headerConfig.institutionName || 'بهيربهيري عالم مدرسة - تاكورغاو')}</div>
      <div class="exam-title" style="font-size: 1.15em; font-weight: 700; margin: 2px 0 4px 0; color: #1e293b;">${renderMultiScriptHtml(headerConfig.examTitle || 'الإمتحان التَّأهيلي - ٢٠٢٦')}</div>
      ${headerConfig.grade ? `<div style="font-size: 0.92em; font-weight: 700; color: #475569; margin-bottom: 4px;">${renderMultiScriptHtml(headerConfig.grade)}</div>` : ''}

      <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #64748b; padding-top: 4px; margin-top: 6px; font-weight: 700; font-size: 0.95em;">
        <div>الوقت : <span>${renderMultiScriptHtml(timeAllowed)}</span></div>
        <div>الموضوع : <span style="font-weight: 800;">${renderMultiScriptHtml(headerConfig.subject || 'اللغة العربية الإتصالية')}</span></div>
        ${currentSetName ? `<div class="set-badge">${renderMultiScriptHtml(currentSetName)}</div>` : ''}
        <div>الدرجات الكاملة : <span style="font-weight: 800;">${renderMultiScriptHtml(arabicTotalMarks)}</span></div>
      </div>

      ${
        headerConfig.generalInstructions && headerConfig.generalInstructions.length > 0
          ? `<div class="instructions-box" style="margin-top: 5px; font-style: italic; font-size: 0.88em; color: #475569;">
              ${headerConfig.generalInstructions.map((ins: string) => `[ ${renderMultiScriptHtml(ins)} ]`).join(' ')}
            </div>`
          : ''
      }
    </header>`;
  }

  // 4. NCTB / GENERAL BOARD PRESET (Default)
  return `
  <header class="exam-header">
    <div class="institution-name">${renderMultiScriptHtml(headerConfig.institutionName)}</div>
    ${
      headerConfig.institutionAddress
        ? `<div class="institution-address">${renderMultiScriptHtml(headerConfig.institutionAddress)}</div>`
        : ''
    }
    <div class="exam-title">${renderMultiScriptHtml(headerConfig.examTitle)}</div>
    
    <div class="meta-row">
      <div>বিষয়: ${renderMultiScriptHtml(headerConfig.subject)} ${
        headerConfig.subjectCode ? `(বিষয় কোড: ${renderMultiScriptHtml(headerConfig.subjectCode)})` : ''
      } ${headerConfig.grade ? `| শ্রেণি: ${renderMultiScriptHtml(headerConfig.grade)}` : ''}</div>
      ${currentSetName ? `<div class="set-badge">${renderMultiScriptHtml(currentSetName)}</div>` : ''}
      <div>সময়: ${renderMultiScriptHtml(headerConfig.timeAllowed)}</div>
      <div>পূর্ণমান: ${headerConfig.totalMarks}</div>
    </div>

    ${choiceBannerHtml}

    ${
      headerConfig.generalInstructions && headerConfig.generalInstructions.length > 0
        ? `<div class="instructions-box">
            ${headerConfig.generalInstructions.map((ins: string) => `[ ${renderMultiScriptHtml(ins)} ]`).join(' ')}
          </div>`
        : ''
    }
  </header>`;
}

function renderWritingBoxesHtml(config: WritingBoxConfig): string {
  if (config.type === 'grid') {
    const rows = config.rows || 3;
    const cols = config.cols || 5;
    const cells = config.cells || [];

    let tableRows = '';
    for (let r = 0; r < rows; r++) {
      let rowHtml = '';
      for (let c = 0; c < cols; c++) {
        const val = cells[r] && cells[r][c] ? cells[r][c] : '';
        const isArabic = /[\u0600-\u06FF]/.test(val);
        const isCross = val === '×' || val === 'x' || val === 'X';
        const cellClass = isArabic ? 'text-arabic' : isCross ? 'cross-mark' : '';
        rowHtml += `<td class="writing-grid-cell ${cellClass}">${renderMultiScriptHtml(val)}</td>`;
      }
      tableRows += `<tr>${rowHtml}</tr>`;
    }
    return `
      <div class="writing-boxes-container">
        <table class="writing-grid-table">
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>`;
  }

  // Row of boxes
  const count = config.count || 4;
  let boxesHtml = '';
  for (let i = 0; i < count; i++) {
    boxesHtml += `<div class="writing-box-item"></div>`;
  }
  return `
    <div class="writing-boxes-container">
      <div class="writing-box-row">
        ${boxesHtml}
      </div>
    </div>`;
}

function renderSingleQuestion(
  q: QuestionData,
  order: number,
  showMarks: boolean,
  numberingFormat: NumberingFormat = 'bn'
): string {
  const qNumberDisplay =
    q.customNumber !== undefined && q.customNumber !== ''
      ? q.customNumber
      : formatQuestionNumber(order, numberingFormat, 'dot');

  const marksDisplay =
    q.customMarksText !== undefined && q.customMarksText !== ''
      ? q.customMarksText
      : showMarks && q.marks
      ? formatMarksBadge(q.marks, numberingFormat)
      : '';

  const marksHtml = marksDisplay ? `<span class="q-marks">${renderMultiScriptHtml(marksDisplay)}</span>` : '';
  const answerLinesHtml =
    q.answerSpaceLines && q.answerSpaceLines > 0
      ? `<div class="answer-space-lines">${Array.from({ length: q.answerSpaceLines })
          .map(() => '<div class="writing-line"></div>')
          .join('')}</div>`
      : '';
  const writingBoxesHtml = q.writingBoxes ? renderWritingBoxesHtml(q.writingBoxes) : '';

  switch (q.typology) {
    case 'GROUP_TITLE':
    case 'SECTION_TITLE' as any: {
      return `
        <div class="group-title-banner q-header q-heading-bold" style="display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; padding: 3px 0; margin: 6px 0 2px 0; font-weight: 700; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header-main" style="display: flex; align-items: flex-start; gap: 6px; flex: 1; justify-content: ${q.customNumber ? 'flex-start' : 'center'}; text-align: ${q.customNumber ? 'start' : 'center'};">
            ${q.customNumber ? `<span class="q-number" style="font-weight: 700; flex-shrink: 0;">${renderMultiScriptHtml(q.customNumber)}</span>` : ''}
            <span class="q-stem" style="flex: 1;">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
          </div>
          ${marksHtml ? `<div style="font-weight: 700; margin-inline-start: 8px; flex-shrink: 0;">${marksHtml}</div>` : ''}
        </div>`;
    }

    case 'PASSAGE_ONLY': {
      return `
        <div class="passage-stimulus-box" style="margin: 6px 0 10px 0; page-break-inside: avoid; break-inside: avoid;">
          ${q.topic ? `<div class="q-heading-bold" style="font-weight: 700; font-size: 0.96em; margin-bottom: 4px; color: #0f172a;">${renderMultiScriptHtml(q.topic)}</div>` : ''}
          <div class="passage-text" style="font-size: 0.96em; text-align: justify; padding: 2px 0; background: transparent; border: none; white-space: pre-line;">
            ${renderMultiScriptHtml(q.stemOrPassage || '')}
          </div>
        </div>`;
    }

    case 'PASSAGE_QA': {
      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div class="cq-sub-item" style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;">
              <span class="cq-part" style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['أ', 'ب', 'ج', 'د'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
            ${showMarks && sq.marks ? `<span class="q-marks" style="margin-inline-start: 8px; font-weight: 600;">[${formatNumberByScript(sq.marks, numberingFormat)}]</span>` : ''}
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          <div style="padding-inline-start: 12px; margin-top: 4px;">
            ${subHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'TRUE_FALSE': {
      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;">
              <span style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['١', '٢', '٣', '٤'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          <div style="padding-inline-start: 12px; margin-top: 4px;">
            ${subHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'SIMPLE_MCQ': {
      const optionsHtml = (q.options || [])
        .map(
          (opt) => `<div class="mcq-option">
            <span class="opt-label">${opt.label})</span>
            <span>${renderMultiScriptHtml(opt.text)}</span>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          <div class="mcq-options-grid">
            ${optionsHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'MULTIPLE_COMPLETION_MCQ': {
      const statementsHtml = (q.statements || [])
        .map((stmt) => `<li class="statement-item">${renderMultiScriptHtml(stmt)}</li>`)
        .join('');

      const optionsHtml = (q.options || [])
        .map(
          (opt) => `<div class="mcq-option">
            <span class="opt-label">${opt.label})</span>
            <span>${renderMultiScriptHtml(opt.text)}</span>
          </div>`
        )
        .join('');

      return `
        <div class="question-block">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${formatQuestionNumber(order, numberingFormat, 'dot')}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || 'নিচের তথ্যগুলো লক্ষ্য কর:')}</span>
            </div>
            ${marksHtml}
          </div>
          <ul class="statements-list">
            ${statementsHtml}
          </ul>
          <div style="font-size: 0.92em; font-weight: 600; margin: 2px 0 4px 12px;">নিচের কোনটি সঠিক?</div>
          <div class="mcq-options-grid">
            ${optionsHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'PASSAGE_GROUP': {
      const linkedQuestionsHtml = (q.passageQuestions || [])
        .map((pq, subIdx) => {
          const pqMarks = showMarks ? `<span class="q-marks">${formatMarksBadge(pq.marks, numberingFormat)}</span>` : '';
          const pqOptions = (pq.options || [])
            .map(
              (opt) => `<div class="mcq-option">
                <span class="opt-label">${opt.label})</span>
                <span>${renderMultiScriptHtml(opt.text)}</span>
              </div>`
            )
            .join('');

          return `
            <div style="margin-top: 8px;">
              <div class="q-header">
                <div class="q-header-main">
                  <span class="q-number">${formatNumberByScript(pq.order || `${order}.${subIdx + 1}`, numberingFormat)}.</span>
                  <span class="q-stem">${renderMultiScriptHtml(pq.questionText)}</span>
                </div>
                ${pqMarks}
              </div>
              ${pq.options && pq.options.length > 0 ? `<div class="mcq-options-grid">${pqOptions}</div>` : ''}
            </div>`;
        })
        .join('');

      return `
        <div class="full-width-block">
          <div class="q-heading-bold" style="font-weight: 700; margin-bottom: 4px; font-style: italic;">
            উদ্দীপক / অনুচ্ছেদটি পড়ে পরবর্তী প্রশ্নগুলোর উত্তর দাও:
          </div>
          <div class="passage-text" style="font-size: 0.98em; text-align: justify; margin-bottom: 6px;">
            ${renderMultiScriptHtml(q.stemOrPassage || '')}
          </div>
          ${linkedQuestionsHtml}
          ${answerLinesHtml}
        </div>`;
    }

    case 'CQ': {
      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div class="cq-sub-item">
            <div>
              <span class="cq-part">${formatSubQuestionPart(sq.part, numberingFormat, sIdx)}</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
            ${showMarks && sq.marks ? `<span class="q-marks">${formatMarksBadge(sq.marks, numberingFormat)}</span>` : ''}
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 16px;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${formatQuestionNumber(order, numberingFormat, 'full')}</span>
            </div>
            ${marksHtml}
          </div>
          <div class="q-paragraph" style="margin: 4px 0 8px 0; text-align: justify;">
            ${renderMultiScriptHtml(q.stemOrPassage || '')}
          </div>
          <div class="cq-sub-questions">
            ${subHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'FILL_BLANKS': {
      const clueBoxHtml =
        q.wordClues && q.wordClues.length > 0
          ? `<div class="word-clues-wrap">
              <table class="word-clues-table">
                <tbody>
                  <tr>
                    ${q.wordClues.map((word) => `<td>${renderMultiScriptHtml(word)}</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            </div>`
          : '';

      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;">
              <span style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['١', '٢', '٣', '٤'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || (numberingFormat === 'ar' ? 'املاً الفراغات بالكلمات المناسبة:' : 'উপযুক্ত শব্দ দিয়ে শূন্যস্থান পূরণ কর:'))}</span>
            </div>
            ${marksHtml}
          </div>
          ${clueBoxHtml}
          ${subHtml ? `<div style="padding-inline-start: 12px; margin-top: 4px;">${subHtml}</div>` : ''}
          ${!subHtml && q.stemOrPassage ? `<div style="padding-inline-start: 8px;">${renderMultiScriptHtml(q.stemOrPassage)}</div>` : ''}
          ${answerLinesHtml}
        </div>`;
    }

    case 'MATCHING': {
      const cols = q.matchingColumns;
      if (!cols) return '';

      const maxRows = Math.max(cols.colA.length, cols.colB.length, cols.colC?.length || 0);
      const rowsHtml = Array.from({ length: maxRows })
        .map((_, rIdx) => {
          return `
            <tr>
              <td>${cols.colA[rIdx] ? renderMultiScriptHtml(cols.colA[rIdx]) : ''}</td>
              <td>${cols.colB[rIdx] ? renderMultiScriptHtml(cols.colB[rIdx]) : ''}</td>
              ${cols.colC ? `<td>${cols.colC[rIdx] ? renderMultiScriptHtml(cols.colC[rIdx]) : ''}</td>` : ''}
            </tr>`;
        })
        .join('');

      return `
        <div class="question-block">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${formatQuestionNumber(order, numberingFormat, 'dot')}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || 'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে বাক্য তৈরি কর:')}</span>
            </div>
            ${marksHtml}
          </div>
          <table class="matching-table">
            <thead>
              <tr>
                <th>কলাম ক</th>
                <th>কলাম খ</th>
                ${cols.colC ? '<th>কলাম গ</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          ${answerLinesHtml}
        </div>`;
    }

    case 'TARJAMA_TASHREEH': {
      const subQuestions =
        q.subQuestions && q.subQuestions.length > 0
          ? q.subQuestions
          : [
              { part: '১', questionText: 'উক্ত ইবারতটির প্রাঞ্জল বঙ্গানুবাদ (তরজমা) লেখ।', marks: 4 },
              { part: '২', questionText: 'ইবারতটির প্রাসঙ্গিক ব্যাখ্যা ও বিধানসমূহ (তাশরীহ) বিশদভাবে লেখ।', marks: 6 },
            ];

      const subHtml = subQuestions
        .map(
          (sq, sIdx) => `
          <div class="cq-sub-item" style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1; text-align: justify;">
              <span class="cq-part" style="font-weight: 700; margin-inline-end: 6px;">${formatSubQuestionPart(sq.part, numberingFormat, sIdx)}</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
            ${showMarks && sq.marks ? `<span class="q-marks">${formatMarksBadge(sq.marks, numberingFormat)}</span>` : ''}
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 16px;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '(তরজমা ও তাশরীহ)')}</span>
            </div>
            ${marksHtml}
          </div>
          ${!q.subQuestions || q.subQuestions.length === 0 ? `<div class="ibarat-box">${renderMultiScriptHtml(q.stemOrPassage || '')}</div>` : ''}
          <div class="cq-sub-questions" style="padding-inline-start: 12px;">
            ${subHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'TAHQEEQ_SIGHA': {
      const words = q.tahqeeqWords || [];
      const rowsHtml = words
        .map(
          (w) => `
          <tr>
            <td class="font-ar font-bold" dir="rtl" style="font-size: 1.15em;">${renderMultiScriptHtml(w.lafz)}</td>
            <td>${renderMultiScriptHtml(w.sigha || '')}</td>
            <td>${renderMultiScriptHtml(w.bahas || '')}</td>
            <td>${renderMultiScriptHtml(w.baab || '')}</td>
            <td>${renderMultiScriptHtml(w.maddah || '')}</td>
            <td>${renderMultiScriptHtml(w.meaning || '')}</td>
          </tr>`
        )
        .join('');

      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;">
              ${sq.part ? `<span style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part)})</span>` : ''}
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || (numberingFormat === 'ar' ? 'حقق الكلمات الآتية :' : 'নিচের শব্দগুলোর সিগাহ, বাহাস, বাব, মাদ্দা ও অর্থসহ তাহকীক কর:'))}</span>
            </div>
            ${marksHtml}
          </div>
          ${
            words.length > 0
              ? `<table class="tahqeeq-table">
                  <thead>
                    <tr>
                      <th>শব্দ (اللفظ)</th>
                      <th>সিগাহ (الصيغة)</th>
                      <th>বাহাস (البحث)</th>
                      <th>বাব (الباب)</th>
                      <th>মাদ্দা (المادة)</th>
                      <th>অর্থ (المعنى)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>`
              : ''
          }
          ${subHtml ? `<div style="padding-inline-start: 12px; margin-top: 4px;">${subHtml}</div>` : ''}
          ${answerLinesHtml}
        </div>`;
    }

    case 'TARKIB_IRAB': {
      return `
        <div class="question-block" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${numberingFormat === 'ar' ? 'التركيب والإعراب :' : "তারকীব ও এ'রাব:"}</span>
            </div>
            ${marksHtml}
          </div>
          <div style="font-size: 0.95em; margin-bottom: 4px;">
            ${numberingFormat === 'ar' ? 'أعرب الجملة الآتية وبين تركيبها النحوي :' : "নিচের বাক্যটির পূর্ণাঙ্গ এ'রাব লাগাও এবং তারকীব বিশ্লেষণ কর:"}
          </div>
          <div class="ibarat-box">
            ${renderMultiScriptHtml(q.stemOrPassage || '')}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'HURUF_TAJWEED': {
      return `
        <div class="question-block" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || 'হরুফ আলাদা ও যুক্ত কর / তাজবীদের নিয়ম:')}</span>
            </div>
            ${marksHtml}
          </div>
          ${writingBoxesHtml}
          ${answerLinesHtml || (writingBoxesHtml ? '' : `<div class="answer-space-lines"><div class="writing-line"></div><div class="writing-line"></div></div>`)}
        </div>`;
    }

    case 'QAWAID_MISAL': {
      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;">
              <span style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['١', '٢', '٣', '٤'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          ${subHtml ? `<div style="padding-inline-start: 12px; margin-top: 4px;">${subHtml}</div>` : ''}
          ${answerLinesHtml}
        </div>`;
    }

    case 'MULTI_PART':
    case 'QAWMI_CQ': {
      const subQuestions = q.subQuestions || [];
      const subHtml = subQuestions
        .map(
          (sq, sIdx) => `
          <div class="cq-sub-item" style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 6px;">
            <div style="flex: 1;">
              <span class="cq-part" style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['ক', 'খ', 'গ', 'ঘ'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
            ${showMarks && sq.marks ? `<span class="q-marks" style="margin-inline-start: 10px; font-weight: 600;">${formatMarksBadge(sq.marks, numberingFormat)}</span>` : ''}
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 14px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          <div style="padding-inline-start: 14px; margin-top: 4px;">
            ${subHtml}
          </div>
          ${answerLinesHtml}
        </div>`;
    }

    case 'DESCRIPTIVE':
    default: {
      const isParagraph =
        q.typology === 'PARAGRAPH_WRITING' || (q.stemOrPassage?.length || 0) > 180;
      const subHtml = (q.subQuestions || [])
        .map(
          (sq, sIdx) => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div style="flex: 1;${(sq.questionText?.length || 0) > 140 ? ' text-align: justify;' : ''}">
              <span style="font-weight: 700; margin-inline-end: 6px;">(${renderMultiScriptHtml(sq.part || ['أ', 'ب', 'ج', 'د'][sIdx] || '')})</span>
              <span>${renderMultiScriptHtml(sq.questionText)}</span>
            </div>
          </div>`
        )
        .join('');

      return `
        <div class="question-block" style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
          <div class="q-header">
            <div class="q-header-main">
              <span class="q-number">${renderMultiScriptHtml(qNumberDisplay)}</span>
              <span class="q-stem" style="${isParagraph ? 'text-align: justify; white-space: pre-line;' : 'white-space: pre-line;'}">${renderMultiScriptHtml(q.stemOrPassage || '')}</span>
            </div>
            ${marksHtml}
          </div>
          ${subHtml ? `<div style="padding-inline-start: 12px; margin-top: 4px;">${subHtml}</div>` : ''}
          ${writingBoxesHtml}
          ${answerLinesHtml}
        </div>`;
    }
  }
}
