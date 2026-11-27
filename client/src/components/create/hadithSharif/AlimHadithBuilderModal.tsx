'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  AlimHadithGroupAItem,
  AlimHadithGroupBItem,
  AlimHadithState,
  DEFAULT_ALIM_HADITH_STATE,
} from './hadithSharifDefaults';

const toArabicDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const parseArNumber = (str?: string): number | null => {
  if (!str) return null;
  const eng = str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^0-9]/g, '');
  const n = parseInt(eng, 10);
  return isNaN(n) ? null : n;
};

export const ALIM_HADITH_GROUP_ID = 'alim_hadith_group';
export const ALIM_HADITH_A_GROUP_ID = 'alim_hadith_a_group';
export const ALIM_HADITH_B_GROUP_ID = 'alim_hadith_b_group';
export type AlimHadithSection = 'A' | 'B';

export function extractAlimHadithGroups(existingQuestions: QuestionData[]): AlimHadithState {
  const relevant = existingQuestions.filter(
    (q) =>
      q.groupId === ALIM_HADITH_GROUP_ID ||
      q.groupId === ALIM_HADITH_A_GROUP_ID ||
      q.groupId === ALIM_HADITH_B_GROUP_ID ||
      q.groupRole === 'alim_hadith_banner' ||
      q.groupRole === 'alim_hadith_group_a_item' ||
      q.groupRole === 'alim_hadith_group_b_item'
  );

  if (relevant.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_ALIM_HADITH_STATE));
  }

  const state: AlimHadithState = JSON.parse(JSON.stringify(DEFAULT_ALIM_HADITH_STATE));
  const groupAItems: AlimHadithGroupAItem[] = [];
  const groupBItems: AlimHadithGroupBItem[] = [];

  for (const q of relevant) {
    const qId = q._id || '';
    if (q.groupRole === 'alim_hadith_banner') {
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
    } else if (q.groupRole === 'alim_hadith_group_a_item') {
      const subA = q.subQuestions?.[0];
      const subB = q.subQuestions?.[1];
      groupAItems.push({
        id: qId || `ah_a_${groupAItems.length + 1}`,
        hadithText: q.stemOrPassage ?? '',
        hadithPlaceholder: 'اكتب الحديث النبوي هنا...',
        hadithMarks: parseArNumber(q.customMarksText) ?? 10,
        subAText: subA?.questionText ?? '',
        subAPlaceholder: 'اشرح قوله عليه السلام ...',
        subAMarks: subA?.marks || 3,
        subBText: subB?.questionText ?? '',
        subBPlaceholder: 'حقق : ...',
        subBMarks: subB?.marks || 3,
      });
    } else if (q.groupRole === 'alim_hadith_group_b_item') {
      groupBItems.push({
        id: qId || `ah_b_${groupBItems.length + 1}`,
        text: q.stemOrPassage || '',
        placeholder: 'عرف السند لغة واصطلاحا...',
        marks: q.marks || 10,
      });
    }
  }

  if (groupAItems.length > 0) state.groupAItems = groupAItems;
  if (groupBItems.length > 0) state.groupBItems = groupBItems;

  return state;
}

interface AlimHadithBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AlimHadithSection;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

