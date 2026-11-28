'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_SSC_ENG2_Q1_3,
  DEFAULT_SSC_ENG2_Q4_5,
  DEFAULT_SSC_ENG2_Q6_9,
  DEFAULT_SSC_ENG2_Q10_12,
  Eng2SubstitutionTableData,
  SSC_ENG2_GROUP_IDS,
  SscEng2Section,
} from './english2ndDefaults';

interface English2ndSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SscEng2Section;
  grade?: string;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

const SECTION_META: Record<SscEng2Section, { title: string; sub: string }> = {
  q1_3_grammar: {
    title: 'Questions 1–3: Cloze, Substitution Table & Verbs (25 Marks)',
    sub: 'Part A—Grammar · Q.1 Cloze with Clues (10) + Q.2 Substitution Table (5) + Q.3 Right Forms of Verbs (10)',
  },
  q4_5_grammar: {
    title: 'Questions 4–5: Changing Sentences & Tag Questions (15 Marks)',
    sub: 'Part A—Grammar · Q.4 Changing Sentences (10) + Q.5 Tag Questions (5)',
  },
  q6_9_grammar: {
    title: 'Questions 6–9: Suffix/Prefix, Prepositions, Connectors & Punctuation (20 Marks)',
    sub: 'Part A—Grammar · Q.6 (5) + Q.7 (5) + Q.8 (5) + Q.9 (5)',
  },
  q10_12_writing: {
    title: 'Questions 10–12: Part B—Writing (40 Marks)',
    sub: 'Q.10 Paragraph (10) + Q.11 E-mail/Letter (10) + Q.12 Composition (20)',
  },
};

const ALPHA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

