'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X, Underline } from 'lucide-react';
import {
  DakhilJuniorQuranState,
  DEFAULT_DAKHIL_JUNIOR_QURAN,
} from './quranTajweedDefaults';

const toBanglaDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const BN_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];

const parseBnNumber = (str?: string): number | null => {
  if (!str) return null;
  const eng = str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[^0-9]/g, '');
  const n = parseInt(eng, 10);
  return isNaN(n) ? null : n;
};

export const DAKHIL_JUNIOR_QURAN_GROUP_ID = 'dakhil_junior_quran_group';
export const DAKHIL_JUNIOR_QURAN_PART1_GROUP_ID = 'dakhil_junior_quran_part1_group';
export const DAKHIL_JUNIOR_QURAN_PART2_GROUP_ID = 'dakhil_junior_quran_part2_group';
export const DAKHIL_JUNIOR_QURAN_ORAL_GROUP_ID = 'dakhil_junior_quran_oral_group';
export type DakhilJuniorQuranSection = 'part1' | 'part2' | 'oral';

export function extractDakhilJuniorQuranGroups(
  existingQuestions: QuestionData[]
): DakhilJuniorQuranState {
  const relevant = existingQuestions.filter(
    (q) =>
      q.groupId === DAKHIL_JUNIOR_QURAN_GROUP_ID ||
      q.groupRole?.startsWith('junior_quran_')
  );

  if (relevant.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_DAKHIL_JUNIOR_QURAN));
  }

  const state: DakhilJuniorQuranState = JSON.parse(JSON.stringify(DEFAULT_DAKHIL_JUNIOR_QURAN));

  for (const q of relevant) {
    const id = q._id || '';
    if (q.groupRole === 'junior_quran_banner') {
      if (id.includes('_oral') || (q.stemOrPassage || '').includes('মৌখিক')) {
        state.oralBanner = q.stemOrPassage || state.oralBanner;
      } else {
        state.writtenBanner = q.stemOrPassage || state.writtenBanner;
      }
    } else if (id.includes('_q2') || q.groupRole === 'junior_quran_ayat_list') {
      const parsed = parseBnNumber(q.customNumber);
      if (parsed !== null) state.startNumber = parsed;
      state.q2Title = q.stemOrPassage || state.q2Title;
      state.q2MarksText = q.customMarksText || state.q2MarksText;
      state.q2Marks = q.marks || state.q2Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q2Ayats = q.subQuestions.map((s, idx) => ({
          id: `jq_2_${idx}`,
          text: s.questionText || '',
          placeholder: 'আরবি আয়াত লিখুন...',
        }));
      }
    } else if (id.includes('_q3')) {
      state.q3Title = q.stemOrPassage || state.q3Title;
      state.q3MarksText = q.customMarksText || state.q3MarksText;
      state.q3Marks = q.marks || state.q3Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q3Items = q.subQuestions.map((s, idx) => ({
          id: `jq_3_${idx}`,
          text: s.questionText || '',
          placeholder: 'বর্ণনামূলক প্রশ্ন লিখুন...',
        }));
      }
    } else if (id.includes('_q4')) {
      state.q4Title = q.stemOrPassage || state.q4Title;
      state.q4MarksText = q.customMarksText || state.q4MarksText;
      state.q4Marks = q.marks || state.q4Marks;
      state.q4Words = q.subQuestions?.[0]?.questionText ?? '';
    } else if (id.includes('_q5')) {
      state.q5Title = q.stemOrPassage || state.q5Title;
      state.q5MarksText = q.customMarksText || state.q5MarksText;
      state.q5Marks = q.marks || state.q5Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q5Items = q.subQuestions.map((s, idx) => ({
          id: `jq_5_${idx}`,
          text: s.questionText || '',
          placeholder: 'তারকিবের আরবি বাক্য লিখুন...',
        }));
      }
    } else if (id.includes('_q6')) {
      state.q6Title = q.stemOrPassage || state.q6Title;
      state.q6MarksText = q.customMarksText || state.q6MarksText;
      state.q6Marks = q.marks || state.q6Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q6Items = q.subQuestions.map((s, idx) => ({
          id: `jq_6_${idx}`,
          text: s.questionText || '',
          placeholder: 'সূরা/আয়াত মুখস্থ প্রশ্ন লিখুন...',
        }));
      }
    } else if (id.includes('_q7')) {
      state.q7Title = q.stemOrPassage || state.q7Title;
      state.q7MarksText = q.customMarksText || state.q7MarksText;
      state.q7Marks = q.marks || state.q7Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q7Items = q.subQuestions.map((s, idx) => ({
          id: `jq_7_${idx}`,
          text: s.questionText || '',
          placeholder: 'তাজভিদ সম্পর্কিত প্রশ্ন লিখুন...',
        }));
      }
    } else if (id.includes('_q8')) {
      state.q8Title = q.stemOrPassage || state.q8Title;
      state.q8MarksText = q.customMarksText || state.q8MarksText;
      state.q8Marks = q.marks || state.q8Marks;
      state.q8Text = q.subQuestions?.[0]?.questionText ?? '';
    } else if (id.includes('_q9')) {
      state.q9Title = q.stemOrPassage || state.q9Title;
      state.q9MarksText = q.customMarksText || state.q9MarksText;
      state.q9Marks = q.marks || state.q9Marks;
      state.q9Ayat = q.subQuestions?.[0]?.questionText ?? '';
    } else if (id.includes('_q10')) {
      state.q10Title = q.stemOrPassage || state.q10Title;
      state.q10MarksText = q.customMarksText || state.q10MarksText;
      state.q10Marks = q.marks || state.q10Marks;
      state.q10Text = q.subQuestions?.[0]?.questionText ?? '';
    } else if (id.includes('_q11')) {
      state.q11Title = q.stemOrPassage || state.q11Title;
      state.q11MarksText = q.customMarksText || state.q11MarksText;
      state.q11Marks = q.marks || state.q11Marks;
      if (q.subQuestions && q.subQuestions.length > 0) {
        state.q11Items = q.subQuestions.map((s, idx) => ({
          id: `jq_11_${idx}`,
          text: s.questionText || '',
          placeholder: 'সূরার নাম লিখুন...',
        }));
      }
    }
  }

  return state;
}

