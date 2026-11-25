'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  AlimQuranGroupAItem,
  AlimQuranState,
  DEFAULT_ALIM_QURAN_STATE,
} from './quranTajweedDefaults';

const toArabicDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const parseArNumber = (str?: string): number | null => {
  if (!str) return null;
  const eng = str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^0-9]/g, '');
  const n = parseInt(eng, 10);
  return isNaN(n) ? null : n;
};

export const ALIM_QURAN_GROUP_ID = 'alim_quran_group';

export function extractAlimQuranGroups(existingQuestions: QuestionData[]): AlimQuranState {
  const relevant = existingQuestions.filter(
    (q) =>
      q.groupId === ALIM_QURAN_GROUP_ID ||
      q.groupRole === 'alim_quran_banner' ||
      q.groupRole === 'alim_quran_group_a_item' ||
      q.groupRole === 'alim_quran_group_b_item'
  );

  if (relevant.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_ALIM_QURAN_STATE));
  }

  const state: AlimQuranState = JSON.parse(JSON.stringify(DEFAULT_ALIM_QURAN_STATE));
  const groupAItems: AlimQuranGroupAItem[] = [];
  const groupBItems: { id: string; text: string; placeholder: string; marks: number }[] = [];

  for (const q of relevant) {
    const qId = q._id || '';
    if (q.groupRole === 'alim_quran_banner') {
      const lines = (q.stemOrPassage || '').split('\n');
      const titleLine = lines[0] || '';
      const marksLine = lines[1] || '';
      const instructionLine = lines[2] || '';
      if (qId.includes('_b') || titleLine.includes('ب')) {
        state.groupBTitle = titleLine || state.groupBTitle;
        state.groupBMarksLine = marksLine || state.groupBMarksLine;
      } else {
        state.groupATitle = titleLine || state.groupATitle;
        state.groupAMarksLine = marksLine || state.groupAMarksLine;
        state.groupAInstruction = instructionLine || state.groupAInstruction;
      }
    } else if (q.groupRole === 'alim_quran_group_a_item') {
      const subA = q.subQuestions?.[0];
      const subB = q.subQuestions?.[1];
      groupAItems.push({
        id: qId || `aq_a_${groupAItems.length + 1}`,
        ayatText: q.stemOrPassage ?? '',
        ayatPlaceholder: 'اكتب الآيات الكريمة هنا...',
        ayatMarks: parseArNumber(q.customMarksText) ?? 9,
        subAText: subA?.questionText ?? '',
        subAPlaceholder: 'بين سبب نزول هذه الآيات الكريمة-',
        subAMarks: subA?.marks || 3,
        subBText: subB?.questionText ?? '',
        subBPlaceholder: 'حقق الكلمات : ...',
        subBMarks: subB?.marks || 3,
      });
    } else if (q.groupRole === 'alim_quran_group_b_item') {
      groupBItems.push({
        id: qId || `aq_b_${groupBItems.length + 1}`,
        text: q.stemOrPassage || '',
        placeholder: 'بين سبب نزول سورة ... مع ذكر وجه تسميتها-',
        marks: q.marks || 10,
      });
    }
  }

  if (groupAItems.length > 0) state.groupAItems = groupAItems;
  if (groupBItems.length > 0) state.groupBItems = groupBItems;

  return state;
}

interface AlimQuranBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[]) => void;
}