export const English2ndSectionModal: React.FC<English2ndSectionModalProps> = ({
  isOpen,
  onClose,
  section,
  grade = 'Class 10 (SSC)',
  existingQuestions,
  onSave,
}) => {
  const [q13, setQ13] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q1_3)));
  const [q45, setQ45] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q4_5)));
  const [q69, setQ69] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q6_9)));
  const [q1012, setQ1012] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q10_12)));

  useEffect(() => {
    if (!isOpen) return;
    const gid = SSC_ENG2_GROUP_IDS[section];
    const grp = existingQuestions.filter((q) => q.groupId === gid);

    if (section === 'q1_3_grammar') {
      if (grp.length === 0) {
        setQ13(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q1_3)));
      } else {
        const next = JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q1_3));
        next.includePartABanner = grp.some((q) => q.groupRole === 'eng1_part_banner');
        const clozes = grp.filter((q) => q.groupRole === 'eng1_cloze');
        if (clozes[0]) {
          next.q1Instruction = clozes[0].topic || next.q1Instruction;
          next.q1MarksText = clozes[0].customMarksText || next.q1MarksText;
          next.q1Clues = (clozes[0].wordClues || []).join(', ');
          next.q1Text = clozes[0].stemOrPassage || '';
        }
        const subQ = grp.find((q) => q.groupRole === 'eng2_substitution_table');
        if (subQ) {
          next.q2Instruction = subQ.topic || next.q2Instruction;
          next.q2MarksText = subQ.customMarksText || next.q2MarksText;
          try {
            if (subQ.explanation) next.q2Table = JSON.parse(subQ.explanation) as Eng2SubstitutionTableData;
          } catch {
            // keep default
          }
        }
        if (clozes[1]) {
          next.q3Instruction = clozes[1].topic || next.q3Instruction;
          next.q3MarksText = clozes[1].customMarksText || next.q3MarksText;
          next.q3Clues = (clozes[1].wordClues || []).join(', ');
          next.q3Text = clozes[1].stemOrPassage || '';
        }
        setQ13(next);
      }
    } else if (section === 'q4_5_grammar') {
      const qaList = grp.filter((q) => q.groupRole === 'eng1_qa_list');
      if (qaList.length === 0) {
        setQ45(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q4_5)));
      } else {
        setQ45({
          q4Instruction: qaList[0]?.stemOrPassage || DEFAULT_SSC_ENG2_Q4_5.q4Instruction,
          q4MarksText: qaList[0]?.customMarksText || '1×10=10',
          q4Items: qaList[0]?.subQuestions?.map((s) => s.questionText) || DEFAULT_SSC_ENG2_Q4_5.q4Items,
          q5Instruction: qaList[1]?.stemOrPassage || DEFAULT_SSC_ENG2_Q4_5.q5Instruction,
          q5MarksText: qaList[1]?.customMarksText || '1×5=5',
          q5Items: qaList[1]?.subQuestions?.map((s) => s.questionText) || DEFAULT_SSC_ENG2_Q4_5.q5Items,
        });
      }
    } else if (section === 'q6_9_grammar') {
      const clozes = grp.filter((q) => q.groupRole === 'eng1_cloze');
      const wQ = grp.find((q) => q.groupRole === 'eng1_writing');
      if (clozes.length === 0 && !wQ) {
        setQ69(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q6_9)));
      } else {
        setQ69({
          q6Instruction: clozes[0]?.topic || DEFAULT_SSC_ENG2_Q6_9.q6Instruction,
          q6MarksText: clozes[0]?.customMarksText || '1×5=5',
          q6Text: clozes[0]?.stemOrPassage || '',
          q7Instruction: clozes[1]?.topic || DEFAULT_SSC_ENG2_Q6_9.q7Instruction,
          q7MarksText: clozes[1]?.customMarksText || '1×5=5',
          q7Text: clozes[1]?.stemOrPassage || '',
          q8Instruction: clozes[2]?.topic || DEFAULT_SSC_ENG2_Q6_9.q8Instruction,
          q8MarksText: clozes[2]?.customMarksText || '1×5=5',
          q8Text: clozes[2]?.stemOrPassage || '',
          q9Instruction: wQ?.topic || DEFAULT_SSC_ENG2_Q6_9.q9Instruction,
          q9MarksText: wQ?.customMarksText || '5',
          q9Text: wQ?.stemOrPassage || '',
        });
      }
    } else if (section === 'q10_12_writing') {
      const wItems = grp.filter((q) => q.groupRole === 'eng1_writing');
      if (wItems.length === 0) {
        setQ1012(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG2_Q10_12)));
      } else {
        setQ1012({
          includePartBBanner: grp.some((q) => q.groupRole === 'eng1_part_banner'),
          q10Instruction: wItems[0]?.topic || DEFAULT_SSC_ENG2_Q10_12.q10Instruction,
          q10Body: wItems[0]?.stemOrPassage || '',
          q10Marks: wItems[0]?.marks || 10,
          q11Instruction: wItems[1]?.topic || DEFAULT_SSC_ENG2_Q10_12.q11Instruction,
          q11Body: wItems[1]?.stemOrPassage || '',
          q11Marks: wItems[1]?.marks || 10,
          q12Instruction: wItems[2]?.topic || DEFAULT_SSC_ENG2_Q10_12.q12Instruction,
          q12Body: wItems[2]?.stemOrPassage || '',
          q12Marks: wItems[2]?.marks || 20,
        });
      }
    }
  }, [isOpen, section, existingQuestions]);

  if (!isOpen) return null;

  const parseClues = (str: string) =>
    str
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSave = () => {
    const gid = SSC_ENG2_GROUP_IDS[section];
    const baseMeta = {
      subject: 'ENGLISH SECOND PAPER',
      grade,
      difficulty: 'Medium' as const,
      languages: ['en' as const],
      sourceType: 'MANUAL' as const,
      groupId: gid,
    };
    const out: QuestionData[] = [];

    if (section === 'q1_3_grammar') {
      if (q13.includePartABanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_a`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part A—Grammar\nMarks—60',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_q1`,
        typology: 'FILL_BLANKS',
        customNumber: '1.',
        topic: q13.q1Instruction,
        stemOrPassage: q13.q1Text.trim(),
        hasClues: true,
        wordClues: parseClues(q13.q1Clues),
        customMarksText: q13.q1MarksText,
        marks: 10,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q2`,
        typology: 'MATCHING',
        customNumber: '2.',
        topic: q13.q2Instruction,
        stemOrPassage: '',
        explanation: JSON.stringify(q13.q2Table),
        customMarksText: q13.q2MarksText,
        marks: 5,
        groupRole: 'eng2_substitution_table',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q3`,
        typology: 'FILL_BLANKS',
        customNumber: '3.',
        topic: q13.q3Instruction,
        stemOrPassage: q13.q3Text.trim(),
        hasClues: true,
        wordClues: parseClues(q13.q3Clues),
        customMarksText: q13.q3MarksText,
        marks: 10,
        groupRole: 'eng1_cloze',
      });
    } else if (section === 'q4_5_grammar') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q4`,
        typology: 'CQ',
        customNumber: '4.',
        stemOrPassage: q45.q4Instruction,
        customMarksText: q45.q4MarksText,
        marks: 10,
        groupRole: 'eng1_qa_list',
        subQuestions: q45.q4Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 1,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q5`,
        typology: 'CQ',
        customNumber: '5.',
        stemOrPassage: q45.q5Instruction,
        customMarksText: q45.q5MarksText,
        marks: 5,
        groupRole: 'eng1_qa_list',
        subQuestions: q45.q5Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 1,
        })),
      });
    } else if (section === 'q6_9_grammar') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q6`,
        typology: 'FILL_BLANKS',
        customNumber: '6.',
        topic: q69.q6Instruction,
        stemOrPassage: q69.q6Text.trim(),
        customMarksText: q69.q6MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q7`,
        typology: 'FILL_BLANKS',
        customNumber: '7.',
        topic: q69.q7Instruction,
        stemOrPassage: q69.q7Text.trim(),
        customMarksText: q69.q7MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q8`,
        typology: 'FILL_BLANKS',
        customNumber: '8.',
        topic: q69.q8Instruction,
        stemOrPassage: q69.q8Text.trim(),
        customMarksText: q69.q8MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q9`,
        typology: 'DESCRIPTIVE',
        customNumber: '9.',
        topic: q69.q9Instruction,
        stemOrPassage: q69.q9Text.trim(),
        customMarksText: q69.q9MarksText,
        marks: 5,
        groupRole: 'eng1_writing',
      });
    } else if (section === 'q10_12_writing') {
      if (q1012.includePartBBanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_b`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part B—Writing\nMarks—40',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_q10`,
        typology: 'DESCRIPTIVE',
        customNumber: '10.',
        topic: q1012.q10Instruction,
        stemOrPassage: q1012.q10Body.trim(),
        customMarksText: String(q1012.q10Marks),
        marks: q1012.q10Marks,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q11`,
        typology: 'DESCRIPTIVE',
        customNumber: '11.',
        topic: q1012.q11Instruction,
        stemOrPassage: q1012.q11Body.trim(),
        customMarksText: String(q1012.q11Marks),
        marks: q1012.q11Marks,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q12`,
        typology: 'DESCRIPTIVE',
        customNumber: '12.',
        topic: q1012.q12Instruction,
        stemOrPassage: q1012.q12Body.trim(),
        customMarksText: String(q1012.q12Marks),
        marks: q1012.q12Marks,
        groupRole: 'eng1_writing',
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
        <div className="px-3 py-2 sm:px-5 sm:py-3 bg-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold leading-tight truncate">{meta.title}</h2>
            <p className="text-[10px] sm:text-[11px] text-blue-100 truncate">{meta.sub}</p>
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
          {section === 'q1_3_grammar' && (
            <>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q13.includePartABanner}
                  onChange={(e) => setQ13((p: any) => ({ ...p, includePartABanner: e.target.checked }))}
                />
                Include &quot;Part A—Grammar (Marks—60)&quot; banner above Q. 1
              </label>

              {/* Q.1 Cloze with Clues */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-blue-900">1. Cloze Test with Clues</span>
                  <input
                    type="text"
                    value={q13.q1MarksText}
                    onChange={(e) => setQ13((p: any) => ({ ...p, q1MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q13.q1Instruction}
                  onChange={(e) => setQ13((p: any) => ({ ...p, q1Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Word Box (10 words, comma-separated):
                  </label>
                  <input
                    type="text"
                    value={q13.q1Clues}
                    onChange={(e) => setQ13((p: any) => ({ ...p, q1Clues: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <textarea
                  rows={4}
                  value={q13.q1Text}
                  onChange={(e) => setQ13((p: any) => ({ ...p, q1Text: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>

              {/* Q.2 Substitution Table */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-blue-900">
                    2. Substitution Table (Merged Middle Verb Column)
                  </span>
                  <input
                    type="text"
                    value={q13.q2MarksText}
                    onChange={(e) => setQ13((p: any) => ({ ...p, q2MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q13.q2Instruction}
                  onChange={(e) => setQ13((p: any) => ({ ...p, q2Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Column 1 (Subjects a–e)
                    </label>
                    {q13.q2Table.colLeft.map((val: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            setQ13((p: any) => ({
                              ...p,
                              q2Table: {
                                ...p.q2Table,
                                colLeft: p.q2Table.colLeft.map((v: string, i: number) =>
                                  i === idx ? e.target.value : v
                                ),
                              },
                            }))
                          }
                          className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Middle Verbs (1/line)
                    </label>
                    <textarea
                      rows={5}
                      value={(q13.q2Table.colMiddleVerbs || []).join('\n')}
                      onChange={(e) =>
                        setQ13((p: any) => ({
                          ...p,
                          q2Table: {
                            ...p.q2Table,
                            colMiddleVerbs: e.target.value.split('\n'),
                          },
                        }))
                      }
                      className="w-full px-2 py-1.5 text-xs font-semibold text-center border border-slate-300 rounded-lg leading-relaxed"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Column 3 (Predicates)
                    </label>
                    {q13.q2Table.colRight.map((val: string, idx: number) => (
                      <input
                        key={idx}
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setQ13((p: any) => ({
                            ...p,
                            q2Table: {
                              ...p.q2Table,
                              colRight: p.q2Table.colRight.map((v: string, i: number) =>
                                i === idx ? e.target.value : v
                              ),
                            },
                          }))
                        }
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Q.3 Right Forms of Verbs */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-blue-900">
                    3. Right Forms of Verbs
                  </span>
                  <input
                    type="text"
                    value={q13.q3MarksText}
                    onChange={(e) => setQ13((p: any) => ({ ...p, q3MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q13.q3Instruction}
                  onChange={(e) => setQ13((p: any) => ({ ...p, q3Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Verb Box (10 verbs, comma-separated):
                  </label>
                  <input
                    type="text"
                    value={q13.q3Clues}
                    onChange={(e) => setQ13((p: any) => ({ ...p, q3Clues: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <textarea
                  rows={4}
                  value={q13.q3Text}
                  onChange={(e) => setQ13((p: any) => ({ ...p, q3Text: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>
            </>
          )}

          {section === 'q4_5_grammar' && (
            <>
              {/* Q.4 Changing Sentences */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-blue-900">
                    4. Changing Sentences (1×10=10)
                  </span>
                  <input
                    type="text"
                    value={q45.q4MarksText}
                    onChange={(e) => setQ45((p: any) => ({ ...p, q4MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q45.q4Instruction}
                  onChange={(e) => setQ45((p: any) => ({ ...p, q4Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                {q45.q4Items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setQ45((p: any) => ({
                          ...p,
                          q4Items: p.q4Items.map((v: string, i: number) =>
                            i === idx ? e.target.value : v
                          ),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                    {q45.q4Items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQ45((p: any) => ({
                            ...p,
                            q4Items: p.q4Items.filter((_: string, i: number) => i !== idx),
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
                  onClick={() => setQ45((p: any) => ({ ...p, q4Items: [...p.q4Items, ''] }))}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Sentence
                </button>
              </div>

              {/* Q.5 Tag Questions */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-blue-900">
                    5. Tag Questions (1×5=5)
                  </span>
                  <input
                    type="text"
                    value={q45.q5MarksText}
                    onChange={(e) => setQ45((p: any) => ({ ...p, q5MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q45.q5Instruction}
                  onChange={(e) => setQ45((p: any) => ({ ...p, q5Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                {q45.q5Items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setQ45((p: any) => ({
                          ...p,
                          q5Items: p.q5Items.map((v: string, i: number) =>
                            i === idx ? e.target.value : v
                          ),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'q6_9_grammar' && (
            <div className="space-y-3">
              {[
                { key: 'q6', num: '6. Suffixes & Prefixes', insKey: 'q6Instruction', mKey: 'q6MarksText', tKey: 'q6Text' },
                { key: 'q7', num: '7. Prepositions', insKey: 'q7Instruction', mKey: 'q7MarksText', tKey: 'q7Text' },
                { key: 'q8', num: '8. Connectors / Linking Words', insKey: 'q8Instruction', mKey: 'q8MarksText', tKey: 'q8Text' },
                { key: 'q9', num: '9. Capitalization & Punctuation', insKey: 'q9Instruction', mKey: 'q9MarksText', tKey: 'q9Text' },
              ].map((blk) => (
                <div key={blk.key} className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-blue-900">{blk.num}</span>
                    <input
                      type="text"
                      value={(q69 as any)[blk.mKey]}
                      onChange={(e) => setQ69((p: any) => ({ ...p, [blk.mKey]: e.target.value }))}
                      className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                    />
                  </div>
                  <input
                    type="text"
                    value={(q69 as any)[blk.insKey]}
                    onChange={(e) => setQ69((p: any) => ({ ...p, [blk.insKey]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                  />
                  <textarea
                    rows={3}
                    value={(q69 as any)[blk.tKey]}
                    onChange={(e) => setQ69((p: any) => ({ ...p, [blk.tKey]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}

          {section === 'q10_12_writing' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q1012.includePartBBanner}
                  onChange={(e) =>
                    setQ1012((p: any) => ({ ...p, includePartBBanner: e.target.checked }))
                  }
                />
                Include &quot;Part B—Writing (Marks—40)&quot; banner above Q. 10
              </label>

              {[
                { label: '10. Paragraph Writing', insKey: 'q10Instruction', bodyKey: 'q10Body', mKey: 'q10Marks' },
                { label: '11. E-mail / Formal Letter', insKey: 'q11Instruction', bodyKey: 'q11Body', mKey: 'q11Marks' },
                { label: '12. Composition Writing', insKey: 'q12Instruction', bodyKey: 'q12Body', mKey: 'q12Marks' },
              ].map((blk) => (
                <div key={blk.label} className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-emerald-900">{blk.label}</span>
                    <input
                      type="number"
                      min={1}
                      value={(q1012 as any)[blk.mKey]}
                      onChange={(e) =>
                        setQ1012((p: any) => ({ ...p, [blk.mKey]: Number(e.target.value) || 10 }))
                      }
                      className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={(q1012 as any)[blk.insKey]}
                    onChange={(e) => setQ1012((p: any) => ({ ...p, [blk.insKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={(q1012 as any)[blk.bodyKey]}
                    onChange={(e) => setQ1012((p: any) => ({ ...p, [blk.bodyKey]: e.target.value }))}
                    placeholder="Optional guiding questions or notes..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              ))}
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
            className="px-5 py-2 text-xs font-extrabold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add / Update in Paper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
