'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_HSC_ENG2_Q1_4,
  DEFAULT_HSC_ENG2_Q5_8,
  DEFAULT_HSC_ENG2_Q9_12,
  DEFAULT_HSC_ENG2_Q13_16,
  HSC_ENG2_GROUP_IDS,
  HscEng2Section,
} from './english2ndDefaults';

interface HscAlimEnglish2ndModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: HscEng2Section;
  grade?: string;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

const SECTION_META: Record<HscEng2Section, { title: string; sub: string }> = {
  q1_4_grammar: {
    title: 'Questions 1–4: Articles, Prepositions, Phrases & Clauses (20 Marks)',
    sub: 'Part A—Grammar · Q.1 Articles (5) + Q.2 Prepositions (5) + Q.3 Phrase Box (5) + Q.4 Completing Sentences (5)',
  },
  q5_8_grammar: {
    title: 'Questions 5–8: Verbs, Changing, Narration & Pronoun Ref (20 Marks)',
    sub: 'Part A—Grammar · Q.5 Right Form of Verbs (5) + Q.6 Changing (5) + Q.7 Reported Speech (5) + Q.8 Pronoun Ref (5)',
  },
  q9_12_grammar: {
    title: 'Questions 9–12: Modifiers, Connectors, Syn/Ant & Punctuation (20 Marks)',
    sub: 'Part A—Grammar · Q.9 Modifiers (5) + Q.10 Connectors (5) + Q.11 Synonym/Antonym (5) + Q.12 Punctuation (5)',
  },
  q13_16_comp: {
    title: 'Questions 13–16: Part B—Composition (40 Marks)',
    sub: 'Q.13 Application (8) + Q.14 Report (8) + Q.15 Paragraph (10) + Q.16 Short Composition (14)',
  },
};

const ALPHA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

