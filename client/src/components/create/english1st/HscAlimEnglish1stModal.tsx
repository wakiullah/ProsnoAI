'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_HSC_ENG1_Q1,
  DEFAULT_HSC_ENG1_Q2,
  DEFAULT_HSC_ENG1_Q3,
  DEFAULT_HSC_ENG1_Q4,
  DEFAULT_HSC_ENG1_Q5,
  DEFAULT_HSC_ENG1_Q6,
  DEFAULT_HSC_ENG1_Q7,
  DEFAULT_HSC_ENG1_Q8,
  DEFAULT_HSC_ENG1_Q9,
  DEFAULT_HSC_ENG1_Q10,
  DEFAULT_HSC_ENG1_Q11,
  EngChartData,
  EngInfoTableData,
  EngMcqItem,
  HSC_ENG1_GROUP_IDS,
  HscEng1Section,
} from './english1stDefaults';
import { EngChartSvg } from './EngChartSvg';

interface HscAlimEnglish1stModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: HscEng1Section;
  grade?: string;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

const SECTION_META: Record<HscEng1Section, { title: string; sub: string }> = {
  q1_passage_ab: {
    title: '01. Passage + Questions A & B (15 Marks)',
    sub: 'Part-I Reading · A. MCQ (1×5=5) + B. Short Q/A (2×5=10)',
  },
  q2_6_reading: {
    title: '02–06. Info Table, Summary, Cloze & Rearrange (45 Marks)',
    sub: 'Part-I Reading · Q.02 Table (10) + Q.03 Summary (10) + Q.04 With Clues (5) + Q.05 Without Clues (10) + Q.06 Rearrange (10)',
  },
  q7_9_writing: {
    title: '07–09. Paragraph, Completing Story & Letter (22 Marks)',
    sub: 'Part-II Writing · Q.07 Paragraph (10) + Q.08 Story (7) + Q.09 Letter/E-mail (5)',
  },
  q10_11_chart_poem: {
    title: '10–11. Chart/Graph & Poem Theme (18 Marks)',
    sub: 'Part-II Writing · Q.10 Pie/Bar Chart (10) + Q.11 Appreciating Poem (8)',
  },
};

const ALPHA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

