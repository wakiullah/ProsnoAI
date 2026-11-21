import {
  ExamPaperData,
  GOOGLE_FONTS_EMBED_URL,
  MULTI_SCRIPT_CSS,
  QuestionData,
  renderMultiScriptHtml,
} from 'proshno-shared';

export function generateAnswerKeyHtml(paper: ExamPaperData, activeSetName?: string): string {
  const { headerConfig } = paper;
  let questions: QuestionData[] = paper.questions;
  let currentSetName = activeSetName || paper.activeSet || 'Set A';
  let answerKeyMap: Record<number, string> = {};

  if (paper.sets && paper.sets.length > 0) {
    const selectedSet =
      paper.sets.find((s) => s.setName === currentSetName) || paper.sets[0];
    currentSetName = selectedSet.setName;
    answerKeyMap = selectedSet.answerKeyMap || {};
    questions = selectedSet.questionEntries.map(
      (entry) => entry.customQuestionData || paper.questions.find((q) => q._id?.toString() === entry.questionId) || ({} as QuestionData)
    );
  }

  // Build MCQ Quick Grid items
  const mcqEntries = Object.entries(answerKeyMap).sort((a, b) => Number(a[0]) - Number(b[0]));
  const mcqGridHtml =
    mcqEntries.length > 0
      ? `<div class="mcq-grid-section">
          <h3>বহুনির্বাচনী ও সংক্ষিপ্ত উত্তর নির্দেশিকা (${currentSetName})</h3>
          <div class="mcq-answer-grid">
            ${mcqEntries
              .map(
                ([qNum, ans]) => `
              <div class="grid-cell">
                <span class="cell-num">${qNum}.</span>
                <span class="cell-ans">${renderMultiScriptHtml(ans)}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>`
      : '';

  // Build Detailed Solutions for CQ, Matching, Fill in blanks, and explanations
  const detailedSolutionsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;

      if (q.typology === 'CQ') {
        const subSolutions = (q.subQuestions || [])
          .map(
            (sq) => `
            <div class="cq-sol-item">
              <strong>${sq.part}) [${sq.bloomTitle} - পূর্ণমান: ${sq.marks}]:</strong>
              <div class="sol-text">${renderMultiScriptHtml(sq.sampleAnswer || 'পাঠ্যবইয়ের সংশ্লিষ্ট ধারণার সঠিক প্রয়োগ ও নির্ভুল ব্যাখ্যার জন্য পূর্ণ নম্বর বরাদ্দ হবে।')}</div>
            </div>`
          )
          .join('');

        return `
          <div class="solution-card">
            <h4>${qNum} নং সৃজনশীল প্রশ্নের সমাধান ও মূল্যায়ন নির্দেশিকা:</h4>
            ${subSolutions}
          </div>`;
      }

      if (q.typology === 'MATCHING' && q.matchingColumns?.correctPairs) {
        const pairsHtml = q.matchingColumns.correctPairs
          .map((pair, pIdx) => {
            const sentence =
              pair.fullSentence ||
              `${q.matchingColumns?.colA[pair.a]} + ${q.matchingColumns?.colB[pair.b]}`;
            return `<li>${pIdx + 1}. ${renderMultiScriptHtml(sentence)}</li>`;
          })
          .join('');

        return `
          <div class="solution-card">
            <h4>${qNum} নং মিলকরণ প্রশ্নের সঠিক বাক্য গঠন:</h4>
            <ol style="margin-left: 20px;">${pairsHtml}</ol>
          </div>`;
      }

      if (q.typology === 'FILL_BLANKS' && q.correctAnswer) {
        const answers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        return `
          <div class="solution-card">
            <h4>${qNum} নং শূন্যস্থান পূরণের সঠিক উত্তরমালা:</h4>
            <div style="font-weight: 600;">
              ${answers.map((a, aIdx) => `(${String.fromCharCode(97 + aIdx)}) ${renderMultiScriptHtml(String(a))}`).join('  |  ')}
            </div>
          </div>`;
      }

      if (q.explanation) {
        return `
          <div class="solution-card">
            <h4>${qNum}. সঠিক উত্তর: ${renderMultiScriptHtml(String(q.correctAnswer || ''))}</h4>
            <div class="sol-text"><strong>ব্যাখ্যা:</strong> ${renderMultiScriptHtml(q.explanation)}</div>
          </div>`;
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>উত্তরমালা ও মূল্যায়ন নির্দেশিকা - ${headerConfig.examTitle}</title>
  <link rel="stylesheet" href="${GOOGLE_FONTS_EMBED_URL}">
  <style>
    @page {
      size: ${paper.layoutConfig.paperSize};
      margin: 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #718096;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-size: 10.5pt;
      line-height: 1.5;
      color: #1a202c;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
      /* On-screen preview padding to ensure proper margins in the live view */
      padding: 15mm 18mm 15mm 18mm;
    }

    @media print {
      body {
        padding: 0 !important;
      }
    }

    ${MULTI_SCRIPT_CSS}

    .key-header {
      text-align: center;
      padding-bottom: 10px;
      margin-bottom: 14px;
      border-bottom: 2px solid #2b6cb0;
    }

    .inst-name { font-size: 1.35em; font-weight: 700; color: #2d3748; }
    .exam-title { font-size: 1.15em; font-weight: 600; margin: 2px 0; }
    .badge {
      display: inline-block;
      padding: 3px 12px;
      background: #ebf8ff;
      border: 1px solid #3182ce;
      color: #2b6cb0;
      border-radius: 4px;
      font-weight: 700;
      margin-top: 4px;
    }

    .mcq-grid-section {
      margin-bottom: 18px;
      padding: 12px;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    .mcq-grid-section h3 {
      font-size: 1.05em;
      margin-bottom: 8px;
      color: #2b6cb0;
    }

    .mcq-answer-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 6px;
    }

    .grid-cell {
      border: 1px solid #cbd5e0;
      padding: 4px 6px;
      text-align: center;
      background: #ffffff;
      border-radius: 3px;
    }

    .cell-num { font-weight: 700; color: #4a5568; margin-right: 4px; font-size: 0.9em; }
    .cell-ans { font-weight: 700; color: #2b6cb0; }

    .solution-card {
      break-inside: avoid;
      margin-bottom: 12px;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #3182ce;
      border-radius: 4px;
      background: #ffffff;
    }

    .solution-card h4 {
      font-size: 1em;
      color: #2d3748;
      margin-bottom: 6px;
    }

    .cq-sol-item {
      margin-top: 6px;
      padding-left: 10px;
    }

    .sol-text {
      color: #4a5568;
      margin-top: 2px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <header class="key-header">
    <div class="inst-name">${renderMultiScriptHtml(headerConfig.institutionName)}</div>
    <div class="exam-title">${renderMultiScriptHtml(headerConfig.examTitle)}</div>
    <div style="font-weight: 600; margin-top: 2px;">
      বিষয়: ${renderMultiScriptHtml(headerConfig.subject)} | পূর্ণমান: ${headerConfig.totalMarks}
    </div>
    <div class="badge">শিক্ষক সহায়িকা ও নির্ভুল উত্তরমালা (${renderMultiScriptHtml(currentSetName)})</div>
  </header>

  <main>
    ${mcqGridHtml}

    <div style="margin-top: 16px;">
      <h3 style="font-size: 1.1em; color: #2d3748; margin-bottom: 10px; border-bottom: 1px solid #cbd5e0; padding-bottom: 4px;">
        বিস্তারিত সমাধান ও মূল্যায়ন নির্দেশিকা
      </h3>
      ${detailedSolutionsHtml}
    </div>
  </main>
</body>
</html>`;
}