export const HscAlimEnglish2ndModal: React.FC<HscAlimEnglish2ndModalProps> = ({
  isOpen,
  onClose,
  section,
  grade = 'Alim 2nd Year',
  existingQuestions,
  onSave,
}) => {
  const [q14, setQ14] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q1_4)));
  const [q58, setQ58] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q5_8)));
  const [q912, setQ912] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q9_12)));
  const [q1316, setQ1316] = useState(() => JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q13_16)));

  useEffect(() => {
    if (!isOpen) return;
    const gid = HSC_ENG2_GROUP_IDS[section];
    const grp = existingQuestions.filter((q) => q.groupId === gid);

    if (section === 'q1_4_grammar') {
      if (grp.length === 0) {
        setQ14(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q1_4)));
      } else {
        const clozes = grp.filter((q) => q.groupRole === 'eng1_cloze');
        const pBox = grp.find((q) => q.groupRole === 'eng2_phrase_box_list');
        const qa = grp.find((q) => q.groupRole === 'eng1_qa_list');
        setQ14({
          includePartABanner: grp.some((q) => q.groupRole === 'eng1_part_banner'),
          q1Instruction: clozes[0]?.topic || DEFAULT_HSC_ENG2_Q1_4.q1Instruction,
          q1MarksText: clozes[0]?.customMarksText || '0.5×10=5',
          q1Text: clozes[0]?.stemOrPassage || '',
          q2Instruction: clozes[1]?.topic || DEFAULT_HSC_ENG2_Q1_4.q2Instruction,
          q2MarksText: clozes[1]?.customMarksText || '0.5×10=5',
          q2Text: clozes[1]?.stemOrPassage || '',
          q3Instruction: pBox?.topic || DEFAULT_HSC_ENG2_Q1_4.q3Instruction,
          q3MarksText: pBox?.customMarksText || '0.5×10=5',
          q3Clues: (pBox?.wordClues || []).join(', '),
          q3Items: pBox?.subQuestions?.map((s) => s.questionText) || DEFAULT_HSC_ENG2_Q1_4.q3Items,
          q4Instruction: qa?.stemOrPassage || DEFAULT_HSC_ENG2_Q1_4.q4Instruction,
          q4MarksText: qa?.customMarksText || '0.5×10=5',
          q4Items: qa?.subQuestions?.map((s) => s.questionText) || DEFAULT_HSC_ENG2_Q1_4.q4Items,
        });
      }
    } else if (section === 'q5_8_grammar') {
      if (grp.length === 0) {
        setQ58(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q5_8)));
      } else {
        const cQ = grp.find((q) => q.groupRole === 'eng1_cloze');
        const qaQ = grp.find((q) => q.groupRole === 'eng1_qa_list');
        const wItems = grp.filter((q) => q.groupRole === 'eng1_writing');
        setQ58({
          q5Instruction: cQ?.topic || DEFAULT_HSC_ENG2_Q5_8.q5Instruction,
          q5MarksText: cQ?.customMarksText || '0.5×10=5',
          q5Text: cQ?.stemOrPassage || '',
          q6Instruction: qaQ?.stemOrPassage || DEFAULT_HSC_ENG2_Q5_8.q6Instruction,
          q6MarksText: qaQ?.customMarksText || '1×5=5',
          q6Items: qaQ?.subQuestions?.map((s) => s.questionText) || DEFAULT_HSC_ENG2_Q5_8.q6Items,
          q7Instruction: wItems[0]?.topic || DEFAULT_HSC_ENG2_Q5_8.q7Instruction,
          q7MarksText: wItems[0]?.customMarksText || '5',
          q7Text: wItems[0]?.stemOrPassage || '',
          q8Instruction: wItems[1]?.topic || DEFAULT_HSC_ENG2_Q5_8.q8Instruction,
          q8MarksText: wItems[1]?.customMarksText || '1×5=5',
          q8Text: wItems[1]?.stemOrPassage || '',
        });
      }
    } else if (section === 'q9_12_grammar') {
      if (grp.length === 0) {
        setQ912(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q9_12)));
      } else {
        const clozes = grp.filter((q) => q.groupRole === 'eng1_cloze');
        const synQ = grp.find((q) => q.groupRole === 'eng2_synonym_antonym');
        const wQ = grp.find((q) => q.groupRole === 'eng1_writing');
        setQ912({
          q9Instruction: clozes[0]?.topic || DEFAULT_HSC_ENG2_Q9_12.q9Instruction,
          q9MarksText: clozes[0]?.customMarksText || '0.5×10=5',
          q9Text: clozes[0]?.stemOrPassage || '',
          q10Instruction: clozes[1]?.topic || DEFAULT_HSC_ENG2_Q9_12.q10Instruction,
          q10MarksText: clozes[1]?.customMarksText || '0.5×10=5',
          q10Text: clozes[1]?.stemOrPassage || '',
          q11Instruction: synQ?.topic || DEFAULT_HSC_ENG2_Q9_12.q11Instruction,
          q11MarksText: synQ?.customMarksText || '0.5×10=5',
          q11Passage: synQ?.stemOrPassage || '',
          q11Items: synQ?.subQuestions?.map((s) => s.questionText) || DEFAULT_HSC_ENG2_Q9_12.q11Items,
          q12Instruction: wQ?.topic || DEFAULT_HSC_ENG2_Q9_12.q12Instruction,
          q12MarksText: wQ?.customMarksText || '0.5×10=5',
          q12Text: wQ?.stemOrPassage || '',
        });
      }
    } else if (section === 'q13_16_comp') {
      const wItems = grp.filter((q) => q.groupRole === 'eng1_writing');
      if (wItems.length === 0) {
        setQ1316(JSON.parse(JSON.stringify(DEFAULT_HSC_ENG2_Q13_16)));
      } else {
        setQ1316({
          includePartBBanner: grp.some((q) => q.groupRole === 'eng1_part_banner'),
          q13Instruction: wItems[0]?.topic || DEFAULT_HSC_ENG2_Q13_16.q13Instruction,
          q13Marks: wItems[0]?.marks || 8,
          q14Instruction: wItems[1]?.topic || DEFAULT_HSC_ENG2_Q13_16.q14Instruction,
          q14Marks: wItems[1]?.marks || 8,
          q15Instruction: wItems[2]?.topic || DEFAULT_HSC_ENG2_Q13_16.q15Instruction,
          q15Marks: wItems[2]?.marks || 10,
          q16Instruction: wItems[3]?.topic || DEFAULT_HSC_ENG2_Q13_16.q16Instruction,
          q16Marks: wItems[3]?.marks || 14,
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
    const gid = HSC_ENG2_GROUP_IDS[section];
    const baseMeta = {
      subject: 'ENGLISH SECOND PAPER',
      grade,
      difficulty: 'Medium' as const,
      languages: ['en' as const],
      sourceType: 'MANUAL' as const,
      groupId: gid,
    };
    const out: QuestionData[] = [];

    if (section === 'q1_4_grammar') {
      if (q14.includePartABanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_a`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part A—Grammar\nMarks—60',
          customMarksText: 'Marks',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      out.push({
        ...baseMeta,
        _id: `${gid}_q1`,
        typology: 'FILL_BLANKS',
        customNumber: '1.',
        topic: q14.q1Instruction,
        stemOrPassage: q14.q1Text.trim(),
        customMarksText: q14.q1MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q2`,
        typology: 'FILL_BLANKS',
        customNumber: '2.',
        topic: q14.q2Instruction,
        stemOrPassage: q14.q2Text.trim(),
        customMarksText: q14.q2MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q3`,
        typology: 'FILL_BLANKS',
        customNumber: '3.',
        topic: q14.q3Instruction,
        stemOrPassage: '',
        hasClues: true,
        wordClues: parseClues(q14.q3Clues),
        customMarksText: q14.q3MarksText,
        marks: 5,
        groupRole: 'eng2_phrase_box_list',
        subQuestions: q14.q3Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 0.5,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q4`,
        typology: 'CQ',
        customNumber: '4.',
        stemOrPassage: q14.q4Instruction,
        customMarksText: q14.q4MarksText,
        marks: 5,
        groupRole: 'eng1_qa_list',
        subQuestions: q14.q4Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 0.5,
        })),
      });
    } else if (section === 'q5_8_grammar') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q5`,
        typology: 'FILL_BLANKS',
        customNumber: '5.',
        topic: q58.q5Instruction,
        stemOrPassage: q58.q5Text.trim(),
        customMarksText: q58.q5MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q6`,
        typology: 'CQ',
        customNumber: '6.',
        stemOrPassage: q58.q6Instruction,
        customMarksText: q58.q6MarksText,
        marks: 5,
        groupRole: 'eng1_qa_list',
        subQuestions: q58.q6Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 1,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q7`,
        typology: 'DESCRIPTIVE',
        customNumber: '7.',
        topic: q58.q7Instruction,
        stemOrPassage: q58.q7Text.trim(),
        customMarksText: q58.q7MarksText,
        marks: 5,
        groupRole: 'eng1_writing',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q8`,
        typology: 'DESCRIPTIVE',
        customNumber: '8.',
        topic: q58.q8Instruction,
        stemOrPassage: q58.q8Text.trim(),
        customMarksText: q58.q8MarksText,
        marks: 5,
        groupRole: 'eng1_writing',
      });
    } else if (section === 'q9_12_grammar') {
      out.push({
        ...baseMeta,
        _id: `${gid}_q9`,
        typology: 'FILL_BLANKS',
        customNumber: '9.',
        topic: q912.q9Instruction,
        stemOrPassage: q912.q9Text.trim(),
        customMarksText: q912.q9MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q10`,
        typology: 'FILL_BLANKS',
        customNumber: '10.',
        topic: q912.q10Instruction,
        stemOrPassage: q912.q10Text.trim(),
        customMarksText: q912.q10MarksText,
        marks: 5,
        groupRole: 'eng1_cloze',
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q11`,
        typology: 'CQ',
        customNumber: '11.',
        topic: q912.q11Instruction,
        stemOrPassage: q912.q11Passage.trim(),
        customMarksText: q912.q11MarksText,
        marks: 5,
        groupRole: 'eng2_synonym_antonym',
        subQuestions: q912.q11Items.map((text: string, idx: number) => ({
          part: (ALPHA[idx] || 'a') as any,
          bloomLevel: 'knowledge',
          bloomTitle: '',
          questionText: text.trim(),
          marks: 0.5,
        })),
      });
      out.push({
        ...baseMeta,
        _id: `${gid}_q12`,
        typology: 'DESCRIPTIVE',
        customNumber: '12.',
        topic: q912.q12Instruction,
        stemOrPassage: q912.q12Text.trim(),
        customMarksText: q912.q12MarksText,
        marks: 5,
        groupRole: 'eng1_writing',
      });
    } else if (section === 'q13_16_comp') {
      if (q1316.includePartBBanner) {
        out.push({
          ...baseMeta,
          _id: `${gid}_banner_b`,
          typology: 'SECTION_TITLE',
          stemOrPassage: 'Part B—Composition\nMarks—40',
          marks: 0,
          groupRole: 'eng1_part_banner',
        });
      }
      [
        { id: 'q13', num: '13.', ins: q1316.q13Instruction, m: q1316.q13Marks },
        { id: 'q14', num: '14.', ins: q1316.q14Instruction, m: q1316.q14Marks },
        { id: 'q15', num: '15.', ins: q1316.q15Instruction, m: q1316.q15Marks },
        { id: 'q16', num: '16.', ins: q1316.q16Instruction, m: q1316.q16Marks },
      ].forEach((item) => {
        out.push({
          ...baseMeta,
          _id: `${gid}_${item.id}`,
          typology: 'DESCRIPTIVE',
          customNumber: item.num,
          topic: item.ins,
          stemOrPassage: '',
          customMarksText: String(item.m),
          marks: item.m,
          groupRole: 'eng1_writing',
        });
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
          {section === 'q1_4_grammar' && (
            <>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q14.includePartABanner}
                  onChange={(e) => setQ14((p: any) => ({ ...p, includePartABanner: e.target.checked }))}
                />
                Include &quot;Part A—Grammar (Marks—60)&quot; banner above Q. 1
              </label>

              {/* Q.1 Articles & Q.2 Prepositions */}
              {[
                { label: '1. Articles', insKey: 'q1Instruction', mKey: 'q1MarksText', tKey: 'q1Text' },
                { label: '2. Prepositions', insKey: 'q2Instruction', mKey: 'q2MarksText', tKey: 'q2Text' },
              ].map((blk) => (
                <div key={blk.label} className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-indigo-900">{blk.label}</span>
                    <input
                      type="text"
                      value={(q14 as any)[blk.mKey]}
                      onChange={(e) => setQ14((p: any) => ({ ...p, [blk.mKey]: e.target.value }))}
                      className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                    />
                  </div>
                  <input
                    type="text"
                    value={(q14 as any)[blk.insKey]}
                    onChange={(e) => setQ14((p: any) => ({ ...p, [blk.insKey]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                  />
                  <textarea
                    rows={4}
                    value={(q14 as any)[blk.tKey]}
                    onChange={(e) => setQ14((p: any) => ({ ...p, [blk.tKey]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>
              ))}

              {/* Q.3 Phrase Box + 10 Sentences */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">
                    3. Special Phrases / Words Box + 10 Sentences
                  </span>
                  <input
                    type="text"
                    value={q14.q3MarksText}
                    onChange={(e) => setQ14((p: any) => ({ ...p, q3MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <input
                  type="text"
                  value={q14.q3Clues}
                  onChange={(e) => setQ14((p: any) => ({ ...p, q3Clues: e.target.value }))}
                  placeholder="10 phrases/words, comma-separated"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                {q14.q3Items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setQ14((p: any) => ({
                          ...p,
                          q3Items: p.q3Items.map((v: string, i: number) =>
                            i === idx ? e.target.value : v
                          ),
                        }))
                      }
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Q.4 Completing Sentences */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">
                    4. Completing Sentences (Conditionals / Phrases / Clauses)
                  </span>
                  <input
                    type="text"
                    value={q14.q4MarksText}
                    onChange={(e) => setQ14((p: any) => ({ ...p, q4MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                {q14.q4Items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setQ14((p: any) => ({
                          ...p,
                          q4Items: p.q4Items.map((v: string, i: number) =>
                            i === idx ? e.target.value : v
                          ),
                        }))
                      }
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'q5_8_grammar' && (
            <div className="space-y-3">
              {/* Q.5 Right Form of Verbs */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">5. Right Form of Verbs</span>
                  <input
                    type="text"
                    value={q58.q5MarksText}
                    onChange={(e) => setQ58((p: any) => ({ ...p, q5MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <textarea
                  rows={4}
                  value={q58.q5Text}
                  onChange={(e) => setQ58((p: any) => ({ ...p, q5Text: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>

              {/* Q.6 Changing Sentences */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">6. Changing Sentences (1×5=5)</span>
                  <input
                    type="text"
                    value={q58.q6MarksText}
                    onChange={(e) => setQ58((p: any) => ({ ...p, q6MarksText: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                {q58.q6Items.map((sent: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-800 w-6">({ALPHA[idx]})</span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) =>
                        setQ58((p: any) => ({
                          ...p,
                          q6Items: p.q6Items.map((v: string, i: number) =>
                            i === idx ? e.target.value : v
                          ),
                        }))
                      }
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Q.7 Reported Speech & Q.8 Pronoun Reference */}
              {[
                { label: '7. Reported Speech / Narration', insKey: 'q7Instruction', mKey: 'q7MarksText', tKey: 'q7Text' },
                { label: '8. Unclear Pronoun References', insKey: 'q8Instruction', mKey: 'q8MarksText', tKey: 'q8Text' },
              ].map((blk) => (
                <div key={blk.label} className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-indigo-900">{blk.label}</span>
                    <input
                      type="text"
                      value={(q58 as any)[blk.mKey]}
                      onChange={(e) => setQ58((p: any) => ({ ...p, [blk.mKey]: e.target.value }))}
                      className="w-20 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                    />
                  </div>
                  <input
                    type="text"
                    value={(q58 as any)[blk.insKey]}
                    onChange={(e) => setQ58((p: any) => ({ ...p, [blk.insKey]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                  />
                  <textarea
                    rows={4}
                    value={(q58 as any)[blk.tKey]}
                    onChange={(e) => setQ58((p: any) => ({ ...p, [blk.tKey]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}

          {section === 'q9_12_grammar' && (
            <div className="space-y-3">
              {/* Q.9 Modifiers & Q.10 Connectors */}
              {[
                { label: '9. Modifiers', insKey: 'q9Instruction', mKey: 'q9MarksText', tKey: 'q9Text' },
                { label: '10. Sentence Connectors', insKey: 'q10Instruction', mKey: 'q10MarksText', tKey: 'q10Text' },
              ].map((blk) => (
                <div key={blk.label} className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-indigo-900">{blk.label}</span>
                    <input
                      type="text"
                      value={(q912 as any)[blk.mKey]}
                      onChange={(e) => setQ912((p: any) => ({ ...p, [blk.mKey]: e.target.value }))}
                      className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                    />
                  </div>
                  <textarea
                    rows={4}
                    value={(q912 as any)[blk.tKey]}
                    onChange={(e) => setQ912((p: any) => ({ ...p, [blk.tKey]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>
              ))}

              {/* Q.11 Synonym & Antonym */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">
                    11. Synonym & Antonym (use &lt;u&gt;word&lt;/u&gt; to underline)
                  </span>
                  <input
                    type="text"
                    value={q912.q11MarksText}
                    onChange={(e) => setQ912((p: any) => ({ ...p, q11MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <textarea
                  rows={3}
                  value={q912.q11Passage}
                  onChange={(e) => setQ912((p: any) => ({ ...p, q11Passage: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {q912.q11Items.map((it: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-indigo-800 w-6">({ALPHA[idx]})</span>
                      <input
                        type="text"
                        value={it}
                        onChange={(e) =>
                          setQ912((p: any) => ({
                            ...p,
                            q11Items: p.q11Items.map((v: string, i: number) =>
                              i === idx ? e.target.value : v
                            ),
                          }))
                        }
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Q.12 Punctuation */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">
                    12. Punctuation & Capitalization
                  </span>
                  <input
                    type="text"
                    value={q912.q12MarksText}
                    onChange={(e) => setQ912((p: any) => ({ ...p, q12MarksText: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
                <textarea
                  rows={3}
                  value={q912.q12Text}
                  onChange={(e) => setQ912((p: any) => ({ ...p, q12Text: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>
            </div>
          )}

          {section === 'q13_16_comp' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={q1316.includePartBBanner}
                  onChange={(e) =>
                    setQ1316((p: any) => ({ ...p, includePartBBanner: e.target.checked }))
                  }
                />
                Include &quot;Part B—Composition (Marks—40)&quot; banner above Q. 13
              </label>

              {[
                { label: '13. Formal Application / Letter', insKey: 'q13Instruction', mKey: 'q13Marks' },
                { label: '14. Report Writing', insKey: 'q14Instruction', mKey: 'q14Marks' },
                { label: '15. Paragraph Writing', insKey: 'q15Instruction', mKey: 'q15Marks' },
                { label: '16. Short Composition', insKey: 'q16Instruction', mKey: 'q16Marks' },
              ].map((blk) => (
                <div key={blk.label} className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-emerald-900">{blk.label}</span>
                    <input
                      type="number"
                      min={1}
                      value={(q1316 as any)[blk.mKey]}
                      onChange={(e) =>
                        setQ1316((p: any) => ({ ...p, [blk.mKey]: Number(e.target.value) || 8 }))
                      }
                      className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded text-center bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={(q1316 as any)[blk.insKey]}
                    onChange={(e) => setQ1316((p: any) => ({ ...p, [blk.insKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
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