export const HscAlimEnglish1stModal: React.FC<HscAlimEnglish1stModalProps> = ({
  isOpen,
  onClose,
  section,
  grade = 'HSC / Alim',
  existingQuestions,
  onSave,
}) => {
  const [q1, setQ1] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q1)));
  const [q2, setQ2] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q2)));
  const [q3, setQ3] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q3)));
  const [q4, setQ4] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q4)));
  const [q5, setQ5] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q5)));
  const [q6, setQ6] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q6)));
  const [q7, setQ7] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q7)));
  const [q8, setQ8] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q8)));
  const [q9, setQ9] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q9)));
  const [q10, setQ10] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q10)));
  const [q11, setQ11] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q11)));

  useEffect(() => {
    if (!isOpen) return;
    const gid = HSC_ENG1_GROUP_IDS[section];
    const grp = existingQuestions.filter((q) => q.groupId === gid);

    if (section === 'q1_passage_ab') {
      if (grp.length === 0) {
        setQ1(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q1)));
      } else {
        const next = JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q1));
        next.includePartIBanner = grp.some((q) => q.groupRole === 'eng1_part_banner');
        const pQ = grp.find((q) => q.groupRole === 'eng1_passage');
        if (pQ) {
          next.passageInstruction = pQ.chapter || next.passageInstruction;
          next.passageText = pQ.stemOrPassage || '';
        }
        const mcqQ = grp.find((q) => q.groupRole === 'eng1_mcq_list');
        if (mcqQ && mcqQ.passageQuestions) {
          next.aInstruction = mcqQ.stemOrPassage || next.aInstruction;
          next.aMarksText = mcqQ.customMarksText || next.aMarksText;
          next.aItems = mcqQ.passageQuestions.map((pq, i) => ({
            id: pq.id || `hmcq_${i + 1}`,
            questionText: pq.questionText,
            options: [
              pq.options?.[0]?.text || '',
              pq.options?.[1]?.text || '',
              pq.options?.[2]?.text || '',
              pq.options?.[3]?.text || '',
            ],
          }));
        }
        const qaQ = grp.find((q) => q.groupRole === 'eng1_qa_list');
        if (qaQ && qaQ.subQuestions) {
          next.bInstruction = qaQ.stemOrPassage || next.bInstruction;
          next.bMarksText = qaQ.customMarksText || next.bMarksText;
          next.bItems = qaQ.subQuestions.map((s) => s.questionText);
        }
        setQ1(next);
      }
    } else if (section === 'q2_6_reading') {
      const tQ = grp.find((q) => q.groupRole === 'eng1_info_table');
      if (tQ) {
        let parsedTable: EngInfoTableData = JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q2.table));
        try {
          if (tQ.explanation) parsedTable = JSON.parse(tQ.explanation);
        } catch {
          // keep default
        }
        setQ2({
          instruction: tQ.topic || DEFAULT_HSC_ENG1_Q2.instruction,
          marksText: tQ.customMarksText || DEFAULT_HSC_ENG1_Q2.marksText,
          passageText: tQ.stemOrPassage || '',
          table: parsedTable,
        });
      } else {
        setQ2(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q2)));
      }
      const sQ = grp.find((q) => q.groupRole === 'eng1_writing');
      setQ3(
        sQ
          ? {
              instruction: sQ.topic || DEFAULT_HSC_ENG1_Q3.instruction,
              passageText: sQ.stemOrPassage || '',
              marks: sQ.marks || 10,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q3))
      );
      const clozes = grp.filter((q) => q.groupRole === 'eng1_cloze');
      const cQ4 = clozes.find((q) => q.hasClues) || clozes[0];
      const cQ5 = clozes.find((q) => !q.hasClues) || clozes[1];
      setQ4(
        cQ4
          ? {
              instruction: cQ4.topic || DEFAULT_HSC_ENG1_Q4.instruction,
              marksText: cQ4.customMarksText || DEFAULT_HSC_ENG1_Q4.marksText,
              cluesText: (cQ4.wordClues || []).join(', '),
              clozeText: cQ4.stemOrPassage || '',
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q4))
      );
      setQ5(
        cQ5
          ? {
              instruction: cQ5.topic || DEFAULT_HSC_ENG1_Q5.instruction,
              marksText: cQ5.customMarksText || DEFAULT_HSC_ENG1_Q5.marksText,
              clozeText: cQ5.stemOrPassage || '',
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q5))
      );
      const rQ = grp.find((q) => q.groupRole === 'eng1_rearrange');
      setQ6(
        rQ
          ? {
              instruction: rQ.stemOrPassage || DEFAULT_HSC_ENG1_Q6.instruction,
              marksText: rQ.customMarksText || DEFAULT_HSC_ENG1_Q6.marksText,
              items: rQ.statements && rQ.statements.length > 0 ? rQ.statements : DEFAULT_HSC_ENG1_Q6.items,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q6))
      );
    } else if (section === 'q7_9_writing') {
      const wItems = grp.filter((q) => q.groupRole === 'eng1_writing');
      const pQ = wItems[0];
      const stQ = wItems[1];
      const lQ = wItems[2];
      setQ7(
        pQ
          ? {
              includePartIIBanner: grp.some((q) => q.groupRole === 'eng1_part_banner'),
              instruction: pQ.topic || DEFAULT_HSC_ENG1_Q7.instruction,
              guidingQuestions: pQ.stemOrPassage || '',
              marks: pQ.marks || 10,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q7))
      );
      setQ8(
        stQ
          ? {
              instruction: stQ.topic || DEFAULT_HSC_ENG1_Q8.instruction,
              body: stQ.stemOrPassage || '',
              marks: stQ.marks || 7,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q8))
      );
      setQ9(
        lQ
          ? {
              instruction: lQ.topic || DEFAULT_HSC_ENG1_Q9.instruction,
              body: lQ.stemOrPassage || '',
              marks: lQ.marks || 5,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q9))
      );
    } else if (section === 'q10_11_chart_poem') {
      const chQ = grp.find((q) => q.groupRole === 'eng1_chart');
      if (chQ) {
        let parsedChart: EngChartData = JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q10.chartData));
        try {
          if (chQ.explanation) parsedChart = JSON.parse(chQ.explanation);
        } catch {
          // keep default
        }
        setQ10({
          instruction: chQ.stemOrPassage || DEFAULT_HSC_ENG1_Q10.instruction,
          marks: chQ.marks || 10,
          chartData: parsedChart,
        });
      } else {
        setQ10(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q10)));
      }
      const pmQ = grp.find((q) => q.groupRole === 'eng1_poem_theme');
      setQ11(
        pmQ
          ? {
              instruction: pmQ.topic || DEFAULT_HSC_ENG1_Q11.instruction,
              poemHeader: pmQ.chapter || DEFAULT_HSC_ENG1_Q11.poemHeader,
              poemLines: pmQ.stemOrPassage || '',
              marks: pmQ.marks || 8,
            }
          : JSON.parse(JSON.stringify(DEFAULT_HSC_ENG1_Q11))
      );
    }
  }, [isOpen, section, existingQuestions]);

  if (!isOpen) return null;

  const handleSave = () => {
    const gid = HSC_ENG1_GROUP_IDS[section];
    const baseMeta = {
      subject: 'English 1st Paper',
      grade,
      difficulty: 'Medium' as const,
      languages: ['en' as const],
      sourceType: 'MANUAL' as const,
      groupId: gid,
    };
    const out: QuestionData[] = [];

    if (section === 'q1_passage_ab') {
      if (q1.includePartIBanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_part1`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part-I',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_passage`,
        typology: 'PASSAGE_ONLY',
        customNumber: '01.',
        chapter: q1.passageInstruction,
        stemOrPassage: q1.passageText.trim(),
        marks: 0,
        groupRole: 'eng1_passage',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_a`,
        typology: 'PASSAGE_GROUP',
        customNumber: 'A.',
        stemOrPassage: q1.aInstruction,
        customMarksText: q1.aMarksText,
        marks: q1.aItems.length,
        groupRole: 'eng1_mcq_list',
        passageQuestions: q1.aItems.map((item: EngMcqItem, idx: number) => ({
          id: item.id,
          order: idx + 1,
          questionText: item.questionText.trim(),
          typology: 'SIMPLE_MCQ',
          marks: 1,
          options: item.options.map((opt, oIdx) => ({
            label: `(${ROMAN[oIdx] || oIdx + 1})`,
            text: opt.trim(),
          })),
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_b`,
        typology: 'CQ',
        customNumber: 'B.',
        stemOrPassage: q1.bInstruction,
        customMarksText: q1.bMarksText,
        marks: q1.bItems.length * 2,
        groupRole: 'eng1_qa_list',
        subQuestions: q1.bItems.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 2,
        })),
      });
    } else if (section === 'q2_6_reading') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q2`,
        typology: 'DESCRIPTIVE',
        customNumber: '02.',
        topic: q2.instruction,
        stemOrPassage: q2.passageText.trim(),
        explanation: JSON.stringify(q2.table),
        customMarksText: q2.marksText,
        marks: 10,
        groupRole: 'eng1_info_table',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q3`,
        typology: 'DESCRIPTIVE',
        customNumber: '03.',
        topic: q3.instruction,
        stemOrPassage: q3.passageText.trim(),
        customMarksText: String(q3.marks),
        marks: q3.marks,
        groupRole: 'eng1_writing',
      });
      const clues = q4.cluesText
        .split(/[,\n]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      out.push({
        ...baseMeta,
        _id: `${gid}_q4`,
        typology: 'FILL_BLANKS',
        customNumber: '04.',
        topic: q4.instruction,
        stemOrPassage: q4.clozeText.trim(),
        hasClues: true,
        wordClues: clues,
        customMarksText: q4.marksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q5`,
        typology: 'FILL_BLANKS',
        customNumber: '05.',
        topic: q5.instruction,
        stemOrPassage: q5.clozeText.trim(),
        customMarksText: q5.marksText,
        marks: 10,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q6`,
        typology: 'DESCRIPTIVE',
        customNumber: '06.',
        chapter: 'roman',
        stemOrPassage: q6.instruction,
        statements: q6.items.map((s: string) => s.trim()),
        customMarksText: q6.marksText,
        marks: q6.items.length,
        groupRole: 'eng1_rearrange',
      });
    } else if (section === 'q7_9_writing') {
      if (q7.includePartIIBanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_part2`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part-II',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_q7`,
        typology: 'DESCRIPTIVE',
        customNumber: '07.',
        topic: q7.instruction,
        stemOrPassage: q7.guidingQuestions.trim(),
        customMarksText: String(q7.marks),
        marks: q7.marks,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q8`,
        typology: 'DESCRIPTIVE',
        customNumber: '08.',
        topic: q8.instruction,
        stemOrPassage: q8.body.trim(),
        customMarksText: q8.marks < 10 ? `0${q8.marks}` : String(q8.marks),
        marks: q8.marks,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q9`,
        typology: 'DESCRIPTIVE',
        customNumber: '09.',
        topic: q9.instruction,
        stemOrPassage: q9.body.trim(),
        customMarksText: q9.marks < 10 ? `0${q9.marks}` : String(q9.marks),
        marks: q9.marks,
        groupRole: 'eng1_writing',
      });
    } else if (section === 'q10_11_chart_poem') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q10`,
        typology: 'DESCRIPTIVE',
        customNumber: '10.',
        stemOrPassage: q10.instruction,
        explanation: JSON.stringify(q10.chartData),
        customMarksText: String(q10.marks),
        marks: q10.marks,
        groupRole: 'eng1_chart',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q11`,
        typology: 'POETRY_EXPLANATION',
        customNumber: '11.',
        topic: q11.instruction,
        chapter: q11.poemHeader,
        stemOrPassage: q11.poemLines.trim(),
        customMarksText: String(q11.marks),
        marks: q11.marks,
        groupRole: 'eng1_poem_theme',
      });
    }

    onSave(out, gid);
    onClose();
  };

  const meta = SECTION_META[section];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden sm:border sm:border-slate-200">
        {/* Header */}
        <div className="px-3 py-2 sm:px-5 sm:py-3 bg-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold leading-tight truncate">{meta.title}</h2>
            <p className="text-[10px] sm:text-[11px] text-indigo-100 truncate">{meta.sub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-2.5 sm:space-y-4">
          {section === 'q1_passage_ab' && (
            <>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q1.includePartIBanner}
                  onChange={(e) => setQ1((p: any) => ({ ...p, includePartIBanner: e.target.checked }))}
                />
                Include &quot;Part-I&quot; banner above Q. 01
              </label>

              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  value={q1.passageInstruction}
                  onChange={(e) => setQ1((p: any) => ({ ...p, passageInstruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                />
                <textarea
                  rows={5}
                  value={q1.passageText}
                  onChange={(e) => setQ1((p: any) => ({ ...p, passageText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white leading-relaxed"
                />
              </div>

              {/* A. MCQ */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">A. MCQ (1 × 5 = 5)</span>
                  <input
                    type="text"
                    value={q1.aMarksText}
                    onChange={(e) => setQ1((p: any) => ({ ...p, aMarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                {q1.aItems.map((mcq: EngMcqItem, idx: number) => (
                  <div key={mcq.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-800">({ALPHA[idx]})</span>
                      <input
                        type="text"
                        value={mcq.questionText}
                        onChange={(e) =>
                          setQ1((p: any) => ({
                            ...p,
                            aItems: p.aItems.map((it: EngMcqItem, i: number) =>
                              i === idx ? { ...it, questionText: e.target.value } : it
                            ),
                          }))
                        }
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pl-5">
                      {mcq.options.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          placeholder={`(${ROMAN[oIdx]})`}
                          onChange={(e) =>
                            setQ1((p: any) => ({
                              ...p,
                              aItems: p.aItems.map((it: EngMcqItem, i: number) => {
                                if (i !== idx) return it;
                                const nextOpts = [...it.options] as [string, string, string, string];
                                nextOpts[oIdx] = e.target.value;
                                return { ...it, options: nextOpts };
                              }),
                            }))
                          }
                          className="px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* B. Open Q/A */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    B. Short Questions (2 × 5 = 10)
                  </span>
                  <input
                    type="text"
                    value={q1.bMarksText}
                    onChange={(e) => setQ1((p: any) => ({ ...p, bMarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                {q1.bItems.map((qText: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={qText}
                      onChange={(e) =>
                        setQ1((p: any) => ({
                          ...p,
                          bItems: p.bItems.map((v: string, i: number) => (i === idx ? e.target.value : v)),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'q2_6_reading' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-indigo-900">
                02. Passage + Information Transfer Table (1 × 10 = 10)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q2.instruction}
                  onChange={(e) => setQ2((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={q2.marksText}
                  onChange={(e) => setQ2((p: any) => ({ ...p, marksText: e.target.value }))}
                  className="w-24 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={4}
                value={q2.passageText}
                onChange={(e) => setQ2((p: any) => ({ ...p, passageText: e.target.value }))}
                placeholder="Passage text..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {q2.table.headers.map((h: string, cIdx: number) => (
                        <th key={cIdx} className="border border-slate-300 p-1 bg-slate-100">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) =>
                              setQ2((p: any) => ({
                                ...p,
                                table: {
                                  ...p.table,
                                  headers: p.table.headers.map((hdr: string, i: number) =>
                                    i === cIdx ? e.target.value : hdr
                                  ),
                                },
                              }))
                            }
                            className="w-full px-1.5 py-1 text-xs font-bold bg-transparent outline-none"
                          />
                        </th>
                      ))}
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {q2.table.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx}>
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="border border-slate-300 p-1">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                setQ2((p: any) => ({
                                  ...p,
                                  table: {
                                    ...p.table,
                                    rows: p.table.rows.map((r: string[], ri: number) =>
                                      ri === rIdx
                                        ? r.map((c: string, ci: number) =>
                                            ci === cIdx ? e.target.value : c
                                          )
                                        : r
                                    ),
                                  },
                                }))
                              }
                              className="w-full px-1.5 py-1 text-xs bg-white outline-none"
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setQ2((p: any) => ({
                                ...p,
                                table: {
                                  ...p.table,
                                  rows: p.table.rows.filter((_: string[], ri: number) => ri !== rIdx),
                                },
                              }))
                            }
                            className="text-rose-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() =>
                  setQ2((p: any) => ({
                    ...p,
                    table: {
                      ...p.table,
                      rows: [...p.table.rows, p.table.headers.map(() => '')],
                    },
                  }))
                }
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
          )}

          {section === 'q2_6_reading' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-indigo-900">
                03. Summarize the Passage (10 Marks)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q3.instruction}
                  onChange={(e) => setQ3((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q3.marks}
                  onChange={(e) => setQ3((p: any) => ({ ...p, marks: Number(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={6}
                value={q3.passageText}
                onChange={(e) => setQ3((p: any) => ({ ...p, passageText: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>
          )}

          {section === 'q2_6_reading' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-indigo-900">
                04. Cloze Test with Clues (0.5 × 10 = 5)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q4.instruction}
                  onChange={(e) => setQ4((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={q4.marksText}
                  onChange={(e) => setQ4((p: any) => ({ ...p, marksText: e.target.value }))}
                  className="w-24 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Word Box Clues (comma-separated, e.g. 12 words):
                </label>
                <input
                  type="text"
                  value={q4.cluesText}
                  onChange={(e) => setQ4((p: any) => ({ ...p, cluesText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <textarea
                rows={5}
                value={q4.clozeText}
                onChange={(e) => setQ4((p: any) => ({ ...p, clozeText: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>
          )}

          {section === 'q2_6_reading' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-indigo-900">
                05. Cloze Test without Clues (1 × 10 = 10)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q5.instruction}
                  onChange={(e) => setQ5((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={q5.marksText}
                  onChange={(e) => setQ5((p: any) => ({ ...p, marksText: e.target.value }))}
                  className="w-24 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={6}
                value={q5.clozeText}
                onChange={(e) => setQ5((p: any) => ({ ...p, clozeText: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>
          )}

          {section === 'q2_6_reading' && (
            <div className="space-y-2.5 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-indigo-900">
                06. Rearranging Sentences (1 × 10 = 10)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q6.instruction}
                  onChange={(e) => setQ6((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={q6.marksText}
                  onChange={(e) => setQ6((p: any) => ({ ...p, marksText: e.target.value }))}
                  className="w-24 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              {q6.items.map((sent: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-800 w-7">({ROMAN[idx] || idx + 1})</span>
                  <input
                    type="text"
                    value={sent}
                    onChange={(e) =>
                      setQ6((p: any) => ({
                        ...p,
                        items: p.items.map((v: string, i: number) => (i === idx ? e.target.value : v)),
                      }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {section === 'q7_9_writing' && (
            <div className="space-y-3 border border-emerald-200 bg-emerald-50/20 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-emerald-900">
                07. Paragraph Writing (10 Marks)
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q7.includePartIIBanner}
                  onChange={(e) =>
                    setQ7((p: any) => ({ ...p, includePartIIBanner: e.target.checked }))
                  }
                />
                Include &quot;Part-II&quot; banner above Q. 07
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q7.instruction}
                  onChange={(e) => setQ7((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q7.marks}
                  onChange={(e) => setQ7((p: any) => ({ ...p, marks: Number(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={4}
                value={q7.guidingQuestions}
                onChange={(e) => setQ7((p: any) => ({ ...p, guidingQuestions: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>
          )}

          {section === 'q7_9_writing' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-emerald-900">
                08. Completing Story (07 Marks)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q8.instruction}
                  onChange={(e) => setQ8((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q8.marks}
                  onChange={(e) => setQ8((p: any) => ({ ...p, marks: Number(e.target.value) || 7 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={5}
                value={q8.body}
                onChange={(e) => setQ8((p: any) => ({ ...p, body: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>
          )}

          {section === 'q7_9_writing' && (
            <div className="space-y-3 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-emerald-900">
                09. Informal Letter / E-mail (05 Marks)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q9.instruction}
                  onChange={(e) => setQ9((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q9.marks}
                  onChange={(e) => setQ9((p: any) => ({ ...p, marks: Number(e.target.value) || 5 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <textarea
                rows={3}
                value={q9.body}
                onChange={(e) => setQ9((p: any) => ({ ...p, body: e.target.value }))}
                placeholder="Optional extra details..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          )}

          {section === 'q10_11_chart_poem' && (
            <div className="space-y-3 border border-teal-200 bg-teal-50/20 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-teal-900">
                10. Pie Chart / Bar Graph Description (10 Marks)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q10.instruction}
                  onChange={(e) => setQ10((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q10.marks}
                  onChange={(e) => setQ10((p: any) => ({ ...p, marks: Number(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span>Chart Type:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQ10((p: any) => ({ ...p, chartData: { ...p.chartData, chartType: 'pie' } }))
                    }
                    className={`px-3 py-1 rounded-lg border ${
                      q10.chartData.chartType === 'pie'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Pie Chart
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQ10((p: any) => ({ ...p, chartData: { ...p.chartData, chartType: 'bar' } }))
                    }
                    className={`px-3 py-1 rounded-lg border ${
                      q10.chartData.chartType === 'bar'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Bar Graph
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-600">Unit:</span>
                  <input
                    type="text"
                    value={q10.chartData.unit}
                    onChange={(e) =>
                      setQ10((p: any) => ({
                        ...p,
                        chartData: { ...p.chartData, unit: e.target.value },
                      }))
                    }
                    className="w-14 px-2 py-1 border border-slate-300 rounded bg-white text-center font-bold"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="border border-slate-200 rounded-xl p-2 bg-white">
                <EngChartSvg data={q10.chartData} />
              </div>

              {/* Editable Data Rows */}
              <div className="space-y-1.5">
                {q10.chartData.items.map((it: { label: string; value: number }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={it.label}
                      placeholder="Label (e.g. Sleep)"
                      onChange={(e) =>
                        setQ10((p: any) => ({
                          ...p,
                          chartData: {
                            ...p.chartData,
                            items: p.chartData.items.map((row: any, i: number) =>
                              i === idx ? { ...row, label: e.target.value } : row
                            ),
                          },
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={it.value}
                      onChange={(e) =>
                        setQ10((p: any) => ({
                          ...p,
                          chartData: {
                            ...p.chartData,
                            items: p.chartData.items.map((row: any, i: number) =>
                              i === idx ? { ...row, value: Number(e.target.value) || 0 } : row
                            ),
                          },
                        }))
                      }
                      className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                    />
                    {q10.chartData.items.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQ10((p: any) => ({
                            ...p,
                            chartData: {
                              ...p.chartData,
                              items: p.chartData.items.filter((_: any, i: number) => i !== idx),
                            },
                          }))
                        }
                        className="text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setQ10((p: any) => ({
                      ...p,
                      chartData: {
                        ...p.chartData,
                        items: [...p.chartData.items, { label: 'Other', value: 10 }],
                      },
                    }))
                  }
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Data Slice / Bar
                </button>
              </div>
            </div>
          )}

          {section === 'q10_11_chart_poem' && (
            <div className="space-y-3 border border-violet-200 bg-violet-50/20 rounded-xl p-3.5">
              <div className="text-xs font-extrabold text-violet-900">
                11. Appreciating Poem / Theme Writing (8 Marks)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q11.instruction}
                  onChange={(e) => setQ11((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={q11.marks}
                  onChange={(e) => setQ11((p: any) => ({ ...p, marks: Number(e.target.value) || 8 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
              <input
                type="text"
                value={q11.poemHeader}
                onChange={(e) => setQ11((p: any) => ({ ...p, poemHeader: e.target.value }))}
                placeholder="Poem Title --- Poet Name"
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
              />
              <textarea
                rows={8}
                value={q11.poemLines}
                onChange={(e) => setQ11((p: any) => ({ ...p, poemLines: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed font-serif"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add / Update in Paper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
