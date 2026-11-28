'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_SSC_ENG1_MATCHING,
  DEFAULT_SSC_ENG1_POEMS,
  DEFAULT_SSC_ENG1_REARRANGE,
  DEFAULT_SSC_ENG1_SEEN,
  DEFAULT_SSC_ENG1_STORIES,
  DEFAULT_SSC_ENG1_STORY_10,
  DEFAULT_SSC_ENG1_UNSEEN,
  DEFAULT_SSC_ENG1_WRITING_11,
  EngInfoTableData,
  EngMcqItem,
  SSC_ENG1_GROUP_IDS,
  SscEng1MatchingState,
  SscEng1Section,
  SscEng1SeenState,
  SscEng1UnseenState,
} from './english1stDefaults';

interface English1stSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SscEng1Section;
  grade?: string;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

const SECTION_TITLES: Record<SscEng1Section, { title: string; sub: string }> = {
  seen_1_3: {
    title: 'Seen Passage & Questions 1, 2, 3 (22 Marks)',
    sub: 'Part A—Reading Test · Q.1 MCQ (7) + Q.2 Short Q/A (10) + Q.3 Gap-Fill (5)',
  },
  unseen_4_5: {
    title: 'Unseen Passage & Questions 4, 5 (15 Marks)',
    sub: 'Part A—Reading Test · Q.4 Information Transfer Table (5) + Q.5 Summary (10)',
  },
  matching_rearrange_6_7: {
    title: 'Questions 6 & 7 — Matching & Rearranging (13 Marks)',
    sub: 'Q.6 3-Column Matching Table (5) + Q.7 Rearranging Sentences (8)',
  },
  poems_writing_8_11: {
    title: 'Questions 8–11 — Poems, Stories & Writing (50 Marks)',
    sub: 'Q.8 Poems (10) + Q.9 Stories (10) + Part B: Q.10 Completing Story (15) + Q.11 Dialogue/Writing (15)',
  },
};

const ALPHA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

