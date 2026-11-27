'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_DAKHIL_HADITH_WRITTEN,
  DakhilHadithGaQuestion,
  DakhilHadithKhaQuestion,
  DakhilHadithWrittenState,
} from './hadithSharifDefaults';

const toBanglaDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const parseBnNumber = (str?: string): number | null => {
  if (!str) return null;
  const eng = str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[^0-9]/g, '');
  const n = parseInt(eng, 10);
  return isNaN(n) ? null : n;
};

export const DAKHIL_HADITH_WRITTEN_GROUP_ID = 'dakhil_hadith_written_group';
export const DAKHIL_HADITH_KHA_GROUP_ID = 'dakhil_hadith_kha_group';
export const DAKHIL_HADITH_GA_GROUP_ID = 'dakhil_hadith_ga_group';
export type DakhilHadithSection = 'kha' | 'ga';

export function extractDakhilHadithWrittenGroups(
  existingQuestions: QuestionData[]
): DakhilHadithWrittenState {
  const relevant = existingQuestions.filter(
    (q) =>
      q.groupId === DAKHIL_HADITH_WRITTEN_GROUP_ID ||
      q.groupId === DAKHIL_HADITH_KHA_GROUP_ID ||
      q.groupId === DAKHIL_HADITH_GA_GROUP_ID ||
      q.groupRole === 'hadith_section_banner' ||
      q.groupRole === 'hadith_kha_item' ||
      q.groupRole === 'hadith_ga_item'
  );

  if (relevant.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_DAKHIL_HADITH_WRITTEN));
  }

  const state: DakhilHadithWrittenState = JSON.parse(JSON.stringify(DEFAULT_DAKHIL_HADITH_WRITTEN));
  const khaQuestions: DakhilHadithKhaQuestion[] = [];
  const gaQuestions: DakhilHadithGaQuestion[] = [];
  let foundStartNumber = false;

  for (const q of relevant) {
    const qId = q._id || '';
    if (q.groupRole === 'hadith_section_banner') {
      const lines = (q.stemOrPassage || '').split('\n');
      const titleLine = lines[0] || '';
      const instructionLine = lines[1] || '';
      const marksLine = lines[2] || '';
      if (titleLine.includes('গ বিভাগ') || qId.includes('_ga')) {
        state.gaTitle = titleLine || state.gaTitle;
        state.gaInstruction = instructionLine || state.gaInstruction;
        state.gaMarksLine = marksLine || state.gaMarksLine;
      } else {
        state.khaTitle = titleLine || state.khaTitle;
        state.khaInstruction = instructionLine || state.khaInstruction;
        state.khaMarksLine = marksLine || state.khaMarksLine;
      }
    } else if (q.groupRole === 'hadith_kha_item') {
      if (!foundStartNumber) {
        const parsed = parseBnNumber(q.customNumber);
        if (parsed !== null) {
          state.startNumber = parsed;
          foundStartNumber = true;
        }
      }
      const subKa = q.subQuestions?.[0];
      const subKhaAlif = q.subQuestions?.[1];
      const subKhaBa = q.subQuestions?.[2];
      khaQuestions.push({
        id: qId || `dh_q_${khaQuestions.length + 1}`,
        kaInstruction: subKa?.bloomTitle || 'বাংলায় অনুবাদ কর:',
        kaHadith: subKa?.questionText ?? q.stemOrPassage ?? '',
        kaHadithPlaceholder: 'আরবি হাদিসসমূহ এখানে লিখুন...',
        kaMarks: subKa?.marks || 5,
        khaHeading: subKhaAlif?.bloomTitle || 'উত্তর দাও:',
        khaAlifText: subKhaAlif?.questionText ?? '',
        khaAlifPlaceholder: 'তাৎপর্য / পরিচয় / পার্থক্য / ব্যাখ্যা লিখুন...',
        khaAlifMarks: subKhaAlif?.marks || 3,
        khaBaInstruction: subKhaBa?.bloomTitle || 'তাহকিক কর (যে কোনো দুটি):',
        khaBaWords: subKhaBa?.questionText ?? '',
        khaBaWordsPlaceholder: 'سَأَلَ، تُطْعِمُ، الْجَنَّةُ، لَمْ تَعْرِفْ-',
        khaBaMarks: subKhaBa?.marks || 2,
      });
    } else if (q.groupRole === 'hadith_ga_item') {
      gaQuestions.push({
        id: qId || `dh_ga_${gaQuestions.length + 1}`,
        text: q.stemOrPassage || '',
        placeholder: 'উসূলে হাদিস বা হাদিস লিখন প্রশ্ন লিখুন...',
        marks: q.marks || 5,
      });
    }
  }

  if (khaQuestions.length > 0) state.khaQuestions = khaQuestions;
  if (gaQuestions.length > 0) state.gaQuestions = gaQuestions;

  return state;
}