interface DakhilJuniorQuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DakhilJuniorQuranSection;
  existingQuestions: QuestionData[];
  grade?: string;
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

export const DakhilJuniorQuranModal: React.FC<DakhilJuniorQuranModalProps> = ({
  isOpen,
  onClose,
  section,
  existingQuestions,
  grade = 'দাখিল অষ্টম শ্রেণি',
  onSave,
}) => {
  const [state, setState] = useState<DakhilJuniorQuranState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_DAKHIL_JUNIOR_QURAN))
  );
  const q8Ref = useRef<HTMLTextAreaElement | null>(null);
  const q10Ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setState(extractDakhilJuniorQuranGroups(existingQuestions));
    }
  }, [isOpen, existingQuestions, section]);

  if (!isOpen) return null;

  const wrapSelectionUnderline = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    field: 'q8Text' | 'q10Text'
  ) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const val = state[field];
    if (start === end) return;
    const selected = val.slice(start, end);
    const updated = `${val.slice(0, start)}<u>${selected}</u>${val.slice(end)}`;
    setState((p) => ({ ...p, [field]: updated }));
  };

  const handleSave = () => {
    const out: QuestionData[] = [];
    const targetGroupId =
      section === 'part1'
        ? DAKHIL_JUNIOR_QURAN_PART1_GROUP_ID
        : section === 'part2'
        ? DAKHIL_JUNIOR_QURAN_PART2_GROUP_ID
        : DAKHIL_JUNIOR_QURAN_ORAL_GROUP_ID;

    let n =
      section === 'part1'
        ? state.startNumber
        : section === 'part2'
        ? state.startNumber + 4
        : state.startNumber + 7;

    const baseMeta = {
      subject: 'কুরআন মাজিদ ও তাজভিদ',
      grade,
      educationStream: 'ALIA' as const,
      difficulty: 'Medium' as const,
      languages: ['bn', 'ar'] as ('bn' | 'ar')[],
      sourceType: 'MANUAL' as const,
      groupId: targetGroupId,
    };

    if (section === 'part1') {
      // Written Banner
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_banner_written`,
        typology: 'SECTION_TITLE',
        stemOrPassage: state.writtenBanner,
        marks: 0,
        groupRole: 'junior_quran_banner',
      });

      // Q2: আয়াতের অনুবাদ
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q2`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q2Title,
        customMarksText: state.q2MarksText,
        marks: state.q2Marks,
        groupRole: 'junior_quran_ayat_list',
        subQuestions: state.q2Ayats.map((item, idx) => ({
          part: (BN_LETTERS[idx] || 'ক') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: item.text.trim(),
          marks: 5,
        })),
      });

      // Q3: বর্ণনামূলক
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q3`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q3Title,
        customMarksText: state.q3MarksText,
        marks: state.q3Marks,
        groupRole: 'junior_quran_choice_list',
        subQuestions: state.q3Items.map((item, idx) => ({
          part: (BN_LETTERS[idx] || 'ক') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: item.text.trim(),
          marks: 5,
        })),
      });

      // Q4: তাহকিক কর
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q4`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q4Title,
        customMarksText: state.q4MarksText,
        marks: state.q4Marks,
        groupRole: 'junior_quran_arabic_block',
        subQuestions: [
          {
            part: 'ক',
            bloomLevel: 'knowledge',
            bloomTitle: 'inline',
            questionText: state.q4Words.trim(),
            marks: state.q4Marks,
          },
        ],
      });

      // Q5: তারকিব কর
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q5`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q5Title,
        customMarksText: state.q5MarksText,
        marks: state.q5Marks,
        groupRole: 'junior_quran_arabic_block',
        subQuestions: state.q5Items.map((item, idx) => ({
          part: (BN_LETTERS[idx] || 'ক') as any,
          bloomLevel: 'application',
          bloomTitle: 'labeled',
          questionText: item.text.trim(),
          marks: 5,
        })),
      });

      onSave(out, targetGroupId);
      onClose();
      return;
    }

    if (section === 'part2') {
      // Q6: হরকতসহ সূরা/আয়াত মুখস্থ লিখ
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q6`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q6Title,
        customMarksText: state.q6MarksText,
        marks: state.q6Marks,
        groupRole: 'junior_quran_choice_list',
        subQuestions: state.q6Items.map((item, idx) => ({
          part: (BN_LETTERS[idx] || 'ক') as any,
          bloomLevel: 'knowledge',
          bloomTitle: '',
          questionText: item.text.trim(),
          marks: 5,
        })),
      });

      // Q7: তাজভিদ বর্ণনামূলক
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q7`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q7Title,
        customMarksText: state.q7MarksText,
        marks: state.q7Marks,
        groupRole: 'junior_quran_choice_list',
        subQuestions: state.q7Items.map((item, idx) => ({
          part: (BN_LETTERS[idx] || 'ক') as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: item.text.trim(),
          marks: 5,
        })),
      });

      // Q8: নিচে দাগ দেওয়া তাজভিদের কায়দা
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q8`,
        typology: 'CQ',
        customNumber: `${toBanglaDigits(n++)}।`,
        stemOrPassage: state.q8Title,
        customMarksText: state.q8MarksText,
        marks: state.q8Marks,
        groupRole: 'junior_quran_arabic_block',
        subQuestions: [
          {
            part: 'ক',
            bloomLevel: 'knowledge',
            bloomTitle: 'underline_html',
            questionText: state.q8Text.trim(),
            marks: state.q8Marks,
          },
        ],
      });

      onSave(out, targetGroupId);
      onClose();
      return;
    }

    // Oral Banner
    out.push({
      ...baseMeta,
      _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_banner_oral`,
      typology: 'SECTION_TITLE',
      stemOrPassage: state.oralBanner,
      marks: 0,
      groupRole: 'junior_quran_banner',
    });

    // Q9: দেখে দেখে তিলাওয়াত কর
    out.push({
      ...baseMeta,
      _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q9`,
      typology: 'CQ',
      customNumber: `${toBanglaDigits(n++)}।`,
      stemOrPassage: state.q9Title,
      customMarksText: state.q9MarksText,
      marks: state.q9Marks,
      groupRole: 'junior_quran_arabic_block',
      subQuestions: [
        {
          part: 'ক',
          bloomLevel: 'knowledge',
          bloomTitle: 'inline',
          questionText: state.q9Ayat.trim(),
          marks: state.q9Marks,
        },
      ],
    });

    // Q10: তাজভিদের কায়দা বল
    out.push({
      ...baseMeta,
      _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q10`,
      typology: 'CQ',
      customNumber: `${toBanglaDigits(n++)}।`,
      stemOrPassage: state.q10Title,
      customMarksText: state.q10MarksText,
      marks: state.q10Marks,
      groupRole: 'junior_quran_arabic_block',
      subQuestions: [
        {
          part: 'ক',
          bloomLevel: 'knowledge',
          bloomTitle: 'underline_html',
          questionText: state.q10Text.trim(),
          marks: state.q10Marks,
        },
      ],
    });

    // Q11: সূরা মুখস্থ বলো (১টি)
    out.push({
      ...baseMeta,
      _id: `${DAKHIL_JUNIOR_QURAN_GROUP_ID}_q11`,
      typology: 'CQ',
      customNumber: `${toBanglaDigits(n++)}।`,
      stemOrPassage: state.q11Title,
      customMarksText: state.q11MarksText,
      marks: state.q11Marks,
      groupRole: 'junior_quran_choice_list',
      subQuestions: state.q11Items.map((item, idx) => ({
        part: (BN_LETTERS[idx] || 'ক') as any,
        bloomLevel: 'knowledge',
        bloomTitle: '',
        questionText: item.text.trim(),
        marks: 5,
      })),
    });

    onSave(out, targetGroupId);
    onClose();
  };

  const s = state.startNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                {section === 'part1'
                  ? `লিখিত অংশ (${toBanglaDigits(s)}–${toBanglaDigits(s + 3)} নং : ৪৫ নম্বর)`
                  : section === 'part2'
                  ? `লিখিত ও তাজভিদ (${toBanglaDigits(s + 4)}–${toBanglaDigits(s + 6)} নং : ২০ নম্বর)`
                  : `মৌখিক অংশ (${toBanglaDigits(s + 7)}–${toBanglaDigits(s + 9)} নং : ১৫ নম্বর)`}
              </h2>
              <p className="text-[11px] text-emerald-100">
                দাখিল ৬ষ্ঠ–৮ম শ্রেণি · কুরআন মাজিদ ও তাজভিদ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {section === 'part1' && (
            <>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    লিখিত অংশের ব্যানার
                  </label>
                  <input
                    type="text"
                    value={state.writtenBanner}
                    onChange={(e) => setState((p) => ({ ...p, writtenBanner: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    শুরুর প্রশ্ন নম্বর (MCQ থাকলে ২, শুধু লিখিত হলে ১)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={state.startNumber}
                    onChange={(e) =>
                      setState((p) => ({ ...p, startNumber: Math.max(1, Number(e.target.value) || 2) }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Q2: আয়াতের অনুবাদ */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s)}। {state.q2Title} ({state.q2MarksText})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        q2Ayats: [
                          ...p.q2Ayats,
                          { id: `jq_2_${Date.now()}`, text: '', placeholder: 'আরবি আয়াত লিখুন...' },
                        ],
                      }))
                    }
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> আয়াত যোগ
                  </button>
                </div>
                {state.q2Ayats.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-700 mt-2 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <textarea
                      dir="rtl"
                      rows={2}
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q2Ayats: p.q2Ayats.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-3 py-1.5 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right"
                    />
                    {state.q2Ayats.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            q2Ayats: p.q2Ayats.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Q3: বর্ণনামূলক */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s + 1)}। {state.q3Title} ({state.q3MarksText})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        q3Items: [
                          ...p.q3Items,
                          { id: `jq_3_${Date.now()}`, text: '', placeholder: 'বর্ণনামূলক প্রশ্ন লিখুন...' },
                        ],
                      }))
                    }
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> প্রশ্ন যোগ
                  </button>
                </div>
                {state.q3Items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q3Items: p.q3Items.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                    {state.q3Items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            q3Items: p.q3Items.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Q4: তাহকিক কর */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <label className="text-xs font-extrabold text-emerald-900 block">
                  {toBanglaDigits(s + 2)}। {state.q4Title} ({state.q4MarksText})
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={state.q4Words}
                  onChange={(e) => setState((p) => ({ ...p, q4Words: e.target.value }))}
                  placeholder={state.q4Placeholder}
                  className="w-full px-3 py-2 text-base font-ar border border-slate-300 rounded-lg bg-white text-right"
                />
              </div>

              {/* Q5: তারকিব কর */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s + 3)}। {state.q5Title} ({state.q5MarksText})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        q5Items: [
                          ...p.q5Items,
                          { id: `jq_5_${Date.now()}`, text: '', placeholder: 'আরবি বাক্য লিখুন...' },
                        ],
                      }))
                    }
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> বাক্য যোগ
                  </button>
                </div>
                {state.q5Items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <input
                      type="text"
                      dir="rtl"
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q5Items: p.q5Items.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-3 py-1.5 text-base font-ar border border-slate-300 rounded-lg bg-white text-right"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'part2' && (
            <>
              {/* Q6: সূরা মুখস্থ লিখ */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <span className="text-xs font-extrabold text-emerald-900 block">
                  {toBanglaDigits(s + 4)}। {state.q6Title} ({state.q6MarksText})
                </span>
                {state.q6Items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q6Items: p.q6Items.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Q7: তাজভিদ বর্ণনামূলক */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s + 5)}। {state.q7Title} ({state.q7MarksText})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        q7Items: [
                          ...p.q7Items,
                          { id: `jq_7_${Date.now()}`, text: '', placeholder: 'তাজভিদ প্রশ্ন লিখুন...' },
                        ],
                      }))
                    }
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> প্রশ্ন যোগ
                  </button>
                </div>
                {state.q7Items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q7Items: p.q7Items.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Q8: নিচে দাগ দেওয়া তাজভিদ কায়দা */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s + 6)}। {state.q8Title} ({state.q8MarksText})
                  </label>
                  <button
                    type="button"
                    onClick={() => wrapSelectionUnderline(q8Ref, 'q8Text')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                    title="আরবি অংশ সিলেক্ট করে এখানে ক্লিক করলে নিচে দাগ (underline) বসবে"
                  >
                    <Underline className="w-3.5 h-3.5" /> সিলেক্টেড অংশে দাগ দিন
                  </button>
                </div>
                <textarea
                  ref={q8Ref}
                  dir="rtl"
                  rows={3}
                  value={state.q8Text}
                  onChange={(e) => setState((p) => ({ ...p, q8Text: e.target.value }))}
                  placeholder={state.q8Placeholder}
                  className="w-full px-3 py-2 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right"
                />
              </div>
            </>
          )}

          {section === 'oral' && (
            <>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  মৌখিক অংশের ব্যানার
                </label>
                <input
                  type="text"
                  value={state.oralBanner}
                  onChange={(e) => setState((p) => ({ ...p, oralBanner: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* Q9: দেখে দেখে তিলাওয়াত কর */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <label className="text-xs font-extrabold text-emerald-900 block">
                  {toBanglaDigits(s + 7)}। {state.q9Title} (মান: {state.q9MarksText})
                </label>
                <textarea
                  dir="rtl"
                  rows={3}
                  value={state.q9Ayat}
                  onChange={(e) => setState((p) => ({ ...p, q9Ayat: e.target.value }))}
                  placeholder={state.q9Placeholder}
                  className="w-full px-3 py-2 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right"
                />
              </div>

              {/* Q10: তাজভিদের কায়দা বল */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-extrabold text-emerald-900">
                    {toBanglaDigits(s + 8)}। {state.q10Title} (মান: {state.q10MarksText})
                  </label>
                  <button
                    type="button"
                    onClick={() => wrapSelectionUnderline(q10Ref, 'q10Text')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                  >
                    <Underline className="w-3.5 h-3.5" /> সিলেক্টেড অংশে দাগ দিন
                  </button>
                </div>
                <textarea
                  ref={q10Ref}
                  dir="rtl"
                  rows={2}
                  value={state.q10Text}
                  onChange={(e) => setState((p) => ({ ...p, q10Text: e.target.value }))}
                  placeholder={state.q10Placeholder}
                  className="w-full px-3 py-2 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right"
                />
              </div>

              {/* Q11: সূরা মুখস্থ বলো */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <span className="text-xs font-extrabold text-emerald-900 block">
                  {toBanglaDigits(s + 9)}। {state.q11Title} (মান: {state.q11MarksText})
                </span>
                {state.q11Items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      ({BN_LETTERS[idx] || idx + 1})
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          q11Items: p.q11Items.map((a, i) =>
                            i === idx ? { ...a, text: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> প্রশ্নপত্রে যুক্ত করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