export const English1stSectionModal: React.FC<English1stSectionModalProps> = ({
  isOpen,
  onClose,
  section,
  grade = 'Class 10 (SSC)',
  existingQuestions,
  onSave,
}) => {
  const [seen, setSeen] = useState<SscEng1SeenState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_SEEN))
  );
  const [unseen, setUnseen] = useState<SscEng1UnseenState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_UNSEEN))
  );
  const [matching, setMatching] = useState<SscEng1MatchingState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_MATCHING))
  );
  const [rearrange, setRearrange] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_REARRANGE))
  );
  const [poems, setPoems] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_POEMS)));
  const [stories, setStories] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_STORIES))
  );
  const [story10, setStory10] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_STORY_10))
  );
  const [writing11, setWriting11] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_WRITING_11))
  );

  // Hydrate current section from existing canvas questions
  useEffect(() => {
    if (!isOpen) return;
    const gid = SSC_ENG1_GROUP_IDS[section];
    const grp = existingQuestions.filter((q) => q.groupId === gid);

    if (section === 'seen_1_3') {
      if (grp.length === 0) {
        setSeen(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_SEEN)));
      } else {
        const next: SscEng1SeenState = JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_SEEN));
        next.includePartABanner = grp.some((q) => q.groupRole === 'eng1_part_banner');
        const pQ = grp.find((q) => q.groupRole === 'eng1_passage');
        if (pQ) {
          next.passageInstruction = pQ.chapter || next.passageInstruction;
          next.passageText = pQ.stemOrPassage || '';
        }
        const mcqQ = grp.find((q) => q.groupRole === 'eng1_mcq_list');
        if (mcqQ && mcqQ.passageQuestions) {
          next.q1Instruction = mcqQ.stemOrPassage || next.q1Instruction;
          next.q1MarksText = mcqQ.customMarksText || next.q1MarksText;
          next.q1Items = mcqQ.passageQuestions.map((pq, i) => ({
            id: pq.id || `smcq_${i + 1}`,
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
          next.q2Instruction = qaQ.stemOrPassage || next.q2Instruction;
          next.q2MarksText = qaQ.customMarksText || next.q2MarksText;
          next.q2Items = qaQ.subQuestions.map((s) => s.questionText);
        }
        const clozeQ = grp.find((q) => q.groupRole === 'eng1_cloze');
        if (clozeQ) {
          next.q3Instruction = clozeQ.topic || next.q3Instruction;
          next.q3MarksText = clozeQ.customMarksText || next.q3MarksText;
          next.q3ClozeText = clozeQ.stemOrPassage || '';
        }
        setSeen(next);
      }
    } else if (section === 'unseen_4_5') {
      if (grp.length === 0) {
        setUnseen(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_UNSEEN)));
      } else {
        const next: SscEng1UnseenState = JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_UNSEEN));
        const pQ = grp.find((q) => q.groupRole === 'eng1_passage');
        if (pQ) {
          next.passageInstruction = pQ.chapter || next.passageInstruction;
          next.passageText = pQ.stemOrPassage || '';
        }
        const tQ = grp.find((q) => q.groupRole === 'eng1_info_table');
        if (tQ) {
          next.q4Instruction = tQ.topic || next.q4Instruction;
          next.q4MarksText = tQ.customMarksText || next.q4MarksText;
          try {
            if (tQ.explanation) next.q4Table = JSON.parse(tQ.explanation) as EngInfoTableData;
          } catch {
            // keep default
          }
        }
        const sQ = grp.find((q) => q.groupRole === 'eng1_writing');
        if (sQ) {
          next.q5Instruction = sQ.topic || next.q5Instruction;
          next.q5Marks = sQ.marks || 10;
        }
        setUnseen(next);
      }
    } else if (section === 'matching_rearrange_6_7') {
      const mQ = grp.find((q) => q.groupRole === 'eng1_matching_table');
      if (mQ && mQ.matchingColumns) {
        setMatching({
          instruction: mQ.stemOrPassage || DEFAULT_SSC_ENG1_MATCHING.instruction,
          marksText: mQ.customMarksText || '1×5=5',
          hasThirdColumn: Boolean(mQ.matchingColumns.colC && mQ.matchingColumns.colC.length > 0),
          colA: mQ.matchingColumns.colA || [],
          colB: mQ.matchingColumns.colB || [],
          colC: mQ.matchingColumns.colC || ['', '', '', '', ''],
        });
      } else {
        setMatching(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_MATCHING)));
      }
      const rQ = grp.find((q) => q.groupRole === 'eng1_rearrange');
      if (rQ) {
        setRearrange({
          instruction: rQ.stemOrPassage || DEFAULT_SSC_ENG1_REARRANGE.instruction,
          marksText: rQ.customMarksText || '1×8=8',
          items: rQ.statements && rQ.statements.length > 0 ? rQ.statements : DEFAULT_SSC_ENG1_REARRANGE.items,
        });
      } else {
        setRearrange(JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_REARRANGE)));
      }
    } else if (section === 'poems_writing_8_11') {
      const qaItems = grp.filter((item) => item.groupRole === 'eng1_qa_list');
      const pQ = qaItems[0];
      const sQ = qaItems[1];
      setPoems(
        pQ && pQ.subQuestions
          ? {
              instruction: pQ.stemOrPassage || DEFAULT_SSC_ENG1_POEMS.instruction,
              marksText: pQ.customMarksText || '2×5=10',
              items: pQ.subQuestions.map((s) => s.questionText),
            }
          : JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_POEMS))
      );
      setStories(
        sQ && sQ.subQuestions
          ? {
              instruction: sQ.stemOrPassage || DEFAULT_SSC_ENG1_STORIES.instruction,
              marksText: sQ.customMarksText || '2×5=10',
              items: sQ.subQuestions.map((s) => s.questionText),
            }
          : JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_STORIES))
      );
      const wItems = grp.filter((item) => item.groupRole === 'eng1_writing');
      const st10 = wItems[0];
      const wr11 = wItems[1];
      setStory10(
        st10
          ? {
              includePartBBanner: grp.some((item) => item.groupRole === 'eng1_part_banner'),
              instruction: st10.topic || DEFAULT_SSC_ENG1_STORY_10.instruction,
              body: st10.stemOrPassage || '',
              marks: st10.marks || 15,
            }
          : JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_STORY_10))
      );
      setWriting11(
        wr11
          ? {
              instruction: wr11.topic || DEFAULT_SSC_ENG1_WRITING_11.instruction,
              body: wr11.stemOrPassage || '',
              marks: wr11.marks || 15,
            }
          : JSON.parse(JSON.stringify(DEFAULT_SSC_ENG1_WRITING_11))
      );
    }
  }, [isOpen, section, existingQuestions]);

  if (!isOpen) return null;

  const handleSave = () => {
    const gid = SSC_ENG1_GROUP_IDS[section];
    const baseMeta = {
      subject: 'ENGLISH FIRST PAPER',
      grade,
      difficulty: 'Medium' as const,
      languages: ['en' as const],
      sourceType: 'MANUAL' as const,
      groupId: gid,
    };
    const out: QuestionData[] = [];

    if (section === 'seen_1_3') {
      if (seen.includePartABanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_a`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part A—Reading Test\nMarks—70',
          customMarksText: 'Marks',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_passage`,
        typology: 'PASSAGE_ONLY',
        chapter: seen.passageInstruction,
        stemOrPassage: seen.passageText.trim(),
        marks: 0,
        groupRole: 'eng1_passage',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q1`,
        typology: 'PASSAGE_GROUP',
        customNumber: '1.',
        stemOrPassage: seen.q1Instruction,
        customMarksText: seen.q1MarksText,
        marks: seen.q1Items.length,
        groupRole: 'eng1_mcq_list',
        passageQuestions: seen.q1Items.map((item, idx) => ({
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
        _id: `${gid}_q2`,
        typology: 'CQ',
        customNumber: '2.',
        stemOrPassage: seen.q2Instruction,
        customMarksText: seen.q2MarksText,
        marks: seen.q2Items.length * 2,
        groupRole: 'eng1_qa_list',
        subQuestions: seen.q2Items.map((text, idx) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 2,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q3`,
        typology: 'FILL_BLANKS',
        customNumber: '3.',
        topic: seen.q3Instruction,
        stemOrPassage: seen.q3ClozeText.trim(),
        customMarksText: seen.q3MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
    } else if (section === 'unseen_4_5') {
      out.push({
        ...baseMeta,
        _id: `${gid}_passage`,
        typology: 'PASSAGE_ONLY',
        chapter: unseen.passageInstruction,
        stemOrPassage: unseen.passageText.trim(),
        marks: 0,
        groupRole: 'eng1_passage',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q4`,
        typology: 'DESCRIPTIVE',
        customNumber: '4.',
        topic: unseen.q4Instruction,
        stemOrPassage: '',
        explanation: JSON.stringify(unseen.q4Table),
        customMarksText: unseen.q4MarksText,
        marks: 5,
        groupRole: 'eng1_info_table',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q5`,
        typology: 'DESCRIPTIVE',
        customNumber: '5.',
        topic: unseen.q5Instruction,
        stemOrPassage: '',
        customMarksText: String(unseen.q5Marks),
        marks: unseen.q5Marks,
        groupRole: 'eng1_writing',
      });
    } else if (section === 'matching_rearrange_6_7') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q6`,
        typology: 'MATCHING',
        customNumber: '6.',
        stemOrPassage: matching.instruction,
        customMarksText: matching.marksText,
        marks: 5,
        groupRole: 'eng1_matching_table',
        matchingColumns: {
          colA: matching.colA,
          colB: matching.colB,
          colC: matching.hasThirdColumn ? matching.colC : undefined,
        },
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q7`,
        typology: 'DESCRIPTIVE',
        customNumber: '7.',
        chapter: 'alpha',
        stemOrPassage: rearrange.instruction,
        statements: rearrange.items.map((s: string) => s.trim()),
        customMarksText: rearrange.marksText,
        marks: rearrange.items.length,
        groupRole: 'eng1_rearrange',
      });
    } else if (section === 'poems_writing_8_11') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q8`,
        typology: 'CQ',
        customNumber: '8.',
        stemOrPassage: poems.instruction,
        customMarksText: poems.marksText,
        marks: 10,
        groupRole: 'eng1_qa_list',
        subQuestions: poems.items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 2,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q9`,
        typology: 'CQ',
        customNumber: '9.',
        stemOrPassage: stories.instruction,
        customMarksText: stories.marksText,
        marks: 10,
        groupRole: 'eng1_qa_list',
        subQuestions: stories.items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 2,
        })),
      });
      if (story10.includePartBBanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_b`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part B—Writing Test\nMarks—30',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_q10`,
        typology: 'DESCRIPTIVE',
        customNumber: '10.',
        topic: story10.instruction,
        stemOrPassage: story10.body.trim(),
        customMarksText: String(story10.marks),
        marks: story10.marks,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q11`,
        typology: 'DESCRIPTIVE',
        customNumber: '11.',
        topic: writing11.instruction,
        stemOrPassage: writing11.body.trim(),
        customMarksText: String(writing11.marks),
        marks: writing11.marks,
        groupRole: 'eng1_writing',
      });
    }

    onSave(out, gid);
    onClose();
  };

  const meta = SECTION_TITLES[section];

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
          {section === 'seen_1_3' && (
            <>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={seen.includePartABanner}
                  onChange={(e) => setSeen((p) => ({ ...p, includePartABanner: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                Include &quot;Part A—Reading Test (Marks—70)&quot; banner above passage
              </label>

              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-2">
                <label className="text-xs font-extrabold text-blue-950 block">Seen Passage 1</label>
                <input
                  type="text"
                  value={seen.passageInstruction}
                  onChange={(e) => setSeen((p) => ({ ...p, passageInstruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                />
                <textarea
                  rows={5}
                  value={seen.passageText}
                  onChange={(e) => setSeen((p) => ({ ...p, passageText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white leading-relaxed"
                />
              </div>

              {/* Q.1 MCQ */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    1. Multiple Choice Questions (MCQ)
                  </span>
                  <input
                    type="text"
                    value={seen.q1MarksText}
                    onChange={(e) => setSeen((p) => ({ ...p, q1MarksText: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={seen.q1Instruction}
                  onChange={(e) => setSeen((p) => ({ ...p, q1Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                <div className="space-y-2">
                  {seen.q1Items.map((mcq: EngMcqItem, idx: number) => (
                    <div key={mcq.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-800">({ALPHA[idx]})</span>
                        <input
                          type="text"
                          value={mcq.questionText}
                          onChange={(e) =>
                            setSeen((p) => ({
                              ...p,
                              q1Items: p.q1Items.map((it, i) =>
                                i === idx ? { ...it, questionText: e.target.value } : it
                              ),
                            }))
                          }
                          className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        />
                        {seen.q1Items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSeen((p) => ({
                                ...p,
                                q1Items: p.q1Items.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5">
                        {mcq.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 w-7">
                              ({ROMAN[oIdx]})
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                setSeen((p) => ({
                                  ...p,
                                  q1Items: p.q1Items.map((it, i) => {
                                    if (i !== idx) return it;
                                    const nextOpts = [...it.options] as [string, string, string, string];
                                    nextOpts[oIdx] = e.target.value;
                                    return { ...it, options: nextOpts };
                                  }),
                                }))
                              }
                              className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setSeen((p) => ({
                        ...p,
                        q1Items: [
                          ...p.q1Items,
                          { id: `smcq_${Date.now()}`, questionText: '', options: ['', '', '', ''] },
                        ],
                      }))
                    }
                    className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add MCQ
                  </button>
                </div>
              </div>

              {/* Q.2 Short Q/A */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    2. Open-ended Questions
                  </span>
                  <input
                    type="text"
                    value={seen.q2MarksText}
                    onChange={(e) => setSeen((p) => ({ ...p, q2MarksText: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                {seen.q2Items.map((qText, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={qText}
                      onChange={(e) =>
                        setSeen((p) => ({
                          ...p,
                          q2Items: p.q2Items.map((t, i) => (i === idx ? e.target.value : t)),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                    {seen.q2Items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSeen((p) => ({
                            ...p,
                            q2Items: p.q2Items.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSeen((p) => ({ ...p, q2Items: [...p.q2Items, ''] }))}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              {/* Q.3 Gap-Fill */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    3. Fill in the Gaps (without clues)
                  </span>
                  <input
                    type="text"
                    value={seen.q3MarksText}
                    onChange={(e) => setSeen((p) => ({ ...p, q3MarksText: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={seen.q3Instruction}
                  onChange={(e) => setSeen((p) => ({ ...p, q3Instruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
                <textarea
                  rows={4}
                  value={seen.q3ClozeText}
                  onChange={(e) => setSeen((p) => ({ ...p, q3ClozeText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>
            </>
          )}

          {section === 'unseen_4_5' && (
            <>
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-2">
                <label className="text-xs font-extrabold text-blue-950 block">Unseen Passage 2</label>
                <input
                  type="text"
                  value={unseen.passageInstruction}
                  onChange={(e) => setUnseen((p) => ({ ...p, passageInstruction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                />
                <textarea
                  rows={5}
                  value={unseen.passageText}
                  onChange={(e) => setUnseen((p) => ({ ...p, passageText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white leading-relaxed"
                />
              </div>

              {/* Q.4 Information Transfer Table */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    4. Information Transfer Table
                  </span>
                  <input
                    type="text"
                    value={unseen.q4MarksText}
                    onChange={(e) => setUnseen((p) => ({ ...p, q4MarksText: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>

                {/* Top Key-Value Summary Rows */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">
                      Top Summary Rows (optional, e.g. Purpose / Starting):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUnseen((p) => ({
                          ...p,
                          q4Table: {
                            ...p.q4Table,
                            topRows: [...p.q4Table.topRows, { label: '', value: '' }],
                          },
                        }))
                      }
                      className="text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      + Add Top Row
                    </button>
                  </div>
                  {unseen.q4Table.topRows.map((tr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tr.label}
                        placeholder="Label (e.g. Purpose)"
                        onChange={(e) =>
                          setUnseen((p) => ({
                            ...p,
                            q4Table: {
                              ...p.q4Table,
                              topRows: p.q4Table.topRows.map((r, i) =>
                                i === idx ? { ...r, label: e.target.value } : r
                              ),
                            },
                          }))
                        }
                        className="w-32 px-2 py-1 text-xs font-semibold border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={tr.value}
                        placeholder="Value..."
                        onChange={(e) =>
                          setUnseen((p) => ({
                            ...p,
                            q4Table: {
                              ...p.q4Table,
                              topRows: p.q4Table.topRows.map((r, i) =>
                                i === idx ? { ...r, value: e.target.value } : r
                              ),
                            },
                          }))
                        }
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setUnseen((p) => ({
                            ...p,
                            q4Table: {
                              ...p.q4Table,
                              topRows: p.q4Table.topRows.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Main Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        {unseen.q4Table.headers.map((h, cIdx) => (
                          <th key={cIdx} className="border border-slate-300 p-1 bg-slate-100">
                            <input
                              type="text"
                              value={h}
                              onChange={(e) =>
                                setUnseen((p) => ({
                                  ...p,
                                  q4Table: {
                                    ...p.q4Table,
                                    headers: p.q4Table.headers.map((hdr, i) =>
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
                      {unseen.q4Table.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="border border-slate-300 p-1">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) =>
                                  setUnseen((p) => ({
                                    ...p,
                                    q4Table: {
                                      ...p.q4Table,
                                      rows: p.q4Table.rows.map((r, ri) =>
                                        ri === rIdx
                                          ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
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
                                setUnseen((p) => ({
                                  ...p,
                                  q4Table: {
                                    ...p.q4Table,
                                    rows: p.q4Table.rows.filter((_, ri) => ri !== rIdx),
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
                    setUnseen((p) => ({
                      ...p,
                      q4Table: {
                        ...p.q4Table,
                        rows: [...p.q4Table.rows, p.q4Table.headers.map(() => '')],
                      },
                    }))
                  }
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Table Row
                </button>
              </div>

              {/* Q.5 Summary */}
              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800 shrink-0">5.</span>
                <input
                  type="text"
                  value={unseen.q5Instruction}
                  onChange={(e) => setUnseen((p) => ({ ...p, q5Instruction: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={unseen.q5Marks}
                  onChange={(e) => setUnseen((p) => ({ ...p, q5Marks: Number(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
              </div>
            </>
          )}

          {section === 'matching_rearrange_6_7' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-extrabold text-blue-900">6. Matching Table (1×5=5)</div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    type="text"
                    value={matching.instruction}
                    onChange={(e) => setMatching((p) => ({ ...p, instruction: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={matching.marksText}
                    onChange={(e) => setMatching((p) => ({ ...p, marksText: e.target.value }))}
                    className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={matching.hasThirdColumn}
                    onChange={(e) => setMatching((p) => ({ ...p, hasThirdColumn: e.target.checked }))}
                  />
                  Include Column C (3-Column Board Format)
                </label>

                <div className="space-y-2">
                  {matching.colA.map((_, idx) => (
                    <div
                      key={idx}
                      className={`grid gap-2 ${matching.hasThirdColumn ? 'grid-cols-3' : 'grid-cols-2'}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                        <input
                          type="text"
                          value={matching.colA[idx] || ''}
                          onChange={(e) =>
                            setMatching((p) => ({
                              ...p,
                              colA: p.colA.map((v, i) => (i === idx ? e.target.value : v)),
                            }))
                          }
                          placeholder="Column A"
                          className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-600 w-6">({ROMAN[idx]})</span>
                        <input
                          type="text"
                          value={matching.colB[idx] || ''}
                          onChange={(e) =>
                            setMatching((p) => ({
                              ...p,
                              colB: p.colB.map((v, i) => (i === idx ? e.target.value : v)),
                            }))
                          }
                          placeholder="Column B"
                          className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      {matching.hasThirdColumn && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-600 w-6">({ROMAN[idx]})</span>
                          <input
                            type="text"
                            value={matching.colC[idx] || ''}
                            onChange={(e) =>
                              setMatching((p) => ({
                                ...p,
                                colC: p.colC.map((v, i) => (i === idx ? e.target.value : v)),
                              }))
                            }
                            placeholder="Column C"
                            className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-extrabold text-blue-900">
                  7. Rearranging Sentences (1×8=8)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rearrange.instruction}
                    onChange={(e) => setRearrange((p: any) => ({ ...p, instruction: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={rearrange.marksText}
                    onChange={(e) => setRearrange((p: any) => ({ ...p, marksText: e.target.value }))}
                    className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                  />
                </div>
                {rearrange.items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setRearrange((p: any) => ({
                          ...p,
                          items: p.items.map((v: string, i: number) => (i === idx ? e.target.value : v)),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'poems_writing_8_11' && (
            <div className="space-y-4">
              {/* Q.8 Poems */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-extrabold text-blue-900">
                  8. Questions from Poems (2×5=10)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={poems.instruction}
                    onChange={(e) => setPoems((p: any) => ({ ...p, instruction: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={poems.marksText}
                    onChange={(e) => setPoems((p: any) => ({ ...p, marksText: e.target.value }))}
                    className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                  />
                </div>
                {poems.items.map((qText: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={qText}
                      onChange={(e) =>
                        setPoems((p: any) => ({
                          ...p,
                          items: p.items.map((v: string, i: number) => (i === idx ? e.target.value : v)),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                    {poems.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPoems((p: any) => ({
                            ...p,
                            items: p.items.filter((_: string, i: number) => i !== idx),
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
                  onClick={() => setPoems((p: any) => ({ ...p, items: [...p.items, ''] }))}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Poem Question
                </button>
              </div>

              {/* Q.9 Stories */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-extrabold text-blue-900">
                  9. Questions from Stories (2×5=10)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stories.instruction}
                    onChange={(e) => setStories((p: any) => ({ ...p, instruction: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={stories.marksText}
                    onChange={(e) => setStories((p: any) => ({ ...p, marksText: e.target.value }))}
                    className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                  />
                </div>
                {stories.items.map((qText: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={qText}
                      onChange={(e) =>
                        setStories((p: any) => ({
                          ...p,
                          items: p.items.map((v: string, i: number) => (i === idx ? e.target.value : v)),
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                    {stories.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setStories((p: any) => ({
                            ...p,
                            items: p.items.filter((_: string, i: number) => i !== idx),
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
                  onClick={() => setStories((p: any) => ({ ...p, items: [...p.items, ''] }))}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Story Question
                </button>
              </div>

              {/* Part B — Q.10 Completing Story */}
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-900">
                    10. Completing Story (15 Marks)
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={story10.includePartBBanner}
                      onChange={(e) =>
                        setStory10((p: any) => ({ ...p, includePartBBanner: e.target.checked }))
                      }
                    />
                    Include &quot;Part B—Writing Test&quot; banner
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={story10.instruction}
                    onChange={(e) => setStory10((p: any) => ({ ...p, instruction: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="number"
                    min={1}
                    value={story10.marks}
                    onChange={(e) =>
                      setStory10((p: any) => ({ ...p, marks: Number(e.target.value) || 15 }))
                    }
                    className="w-16 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center bg-white"
                  />
                </div>
                <textarea
                  rows={4}
                  value={story10.body}
                  onChange={(e) => setStory10((p: any) => ({ ...p, body: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed bg-white"
                />
              </div>

              {/* Q.11 Dialogue / Writing */}
              <div className="border border-teal-200 bg-teal-50/30 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-teal-900">
                    11. Dialogue / Paragraph / Letter Writing (15 Marks)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={writing11.marks}
                    onChange={(e) =>
                      setWriting11((p: any) => ({ ...p, marks: Number(e.target.value) || 15 }))
                    }
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg text-center bg-white"
                  />
                </div>
                <textarea
                  rows={3}
                  value={writing11.instruction}
                  onChange={(e) => setWriting11((p: any) => ({ ...p, instruction: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed bg-white"
                />
                <textarea
                  rows={2}
                  value={writing11.body}
                  onChange={(e) => setWriting11((p: any) => ({ ...p, body: e.target.value }))}
                  placeholder="Optional guiding points..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
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