interface DakhilHadithWrittenModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DakhilHadithSection;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

export const DakhilHadithWrittenModal: React.FC<DakhilHadithWrittenModalProps> = ({
  isOpen,
  onClose,
  section,
  existingQuestions,
  onSave,
}) => {
  const [state, setState] = useState<DakhilHadithWrittenState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_DAKHIL_HADITH_WRITTEN))
  );

  useEffect(() => {
    if (isOpen) {
      setState(extractDakhilHadithWrittenGroups(existingQuestions));
    }
  }, [isOpen, existingQuestions, section]);

  if (!isOpen) return null;

  const existingKhaCount = existingQuestions.filter((q) => q.groupRole === 'hadith_kha_item').length;
  const gaStartNum = state.startNumber + (existingKhaCount > 0 ? existingKhaCount : state.khaQuestions.length);

  const updateKhaQuestion = (idx: number, patch: Partial<DakhilHadithKhaQuestion>) => {
    setState((prev) => ({
      ...prev,
      khaQuestions: prev.khaQuestions.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const addKhaQuestion = () => {
    setState((prev) => ({
      ...prev,
      khaQuestions: [
        ...prev.khaQuestions,
        {
          id: `dh_q_${Date.now()}`,
          kaInstruction: 'বাংলায় অনুবাদ কর:',
          kaHadith: '',
          kaHadithPlaceholder: 'আরবি হাদিসসমূহ এখানে লিখুন...',
          kaMarks: 5,
          khaHeading: 'উত্তর দাও:',
          khaAlifText: '',
          khaAlifPlaceholder: 'তাৎপর্য / পরিচয় / পার্থক্য / ব্যাখ্যা লিখুন...',
          khaAlifMarks: 3,
          khaBaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
          khaBaWords: '',
          khaBaWordsPlaceholder: 'তাহকিক শব্দসমূহ লিখুন...',
          khaBaMarks: 2,
        },
      ],
    }));
  };

  const removeKhaQuestion = (idx: number) => {
    setState((prev) => ({
      ...prev,
      khaQuestions: prev.khaQuestions.filter((_, i) => i !== idx),
    }));
  };

  const updateGaQuestion = (idx: number, patch: Partial<DakhilHadithGaQuestion>) => {
    setState((prev) => ({
      ...prev,
      gaQuestions: prev.gaQuestions.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const addGaQuestion = () => {
    setState((prev) => ({
      ...prev,
      gaQuestions: [
        ...prev.gaQuestions,
        {
          id: `dh_ga_${Date.now()}`,
          text: '',
          placeholder: 'উসূলে হাদিস বা হাদিস লিখন প্রশ্ন লিখুন...',
          marks: 5,
        },
      ],
    }));
  };

  const removeGaQuestion = (idx: number) => {
    setState((prev) => ({
      ...prev,
      gaQuestions: prev.gaQuestions.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    const out: QuestionData[] = [];
    const baseMeta = {
      subject: 'হাদিস শরিফ',
      grade: 'দাখিল ১০ম শ্রেণি',
      educationStream: 'ALIA' as const,
      difficulty: 'Medium' as const,
      languages: ['bn' as const, 'ar' as const],
      sourceType: 'MANUAL' as const,
    };

    if (section === 'kha') {
      let qNum = state.startNumber;
      const filledKha = state.khaQuestions.filter(
        (q) => q.kaHadith.trim() || q.khaAlifText.trim() || q.khaBaWords.trim()
      );
      const khaToSave = filledKha.length > 0 ? filledKha : state.khaQuestions;

      if (khaToSave.length > 0) {
        out.push({
          ...baseMeta,
          _id: `${DAKHIL_HADITH_KHA_GROUP_ID}_banner_kha`,
          typology: 'SECTION_TITLE',
          stemOrPassage: [state.khaTitle, state.khaInstruction, state.khaMarksLine]
            .filter(Boolean)
            .join('\n'),
          marks: 0,
          customMarksText: 'নম্বর',
          groupId: DAKHIL_HADITH_KHA_GROUP_ID,
          groupRole: 'hadith_section_banner',
        });

        khaToSave.forEach((item) => {
          const kaM = item.kaMarks || 5;
          const alifM = item.khaAlifMarks || 3;
          const baM = item.khaBaMarks || 2;
          out.push({
            ...baseMeta,
            _id: item.id,
            typology: 'CQ',
            customNumber: `${toBanglaDigits(qNum)}।`,
            stemOrPassage: item.kaHadith.trim(),
            marks: kaM + alifM + baM,
            groupId: DAKHIL_HADITH_KHA_GROUP_ID,
            groupRole: 'hadith_kha_item',
            subQuestions: [
              {
                part: 'ক',
                bloomLevel: 'comprehension',
                bloomTitle: item.kaInstruction || 'বাংলায় অনুবাদ কর:',
                questionText: item.kaHadith.trim(),
                marks: kaM,
              },
              {
                part: 'খ',
                bloomLevel: 'application',
                bloomTitle: item.khaHeading || 'উত্তর দাও:',
                questionText: item.khaAlifText.trim(),
                marks: alifM,
              },
              {
                part: 'গ',
                bloomLevel: 'knowledge',
                bloomTitle: item.khaBaInstruction || 'তাহকিক কর (যে কোনো দুটি):',
                questionText: item.khaBaWords.trim(),
                marks: baM,
              },
            ],
          });
          qNum++;
        });
      }

      onSave(out, DAKHIL_HADITH_KHA_GROUP_ID);
      onClose();
      return;
    }

    // ── গ বিভাগ (উসূলে হাদিস ও হাদিস লিখন: ১০) ──
    let qNum = gaStartNum;
    const filledGa = state.gaQuestions.filter((q) => q.text.trim());
    const gaToSave = filledGa.length > 0 ? filledGa : state.gaQuestions;

    if (gaToSave.length > 0) {
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_HADITH_GA_GROUP_ID}_banner_ga`,
        typology: 'SECTION_TITLE',
        stemOrPassage: [state.gaTitle, state.gaInstruction, state.gaMarksLine]
          .filter(Boolean)
          .join('\n'),
        marks: 0,
        groupId: DAKHIL_HADITH_GA_GROUP_ID,
        groupRole: 'hadith_section_banner',
      });

      gaToSave.forEach((item) => {
        const m = item.marks || 5;
        out.push({
          ...baseMeta,
          _id: item.id,
          typology: 'DESCRIPTIVE',
          customNumber: `${toBanglaDigits(qNum)}।`,
          stemOrPassage: item.text.trim(),
          marks: m,
          customMarksText: toBanglaDigits(m),
          groupId: DAKHIL_HADITH_GA_GROUP_ID,
          groupRole: 'hadith_ga_item',
        });
        qNum++;
      });
    }

    onSave(out, DAKHIL_HADITH_GA_GROUP_ID);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                {section === 'kha'
                  ? 'খ বিভাগ — হাদিস অনুবাদ, ব্যাখ্যা ও তাহকিক (মান: ৫০)'
                  : 'গ বিভাগ — উসূলে হাদিস ও হাদিস লিখন (মান: ১০)'}
              </h2>
              <p className="text-[11px] text-emerald-100">
                দাখিল ৬ষ্ঠ–১০ম শ্রেণি · হাদিস শরিফ (কোড: ১০২)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {section === 'kha' && (
              <div className="flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-lg">
                <span className="font-bold text-emerald-100">শুরুর ক্রমিক:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={state.startNumber}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      startNumber: Math.max(1, Number(e.target.value) || 2),
                    }))
                  }
                  className="w-12 px-1.5 py-0.5 rounded text-center font-bold bg-white text-slate-900"
                />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {section === 'kha' ? (
            <>
              {/* Section Banner Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    বিভাগের শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={state.khaTitle}
                    onChange={(e) => setState((prev) => ({ ...prev, khaTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    নির্দেশনা
                  </label>
                  <input
                    type="text"
                    value={state.khaInstruction}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, khaInstruction: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    মান বণ্টন
                  </label>
                  <input
                    type="text"
                    value={state.khaMarksLine}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, khaMarksLine: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Kha Questions List */}
              <div className="space-y-3">
                {state.khaQuestions.map((item, idx) => {
                  const qNum = state.startNumber + idx;
                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden"
                    >
                      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-900">
                          প্রশ্ন {toBanglaDigits(qNum)}। (মোট মান:{' '}
                          {toBanglaDigits(
                            (item.kaMarks || 5) + (item.khaAlifMarks || 3) + (item.khaBaMarks || 2)
                          )}
                          )
                        </span>
                        {state.khaQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeKhaQuestion(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                            title="প্রশ্ন মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="p-3.5 space-y-3">
                        {/* (ক) বাংলায় অনুবাদ কর */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs font-extrabold text-slate-700 shrink-0">
                                (ক)
                              </span>
                              <input
                                type="text"
                                value={item.kaInstruction}
                                onChange={(e) =>
                                  updateKhaQuestion(idx, { kaInstruction: e.target.value })
                                }
                                className="flex-1 px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500 font-semibold">মান:</span>
                              <input
                                type="number"
                                min={1}
                                value={item.kaMarks}
                                onChange={(e) =>
                                  updateKhaQuestion(idx, { kaMarks: Number(e.target.value) || 5 })
                                }
                                className="w-12 px-1.5 py-1 border border-slate-200 rounded-lg text-center font-bold"
                              />
                            </div>
                          </div>
                          <textarea
                            dir="rtl"
                            rows={3}
                            value={item.kaHadith}
                            onChange={(e) => updateKhaQuestion(idx, { kaHadith: e.target.value })}
                            placeholder={item.kaHadithPlaceholder}
                            className="w-full px-3 py-2 text-sm font-ar leading-relaxed border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>

                        {/* (খ) উত্তর দাও: (أ) ও (ب) */}
                        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-700">(খ)</span>
                            <input
                              type="text"
                              value={item.khaHeading}
                              onChange={(e) =>
                                updateKhaQuestion(idx, { khaHeading: e.target.value })
                              }
                              className="w-40 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                            />
                          </div>

                          {/* (أ) ব্যাখ্যা / তাৎপর্য */}
                          <div className="flex items-center gap-2 pl-4">
                            <span className="text-xs font-bold text-emerald-800 shrink-0 font-ar">
                              (أ)
                            </span>
                            <input
                              type="text"
                              value={item.khaAlifText}
                              onChange={(e) =>
                                updateKhaQuestion(idx, { khaAlifText: e.target.value })
                              }
                              placeholder={item.khaAlifPlaceholder}
                              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none"
                            />
                            <input
                              type="number"
                              min={1}
                              value={item.khaAlifMarks}
                              onChange={(e) =>
                                updateKhaQuestion(idx, {
                                  khaAlifMarks: Number(e.target.value) || 3,
                                })
                              }
                              className="w-12 px-1.5 py-1.5 text-xs border border-slate-200 rounded-lg text-center font-bold bg-white"
                              title="মান"
                            />
                          </div>

                          {/* (ب) তাহকিক কর */}
                          <div className="space-y-1.5 pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-800 shrink-0 font-ar">
                                (ب)
                              </span>
                              <input
                                type="text"
                                value={item.khaBaInstruction}
                                onChange={(e) =>
                                  updateKhaQuestion(idx, { khaBaInstruction: e.target.value })
                                }
                                className="flex-1 px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                              />
                              <input
                                type="number"
                                min={1}
                                value={item.khaBaMarks}
                                onChange={(e) =>
                                  updateKhaQuestion(idx, {
                                    khaBaMarks: Number(e.target.value) || 2,
                                  })
                                }
                                className="w-12 px-1.5 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold bg-white"
                                title="মান"
                              />
                            </div>
                            <input
                              dir="rtl"
                              type="text"
                              value={item.khaBaWords}
                              onChange={(e) =>
                                updateKhaQuestion(idx, { khaBaWords: e.target.value })
                              }
                              placeholder={item.khaBaWordsPlaceholder}
                              className="w-full px-3 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addKhaQuestion}
                  className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>খ বিভাগে নতুন হাদিস প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* গ বিভাগ Banner Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-teal-50/60 border border-teal-200 rounded-xl p-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    বিভাগের শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={state.gaTitle}
                    onChange={(e) => setState((prev) => ({ ...prev, gaTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    নির্দেশনা
                  </label>
                  <input
                    type="text"
                    value={state.gaInstruction}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, gaInstruction: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    মান বণ্টন
                  </label>
                  <input
                    type="text"
                    value={state.gaMarksLine}
                    onChange={(e) => setState((prev) => ({ ...prev, gaMarksLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* গ বিভাগ Questions */}
              <div className="space-y-2.5">
                {state.gaQuestions.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs"
                  >
                    <span className="text-xs font-extrabold text-teal-800 pt-2 min-w-[28px]">
                      {toBanglaDigits(gaStartNum + idx)}।
                    </span>
                    <textarea
                      rows={2}
                      value={item.text}
                      onChange={(e) => updateGaQuestion(idx, { text: e.target.value })}
                      placeholder={item.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-teal-500 outline-none"
                    />
                    <div className="flex flex-col items-end gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={item.marks}
                        onChange={(e) =>
                          updateGaQuestion(idx, { marks: Number(e.target.value) || 5 })
                        }
                        className="w-12 px-1.5 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold"
                        title="মান"
                      />
                      {state.gaQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGaQuestion(idx)}
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
                  onClick={addGaQuestion}
                  className="w-full py-2.5 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>গ বিভাগে নতুন প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            খ বিভাগ: {toBanglaDigits(state.khaQuestions.length)}টি প্রশ্ন · গ বিভাগ:{' '}
            {toBanglaDigits(state.gaQuestions.length)}টি প্রশ্ন
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
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-1.5 transition"
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