export const AlimQuranBuilderModal: React.FC<AlimQuranBuilderModalProps> = ({
  isOpen,
  onClose,
  existingQuestions,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
  const [state, setState] = useState<AlimQuranState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_ALIM_QURAN_STATE))
  );

  useEffect(() => {
    if (isOpen) {
      setState(extractAlimQuranGroups(existingQuestions));
      setActiveTab('A');
    }
  }, [isOpen, existingQuestions]);

  if (!isOpen) return null;

  const updateGroupAItem = (idx: number, patch: Partial<AlimQuranGroupAItem>) => {
    setState((prev) => ({
      ...prev,
      groupAItems: prev.groupAItems.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const handleSave = () => {
    const out: QuestionData[] = [];
    let qNum = 1;
    const baseMeta = {
      subject: 'القرآن المجيد',
      grade: 'الصف الثاني من العالم',
      educationStream: 'ALIA' as const,
      difficulty: 'Medium' as const,
      languages: ['ar'] as ('ar')[],
      sourceType: 'MANUAL' as const,
    };

    // Group A Banner
    out.push({
      ...baseMeta,
      _id: `${ALIM_QURAN_GROUP_ID}_banner_a`,
      typology: 'SECTION_TITLE',
      stemOrPassage: [state.groupATitle, state.groupAMarksLine, state.groupAInstruction]
        .filter(Boolean)
        .join('\n'),
      marks: 0,
      customMarksText: 'الدرجات',
      groupId: ALIM_QURAN_GROUP_ID,
      groupRole: 'alim_quran_banner',
    });

    // Group A Questions (1–8)
    state.groupAItems.forEach((item) => {
      const ayatMarks = item.ayatMarks || 9;
      const subAMarks = item.subAMarks || 3;
      const subBMarks = item.subBMarks || 3;
      out.push({
        ...baseMeta,
        _id: item.id,
        typology: 'CQ',
        customNumber: `${toArabicDigits(qNum)}-`,
        stemOrPassage: item.ayatText.trim(),
        marks: ayatMarks + subAMarks + subBMarks,
        customMarksText: toArabicDigits(ayatMarks),
        groupId: ALIM_QURAN_GROUP_ID,
        groupRole: 'alim_quran_group_a_item',
        subQuestions: [
          {
            part: 'أ' as any,
            bloomLevel: 'comprehension',
            bloomTitle: '',
            questionText: item.subAText.trim(),
            marks: subAMarks,
          },
          {
            part: 'ب' as any,
            bloomLevel: 'knowledge',
            bloomTitle: '',
            questionText: item.subBText.trim(),
            marks: subBMarks,
          },
        ],
      });
      qNum++;
    });

    // Group B Banner
    out.push({
      ...baseMeta,
      _id: `${ALIM_QURAN_GROUP_ID}_banner_b`,
      typology: 'SECTION_TITLE',
      stemOrPassage: [state.groupBTitle, state.groupBMarksLine].filter(Boolean).join('\n'),
      marks: 0,
      groupId: ALIM_QURAN_GROUP_ID,
      groupRole: 'alim_quran_banner',
    });

    // Group B Questions (9–10)
    state.groupBItems.forEach((item) => {
      const m = item.marks || 10;
      out.push({
        ...baseMeta,
        _id: item.id,
        typology: 'DESCRIPTIVE',
        customNumber: `${toArabicDigits(qNum)}-`,
        stemOrPassage: item.text.trim(),
        marks: m,
        customMarksText: toArabicDigits(m),
        groupId: ALIM_QURAN_GROUP_ID,
        groupRole: 'alim_quran_group_b_item',
      });
      qNum++;
    });

    onSave(out);
    onClose();
  };

  const groupBStartNum = state.groupAItems.length + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-900 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                القرآن المجيد — আলিম আল কুরআন মাজিদ (কোড: ২০১, পূর্ণমান: ১০০)
              </h2>
              <p className="text-[11px] text-emerald-100">
                সম্পূর্ণ আরবি (RTL) · مجموعة ( أ ) [৯০ নম্বর] + مجموعة ( ب ) [১০ নম্বর]
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

        {/* Tabs */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('A')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition ${
              activeTab === 'A'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            مجموعة ( أ ) — ৯০ নম্বর (১–{state.groupAItems.length} নং)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('B')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition ${
              activeTab === 'B'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            مجموعة ( ب ) — ১০ নম্বর ({groupBStartNum}–{groupBStartNum + state.groupBItems.length - 1} নং)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'A' && (
            <>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    শিরোনাম (আরবি)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={state.groupATitle}
                    onChange={(e) => setState((p) => ({ ...p, groupATitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-ar font-bold border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    মোট নম্বর লাইন
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={state.groupAMarksLine}
                    onChange={(e) => setState((p) => ({ ...p, groupAMarksLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    নির্দেশনা
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={state.groupAInstruction}
                    onChange={(e) => setState((p) => ({ ...p, groupAInstruction: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
              </div>

              <div className="space-y-3.5">
                {state.groupAItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full font-ar">
                        السؤال {toArabicDigits(idx + 1)}- (الدرجة: {toArabicDigits(item.ayatMarks + item.subAMarks + item.subBMarks)})
                      </span>
                      {state.groupAItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setState((p) => ({
                              ...p,
                              groupAItems: p.groupAItems.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-rose-600 hover:bg-rose-50 p-1 rounded-md text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> মুছুন
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          الآيات الكريمة (অনুবাদের জন্য আরবি আয়াতসমূহ)
                        </label>
                        <span className="text-[11px] font-bold text-slate-500">
                          নম্বর: {toArabicDigits(item.ayatMarks)}
                        </span>
                      </div>
                      <textarea
                        dir="rtl"
                        rows={3}
                        value={item.ayatText}
                        onChange={(e) => updateGroupAItem(idx, { ayatText: e.target.value })}
                        placeholder={item.ayatPlaceholder}
                        className="w-full px-3 py-2 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          ( أ ) প্রশ্ন — নম্বর: {toArabicDigits(item.subAMarks)}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.subAText}
                          onChange={(e) => updateGroupAItem(idx, { subAText: e.target.value })}
                          placeholder={item.subAPlaceholder}
                          className="w-full px-3 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          ( ب ) তাহকিক — নম্বর: {toArabicDigits(item.subBMarks)}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.subBText}
                          onChange={(e) => updateGroupAItem(idx, { subBText: e.target.value })}
                          placeholder={item.subBPlaceholder}
                          className="w-full px-3 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setState((p) => ({
                    ...p,
                    groupAItems: [
                      ...p.groupAItems,
                      {
                        id: `aq_a_${Date.now()}`,
                        ayatText: '',
                        ayatPlaceholder: 'اكتب الآيات الكريمة هنا...',
                        ayatMarks: 9,
                        subAText: '',
                        subAPlaceholder: 'بين سبب نزول هذه الآيات الكريمة-',
                        subAMarks: 3,
                        subBText: '',
                        subBPlaceholder: 'حقق الكلمات : ...',
                        subBMarks: 3,
                      },
                    ],
                  }))
                }
                className="w-full py-2 border-2 border-dashed border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> নতুন আয়াত প্রশ্ন যোগ করুন
              </button>
            </>
          )}

          {activeTab === 'B' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    শিরোনাম (আরবি)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={state.groupBTitle}
                    onChange={(e) => setState((p) => ({ ...p, groupBTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-ar font-bold border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    মোট নম্বর লাইন
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={state.groupBMarksLine}
                    onChange={(e) => setState((p) => ({ ...p, groupBMarksLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {state.groupBItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <span className="text-sm font-ar font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                      {toArabicDigits(groupBStartNum + idx)}-
                    </span>
                    <textarea
                      dir="rtl"
                      rows={2}
                      value={item.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          groupBItems: p.groupBItems.map((q, i) =>
                            i === idx ? { ...q, text: e.target.value } : q
                          ),
                        }))
                      }
                      placeholder={item.placeholder}
                      className="flex-1 px-3 py-1.5 text-base font-ar border border-slate-300 rounded-lg bg-white text-right"
                    />
                    {state.groupBItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            groupBItems: p.groupBItems.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setState((p) => ({
                    ...p,
                    groupBItems: [
                      ...p.groupBItems,
                      {
                        id: `aq_b_${Date.now()}`,
                        text: '',
                        placeholder: 'بين سبب نزول سورة ... مع ذكر وجه تسميتها-',
                        marks: 10,
                      },
                    ],
                  }))
                }
                className="px-3.5 py-2 border border-dashed border-emerald-400 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> নতুন প্রশ্ন যোগ করুন
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div>
            {activeTab === 'A' ? (
              <button
                type="button"
                onClick={() => setActiveTab('B')}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100"
              >
                পরবর্তী: مجموعة ( ب ) →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('A')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                ← مجموعة ( أ )
              </button>
            )}
          </div>
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
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> প্রশ্নপত্রে যুক্ত করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