export const AlimHadithBuilderModal: React.FC<AlimHadithBuilderModalProps> = ({
  isOpen,
  onClose,
  section,
  existingQuestions,
  onSave,
}) => {
  const [state, setState] = useState<AlimHadithState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_ALIM_HADITH_STATE))
  );

  useEffect(() => {
    if (isOpen) {
      setState(extractAlimHadithGroups(existingQuestions));
    }
  }, [isOpen, existingQuestions, section]);

  if (!isOpen) return null;

  const updateGroupAItem = (idx: number, patch: Partial<AlimHadithGroupAItem>) => {
    setState((prev) => ({
      ...prev,
      groupAItems: prev.groupAItems.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const addGroupAItem = () => {
    setState((prev) => ({
      ...prev,
      groupAItems: [
        ...prev.groupAItems,
        {
          id: `ah_a_${Date.now()}`,
          hadithText: '',
          hadithPlaceholder: 'اكتب الحديث النبوي هنا...',
          hadithMarks: 10,
          subAText: '',
          subAPlaceholder: 'اشرح قوله عليه السلام ...',
          subAMarks: 3,
          subBText: '',
          subBPlaceholder: 'حقق : ...',
          subBMarks: 3,
        },
      ],
    }));
  };

  const removeGroupAItem = (idx: number) => {
    setState((prev) => ({
      ...prev,
      groupAItems: prev.groupAItems.filter((_, i) => i !== idx),
    }));
  };

  const updateGroupBItem = (idx: number, patch: Partial<AlimHadithGroupBItem>) => {
    setState((prev) => ({
      ...prev,
      groupBItems: prev.groupBItems.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const addGroupBItem = () => {
    setState((prev) => ({
      ...prev,
      groupBItems: [
        ...prev.groupBItems,
        {
          id: `ah_b_${Date.now()}`,
          text: '',
          placeholder: 'اكتب سؤال أصول الحديث هنا...',
          marks: 10,
        },
      ],
    }));
  };

  const removeGroupBItem = (idx: number) => {
    setState((prev) => ({
      ...prev,
      groupBItems: prev.groupBItems.filter((_, i) => i !== idx),
    }));
  };

  const existingACount = existingQuestions.filter(
    (q) => q.groupRole === 'alim_hadith_group_a_item'
  ).length;
  const groupBStartNum = (existingACount > 0 ? existingACount : state.groupAItems.length) + 1;

  const handleSave = () => {
    const out: QuestionData[] = [];
    const baseMeta = {
      subject: 'الحديث وأصول الحديث',
      grade: 'الصف الثاني من العالم',
      educationStream: 'ALIA' as const,
      difficulty: 'Medium' as const,
      languages: ['ar' as const],
      sourceType: 'MANUAL' as const,
    };

    if (section === 'A') {
      let qNum = 1;
      out.push({
        ...baseMeta,
        _id: `${ALIM_HADITH_A_GROUP_ID}_banner_a`,
        typology: 'SECTION_TITLE',
        stemOrPassage: [state.groupATitle, state.groupAMarksLine, state.groupAInstruction]
          .filter(Boolean)
          .join('\n'),
        marks: 0,
        customMarksText: 'الدرجات',
        groupId: ALIM_HADITH_A_GROUP_ID,
        groupRole: 'alim_hadith_banner',
      });

      const filledA = state.groupAItems.filter(
        (i) => i.hadithText.trim() || i.subAText.trim() || i.subBText.trim()
      );
      const groupAToSave = filledA.length > 0 ? filledA : state.groupAItems;

      groupAToSave.forEach((item) => {
        const hadithMarks = item.hadithMarks || 10;
        const subAMarks = item.subAMarks || 3;
        const subBMarks = item.subBMarks || 3;

        out.push({
          ...baseMeta,
          _id: item.id,
          typology: 'CQ',
          customNumber: `${toArabicDigits(qNum)}-`,
          stemOrPassage: item.hadithText.trim(),
          marks: hadithMarks + subAMarks + subBMarks,
          customMarksText: toArabicDigits(hadithMarks),
          groupId: ALIM_HADITH_A_GROUP_ID,
          groupRole: 'alim_hadith_group_a_item',
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

      onSave(out, ALIM_HADITH_A_GROUP_ID);
      onClose();
      return;
    }

    // Group B
    let qNum = groupBStartNum;
    out.push({
      ...baseMeta,
      _id: `${ALIM_HADITH_B_GROUP_ID}_banner_b`,
      typology: 'SECTION_TITLE',
      stemOrPassage: [state.groupBTitle, state.groupBMarksLine].filter(Boolean).join('\n'),
      marks: 0,
      customMarksText: 'الدرجات',
      groupId: ALIM_HADITH_B_GROUP_ID,
      groupRole: 'alim_hadith_banner',
    });

    const filledB = state.groupBItems.filter((i) => i.text.trim());
    const groupBToSave = filledB.length > 0 ? filledB : state.groupBItems;

    groupBToSave.forEach((item) => {
      const m = item.marks || 10;
      out.push({
        ...baseMeta,
        _id: item.id,
        typology: 'DESCRIPTIVE',
        customNumber: `${toArabicDigits(qNum)}-`,
        stemOrPassage: item.text.trim(),
        marks: m,
        customMarksText: toArabicDigits(m),
        groupId: ALIM_HADITH_B_GROUP_ID,
        groupRole: 'alim_hadith_group_b_item',
      });
      qNum++;
    });

    onSave(out, ALIM_HADITH_B_GROUP_ID);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-900 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                {section === 'A'
                  ? 'مجموعة (أ)—الحديث · ৮০ নম্বর (আলিম হাদিস)'
                  : 'مجموعة (ب)—أصول الحديث · ২০ নম্বর (আলিম হাদিস)'}
              </h2>
              <p className="text-[11px] text-emerald-100">
                الحديث وأصول الحديث (কোড: ২০২) · সম্পূর্ণ আরবি (RTL)
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
          {section === 'A' ? (
            <>
              {/* Group A Banner Fields */}
              <div
                dir="rtl"
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 font-ar"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 font-sans">
                    শিরোনাম (Group A)
                  </label>
                  <input
                    type="text"
                    value={state.groupATitle}
                    onChange={(e) => setState((prev) => ({ ...prev, groupATitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 font-sans">
                    মান বণ্টন
                  </label>
                  <input
                    type="text"
                    value={state.groupAMarksLine}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, groupAMarksLine: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 font-sans">
                    নির্দেশনা
                  </label>
                  <input
                    type="text"
                    value={state.groupAInstruction}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, groupAInstruction: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Group A Items */}
              <div className="space-y-3">
                {state.groupAItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden"
                  >
                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-900">
                        প্রশ্ন {toArabicDigits(idx + 1)} (মোট মান:{' '}
                        {toArabicDigits(
                          (item.hadithMarks || 10) + (item.subAMarks || 3) + (item.subBMarks || 3)
                        )}
                        )
                      </span>
                      {state.groupAItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGroupAItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      {/* Hadith Text */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600">
                            মূল আরবি হাদিস (অনুবাদের জন্য):
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 font-semibold">الدرجة:</span>
                            <input
                              type="number"
                              min={1}
                              value={item.hadithMarks}
                              onChange={(e) =>
                                updateGroupAItem(idx, {
                                  hadithMarks: Number(e.target.value) || 10,
                                })
                              }
                              className="w-12 px-1.5 py-0.5 border border-slate-200 rounded text-center font-bold"
                            />
                          </div>
                        </div>
                        <textarea
                          dir="rtl"
                          rows={3}
                          value={item.hadithText}
                          onChange={(e) => updateGroupAItem(idx, { hadithText: e.target.value })}
                          placeholder={item.hadithPlaceholder}
                          className="w-full px-3 py-2 text-sm font-ar leading-relaxed border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>

                      {/* (أ) Explanation */}
                      <div dir="rtl" className="flex items-center gap-2 font-ar">
                        <span className="text-sm font-bold text-emerald-800 shrink-0">( أ )</span>
                        <input
                          type="text"
                          value={item.subAText}
                          onChange={(e) => updateGroupAItem(idx, { subAText: e.target.value })}
                          placeholder={item.subAPlaceholder}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                        />
                        <input
                          dir="ltr"
                          type="number"
                          min={1}
                          value={item.subAMarks}
                          onChange={(e) =>
                            updateGroupAItem(idx, { subAMarks: Number(e.target.value) || 3 })
                          }
                          className="w-12 px-1.5 py-1.5 text-xs font-sans border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>

                      {/* (ب) Tahqeeq */}
                      <div dir="rtl" className="flex items-center gap-2 font-ar">
                        <span className="text-sm font-bold text-emerald-800 shrink-0">( ب )</span>
                        <input
                          type="text"
                          value={item.subBText}
                          onChange={(e) => updateGroupAItem(idx, { subBText: e.target.value })}
                          placeholder={item.subBPlaceholder}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                        />
                        <input
                          dir="ltr"
                          type="number"
                          min={1}
                          value={item.subBMarks}
                          onChange={(e) =>
                            updateGroupAItem(idx, { subBMarks: Number(e.target.value) || 3 })
                          }
                          className="w-12 px-1.5 py-1.5 text-xs font-sans border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGroupAItem}
                  className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>مجموعة (أ) তে নতুন হাদিস প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Group B Banner Fields */}
              <div
                dir="rtl"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-teal-50/60 border border-teal-200 rounded-xl p-3 font-ar"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 font-sans">
                    শিরোনাম (Group B)
                  </label>
                  <input
                    type="text"
                    value={state.groupBTitle}
                    onChange={(e) => setState((prev) => ({ ...prev, groupBTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 font-sans">
                    মান বণ্টন
                  </label>
                  <input
                    type="text"
                    value={state.groupBMarksLine}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, groupBMarksLine: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Group B Items */}
              <div className="space-y-2.5">
                {state.groupBItems.map((item, idx) => (
                  <div
                    key={item.id}
                    dir="rtl"
                    className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs font-ar"
                  >
                    <span className="text-sm font-extrabold text-teal-800 pt-2 min-w-[28px]">
                      {toArabicDigits(groupBStartNum + idx)}-
                    </span>
                    <textarea
                      rows={2}
                      value={item.text}
                      onChange={(e) => updateGroupBItem(idx, { text: e.target.value })}
                      placeholder={item.placeholder}
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:border-teal-500 outline-none"
                    />
                    <div dir="ltr" className="flex flex-col items-end gap-1.5 font-sans">
                      <input
                        type="number"
                        min={1}
                        value={item.marks}
                        onChange={(e) =>
                          updateGroupBItem(idx, { marks: Number(e.target.value) || 10 })
                        }
                        className="w-12 px-1.5 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold"
                        title="الدرجة"
                      />
                      {state.groupBItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGroupBItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGroupBItem}
                  className="w-full py-2.5 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>مجموعة (ب) তে নতুন উসূলে হাদিস প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            مجموعة (أ): {state.groupAItems.length}টি · مجموعة (ب): {state.groupBItems.length}টি
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>প্রশ্নপত্রে যুক্ত / আপডেট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
