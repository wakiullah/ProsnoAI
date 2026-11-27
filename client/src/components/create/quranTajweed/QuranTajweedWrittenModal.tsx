'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData } from 'proshno-shared';
import { BookOpen, Plus, Trash2, CheckCircle2, X, Layers } from 'lucide-react';
import {
  DEFAULT_DAKHIL_QURAN_WRITTEN,
  DakhilQuranAyatQuestion,
  DakhilQuranShortItem,
  DakhilQuranSurahGroup,
  DakhilQuranWrittenState,
} from './quranTajweedDefaults';

const toBanglaDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const parseBnNumber = (str?: string): number | null => {
  if (!str) return null;
  const eng = str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[^0-9]/g, '');
  const n = parseInt(eng, 10);
  return isNaN(n) ? null : n;
};

export const DAKHIL_QURAN_WRITTEN_GROUP_ID = 'dakhil_quran_written_group';
export const DAKHIL_QURAN_KHA_GROUP_ID = 'dakhil_quran_kha_group';
export const DAKHIL_QURAN_GA_GROUP_ID = 'dakhil_quran_ga_group';
export const DAKHIL_QURAN_GHA_GROUP_ID = 'dakhil_quran_gha_group';
export type DakhilQuranSection = 'kha' | 'ga' | 'gha';

export function extractDakhilQuranWrittenGroups(existingQuestions: QuestionData[]): DakhilQuranWrittenState {
  const relevant = existingQuestions.filter(
    (q) =>
      q.groupId === DAKHIL_QURAN_WRITTEN_GROUP_ID ||
      q.groupId === DAKHIL_QURAN_KHA_GROUP_ID ||
      q.groupId === DAKHIL_QURAN_GA_GROUP_ID ||
      q.groupId === DAKHIL_QURAN_GHA_GROUP_ID ||
      q.groupRole === 'quran_section_banner' ||
      q.groupRole === 'quran_surah_header' ||
      q.groupRole === 'quran_ayat_item' ||
      q.groupRole === 'quran_short_item'
  );
  if (relevant.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_DAKHIL_QURAN_WRITTEN));
  }

  const state: DakhilQuranWrittenState = JSON.parse(JSON.stringify(DEFAULT_DAKHIL_QURAN_WRITTEN));
  const surahGroups: DakhilQuranSurahGroup[] = [];
  const gaQuestions: DakhilQuranShortItem[] = [];
  const ghaQuestions: DakhilQuranShortItem[] = [];

  let activeSection: 'kha' | 'ga' | 'gha' = 'kha';
  let currentSurah: DakhilQuranSurahGroup | null = null;
  let foundStartNumber = false;

  for (const q of relevant) {
    const qId = q._id || '';
    if (q.groupRole === 'quran_section_banner') {
      const lines = (q.stemOrPassage || '').split('\n');
      const titleLine = lines[0] || '';
      const instructionLine = lines[1] || '';
      const marksLine = lines[2] || '';
      if (titleLine.includes('খ বিভাগ') || qId.includes('_kha')) {
        activeSection = 'kha';
        state.khaTitle = titleLine || state.khaTitle;
        state.khaInstruction = instructionLine || state.khaInstruction;
        state.khaMarksLine = marksLine || state.khaMarksLine;
      } else if (titleLine.includes('গ বিভাগ') || qId.includes('_ga')) {
        activeSection = 'ga';
        state.gaTitle = titleLine || state.gaTitle;
        state.gaInstruction = instructionLine || state.gaInstruction;
        state.gaMarksLine = marksLine || state.gaMarksLine;
      } else if (titleLine.includes('ঘ বিভাগ') || qId.includes('_gha')) {
        activeSection = 'gha';
        state.ghaTitle = titleLine || state.ghaTitle;
        state.ghaInstruction = instructionLine || state.ghaInstruction;
        state.ghaMarksLine = marksLine || state.ghaMarksLine;
      }
    } else if (q.groupRole === 'quran_surah_header') {
      activeSection = 'kha';
      currentSurah = {
        id: qId || `surah_${surahGroups.length + 1}`,
        surahName: q.stemOrPassage || 'সূরা',
        questions: [],
      };
      surahGroups.push(currentSurah);
    } else if (q.groupRole === 'quran_ayat_item') {
      if (!foundStartNumber) {
        const parsed = parseBnNumber(q.customNumber);
        if (parsed !== null) {
          state.startNumber = parsed;
          foundStartNumber = true;
        }
      }
      if (!currentSurah) {
        currentSurah = {
          id: `surah_${surahGroups.length + 1}`,
          surahName: 'সূরা আল-বাকারা',
          questions: [],
        };
        surahGroups.push(currentSurah);
      }
      const subKa = q.subQuestions?.[0];
      const subKha = q.subQuestions?.[1];
      const subGa = q.subQuestions?.[2];
      currentSurah.questions.push({
        id: qId || `dq_${currentSurah.questions.length + 1}`,
        kaInstruction: subKa?.bloomTitle || 'বাংলায় অনুবাদ কর:',
        kaAyat: subKa?.questionText ?? q.stemOrPassage ?? '',
        kaAyatPlaceholder: 'কুরআনের আরবি আয়াতসমূহ এখানে লিখুন...',
        kaMarks: subKa?.marks || 5,
        khaText: subKha?.questionText ?? '',
        khaPlaceholder: 'শানে নুযূল / ব্যাখ্যা / তারকিব প্রশ্ন...',
        khaArabicLine: subKha?.bloomTitle ?? '',
        khaMarks: subKha?.marks || 3,
        gaInstruction: subGa?.bloomTitle || 'তাহকিক কর (যে কোনো দুটি):',
        gaWords: subGa?.questionText ?? '',
        gaWordsPlaceholder: 'يُخَادِعُونَ، آمَنُوا، يَشْعُرُونَ-',
        gaMarks: subGa?.marks || 2,
      });
    } else if (q.groupRole === 'quran_short_item') {
      const targetSec = qId.includes('_gha') || activeSection === 'gha' ? 'gha' : 'ga';
      const item: DakhilQuranShortItem = {
        id: qId || `dq_${targetSec}_${Date.now()}`,
        text: q.stemOrPassage || '',
        placeholder:
          targetSec === 'gha'
            ? 'তাজভিদ সম্পর্কিত প্রশ্ন লিখুন...'
            : 'নির্বাচিত বিষয় সম্পর্কিত প্রশ্ন লিখুন...',
        marks: q.marks || 5,
      };
      if (targetSec === 'gha') {
        ghaQuestions.push(item);
      } else {
        gaQuestions.push(item);
      }
    }
  }

  if (surahGroups.length > 0) state.surahGroups = surahGroups;
  if (gaQuestions.length > 0) state.gaQuestions = gaQuestions;
  if (ghaQuestions.length > 0) state.ghaQuestions = ghaQuestions;

  return state;
}

interface QuranTajweedWrittenModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DakhilQuranSection;
  existingQuestions: QuestionData[];
  onSave: (questions: QuestionData[], targetGroupId: string) => void;
}

export const QuranTajweedWrittenModal: React.FC<QuranTajweedWrittenModalProps> = ({
  isOpen,
  onClose,
  section,
  existingQuestions,
  onSave,
}) => {
  const [state, setState] = useState<DakhilQuranWrittenState>(() =>
    JSON.parse(JSON.stringify(DEFAULT_DAKHIL_QURAN_WRITTEN))
  );

  useEffect(() => {
    if (isOpen) {
      setState(extractDakhilQuranWrittenGroups(existingQuestions));
    }
  }, [isOpen, existingQuestions, section]);

  if (!isOpen) return null;

  const existingKhaCount = existingQuestions.filter((q) => q.groupRole === 'quran_ayat_item').length;
  const totalKhaQuestions =
    existingKhaCount > 0
      ? existingKhaCount
      : state.surahGroups.reduce((acc, sg) => acc + sg.questions.length, 0);
  const existingGaCount = existingQuestions.filter(
    (q) => q.groupRole === 'quran_short_item' && !(q._id || '').includes('_gha')
  ).length;
  const gaStartNum = state.startNumber + totalKhaQuestions;
  const ghaStartNum = gaStartNum + (existingGaCount > 0 ? existingGaCount : state.gaQuestions.length);

  const updateSurahName = (surahIdx: number, name: string) => {
    setState((prev) => ({
      ...prev,
      surahGroups: prev.surahGroups.map((sg, i) =>
        i === surahIdx ? { ...sg, surahName: name } : sg
      ),
    }));
  };

  const addSurahGroup = () => {
    setState((prev) => ({
      ...prev,
      surahGroups: [
        ...prev.surahGroups,
        {
          id: `surah_${Date.now()}`,
          surahName: 'নতুন সূরা',
          questions: [
            {
              id: `dq_${Date.now()}`,
              kaInstruction: 'বাংলায় অনুবাদ কর:',
              kaAyat: '',
              kaAyatPlaceholder: 'কুরআনের আরবি আয়াতসমূহ এখানে লিখুন...',
              kaMarks: 5,
              khaText: '',
              khaPlaceholder: 'শানে নুযূল / ব্যাখ্যা / তারকিব প্রশ্ন...',
              khaArabicLine: '',
              khaMarks: 3,
              gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
              gaWords: '',
              gaWordsPlaceholder: 'تাহকিক শব্দসমূহ লিখুন...',
              gaMarks: 2,
            },
          ],
        },
      ],
    }));
  };

  const removeSurahGroup = (surahIdx: number) => {
    setState((prev) => ({
      ...prev,
      surahGroups: prev.surahGroups.filter((_, i) => i !== surahIdx),
    }));
  };

  const addAyatQuestion = (surahIdx: number) => {
    setState((prev) => ({
      ...prev,
      surahGroups: prev.surahGroups.map((sg, i) =>
        i === surahIdx
          ? {
              ...sg,
              questions: [
                ...sg.questions,
                {
                  id: `dq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  kaInstruction: 'বাংলায় অনুবাদ কর:',
                  kaAyat: '',
                  kaAyatPlaceholder: 'কুরআনের আরবি আয়াতসমূহ এখানে লিখুন...',
                  kaMarks: 5,
                  khaText: '',
                  khaPlaceholder: 'শানে নুযূল / ব্যাখ্যা / তারকিব প্রশ্ন...',
                  khaArabicLine: '',
                  khaMarks: 3,
                  gaInstruction: 'তাহকিক কর (যে কোনো দুটি):',
                  gaWords: '',
                  gaWordsPlaceholder: 'তাহকিক শব্দসমূহ লিখুন...',
                  gaMarks: 2,
                },
              ],
            }
          : sg
      ),
    }));
  };

  const updateAyatQuestion = (
    surahIdx: number,
    qIdx: number,
    patch: Partial<DakhilQuranAyatQuestion>
  ) => {
    setState((prev) => ({
      ...prev,
      surahGroups: prev.surahGroups.map((sg, i) =>
        i === surahIdx
          ? {
              ...sg,
              questions: sg.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q)),
            }
          : sg
      ),
    }));
  };

  const removeAyatQuestion = (surahIdx: number, qIdx: number) => {
    setState((prev) => ({
      ...prev,
      surahGroups: prev.surahGroups.map((sg, i) =>
        i === surahIdx
          ? { ...sg, questions: sg.questions.filter((_, j) => j !== qIdx) }
          : sg
      ),
    }));
  };

  const handleSave = () => {
    const out: QuestionData[] = [];
    let qNum = state.startNumber;
    const baseMeta = {
      subject: 'আল কুরআন মাজিদ ও তাজবীদ',
      grade: 'দাখিল ১০ম শ্রেণি',
      educationStream: 'ALIA' as const,
      difficulty: 'Medium' as const,
      languages: ['bn', 'ar'] as ('bn' | 'ar')[],
      sourceType: 'MANUAL' as const,
    };

    if (section === 'kha') {
      // 1. খ বিভাগ — কুরআন মাজিদ (৪০)
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_QURAN_KHA_GROUP_ID}_banner_kha`,
        typology: 'SECTION_TITLE',
        stemOrPassage: [state.khaTitle, state.khaInstruction, state.khaMarksLine].join('\n'),
        marks: 0,
        customMarksText: 'নম্বর',
        groupId: DAKHIL_QURAN_KHA_GROUP_ID,
        groupRole: 'quran_section_banner',
      });

      state.surahGroups.forEach((sg, sIdx) => {
        if (sg.surahName.trim()) {
          out.push({
            ...baseMeta,
            _id: sg.id || `${DAKHIL_QURAN_KHA_GROUP_ID}_surah_${sIdx}`,
            typology: 'GROUP_TITLE',
            stemOrPassage: sg.surahName.trim(),
            marks: 0,
            groupId: DAKHIL_QURAN_KHA_GROUP_ID,
            groupRole: 'quran_surah_header',
          });
        }

        sg.questions.forEach((item) => {
          const totalQMarks = (item.kaMarks || 5) + (item.khaMarks || 3) + (item.gaMarks || 2);
          out.push({
            ...baseMeta,
            _id: item.id,
            typology: 'CQ',
            customNumber: `${toBanglaDigits(qNum)}।`,
            stemOrPassage: item.kaAyat.trim(),
            marks: totalQMarks,
            groupId: DAKHIL_QURAN_KHA_GROUP_ID,
            groupRole: 'quran_ayat_item',
            subQuestions: [
              {
                part: 'ক',
                bloomLevel: 'comprehension',
                bloomTitle: item.kaInstruction,
                questionText: item.kaAyat.trim(),
                marks: item.kaMarks || 5,
              },
              {
                part: 'খ',
                bloomLevel: 'application',
                bloomTitle: item.khaArabicLine.trim(),
                questionText: item.khaText.trim(),
                marks: item.khaMarks || 3,
              },
              {
                part: 'গ',
                bloomLevel: 'knowledge',
                bloomTitle: item.gaInstruction,
                questionText: item.gaWords.trim(),
                marks: item.gaMarks || 2,
              },
            ],
          });
          qNum++;
        });
      });

      onSave(out, DAKHIL_QURAN_KHA_GROUP_ID);
      onClose();
      return;
    }

    if (section === 'ga') {
      // 2. গ বিভাগ — নির্বাচিত বিষয়সমূহ (১০)
      qNum = gaStartNum;
      out.push({
        ...baseMeta,
        _id: `${DAKHIL_QURAN_GA_GROUP_ID}_banner_ga`,
        typology: 'SECTION_TITLE',
        stemOrPassage: [state.gaTitle, state.gaInstruction, state.gaMarksLine].join('\n'),
        marks: 0,
        groupId: DAKHIL_QURAN_GA_GROUP_ID,
        groupRole: 'quran_section_banner',
      });

      state.gaQuestions.forEach((item, idx) => {
        out.push({
          ...baseMeta,
          _id: item.id.includes('_ga') ? item.id : `dq_ga_${idx}_${Date.now()}`,
          typology: 'DESCRIPTIVE',
          customNumber: `${toBanglaDigits(qNum)}।`,
          stemOrPassage: item.text.trim(),
          marks: item.marks || 5,
          customMarksText: toBanglaDigits(item.marks || 5),
          groupId: DAKHIL_QURAN_GA_GROUP_ID,
          groupRole: 'quran_short_item',
        });
        qNum++;
      });

      onSave(out, DAKHIL_QURAN_GA_GROUP_ID);
      onClose();
      return;
    }

    // 3. ঘ বিভাগ — তাজভিদ (১০)
    qNum = ghaStartNum;
    out.push({
      ...baseMeta,
      _id: `${DAKHIL_QURAN_GHA_GROUP_ID}_banner_gha`,
      typology: 'SECTION_TITLE',
      stemOrPassage: [state.ghaTitle, state.ghaInstruction, state.ghaMarksLine].join('\n'),
      marks: 0,
      groupId: DAKHIL_QURAN_GHA_GROUP_ID,
      groupRole: 'quran_section_banner',
    });

    state.ghaQuestions.forEach((item, idx) => {
      out.push({
        ...baseMeta,
        _id: item.id.includes('_gha') ? item.id : `dq_gha_${idx}_${Date.now()}`,
        typology: 'DESCRIPTIVE',
        customNumber: `${toBanglaDigits(qNum)}।`,
        stemOrPassage: item.text.trim(),
        marks: item.marks || 5,
        customMarksText: toBanglaDigits(item.marks || 5),
        groupId: DAKHIL_QURAN_GHA_GROUP_ID,
        groupRole: 'quran_short_item',
      });
      qNum++;
    });

    onSave(out, DAKHIL_QURAN_GHA_GROUP_ID);
    onClose();
  };

  let runningKhaNum = state.startNumber;

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
                  ? 'খ বিভাগ — কুরআন মাজিদ (৪০ নম্বর)'
                  : section === 'ga'
                  ? 'গ বিভাগ — নির্বাচিত বিষয়সমূহ (১০ নম্বর)'
                  : 'ঘ বিভাগ — তাজভিদ (১০ নম্বর)'}
              </h2>
              <p className="text-[11px] text-emerald-100">
                দাখিল ৯ম–১০ম শ্রেণি · আল কুরআন মাজিদ ও তাজবীদ (কোড: ১০১)
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
          {section === 'kha' && (
            <>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      বিভাগের শিরোনাম
                    </label>
                    <input
                      type="text"
                      value={state.khaTitle}
                      onChange={(e) => setState((p) => ({ ...p, khaTitle: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      নম্বর বণ্টন লাইন
                    </label>
                    <input
                      type="text"
                      value={state.khaMarksLine}
                      onChange={(e) => setState((p) => ({ ...p, khaMarksLine: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      শুরুর প্রশ্ন নম্বর
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={state.startNumber}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          startNumber: Math.max(1, Number(e.target.value) || 2),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    নির্দেশনা (৬ষ্ঠ–১০ম শ্রেণি অনুযায়ী পরিবর্তনযোগ্য)
                  </label>
                  <input
                    type="text"
                    value={state.khaInstruction}
                    onChange={(e) => setState((p) => ({ ...p, khaInstruction: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {state.surahGroups.map((sg, sIdx) => (
                <div
                  key={sg.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                >
                  <div className="px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
                      <input
                        type="text"
                        value={sg.surahName}
                        onChange={(e) => updateSurahName(sIdx, e.target.value)}
                        placeholder="সূরার নাম (যেমন: সূরা আল-বাকারা)"
                        className="px-2.5 py-1 text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg w-full max-w-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addAyatQuestion(sIdx)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> প্রশ্ন যোগ
                      </button>
                      {state.surahGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSurahGroup(sIdx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="সূরা গ্রুপ মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-4">
                    {sg.questions.map((item, qIdx) => {
                      const qNo = runningKhaNum++;
                      return (
                        <div
                          key={item.id}
                          className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              প্রশ্ন {toBanglaDigits(qNo)}। (মান: {toBanglaDigits(item.kaMarks + item.khaMarks + item.gaMarks)})
                            </span>
                            {sg.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAyatQuestion(sIdx, qIdx)}
                                className="text-rose-600 hover:bg-rose-50 p-1 rounded-md text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> মুছুন
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={item.kaInstruction}
                                onChange={(e) =>
                                  updateAyatQuestion(sIdx, qIdx, { kaInstruction: e.target.value })
                                }
                                className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 w-52"
                              />
                              <span className="text-[11px] font-bold text-slate-500">
                                (ক) নম্বর: {toBanglaDigits(item.kaMarks)}
                              </span>
                            </div>
                            <textarea
                              dir="rtl"
                              rows={3}
                              value={item.kaAyat}
                              onChange={(e) =>
                                updateAyatQuestion(sIdx, qIdx, { kaAyat: e.target.value })
                              }
                              placeholder={item.kaAyatPlaceholder}
                              className="w-full px-3 py-2 text-base font-ar leading-loose border border-slate-300 rounded-lg bg-white text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-7">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                (খ) শানে নুযূল / ব্যাখ্যা / তারকিব (নম্বর: {toBanglaDigits(item.khaMarks)})
                              </label>
                              <input
                                type="text"
                                value={item.khaText}
                                onChange={(e) =>
                                  updateAyatQuestion(sIdx, qIdx, { khaText: e.target.value })
                                }
                                placeholder={item.khaPlaceholder}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                ঐচ্ছিক আলাদা আরবি বাক্য (তারকিবের জন্য)
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={item.khaArabicLine}
                                onChange={(e) =>
                                  updateAyatQuestion(sIdx, qIdx, { khaArabicLine: e.target.value })
                                }
                                placeholder={item.khaArabicPlaceholder || 'فَإِنَّ اللَّهَ لَا يُحِبُّ الْكَافِرِينَ-'}
                                className="w-full px-2.5 py-1.5 text-sm font-ar border border-slate-300 rounded-lg bg-white text-right"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                            <div className="sm:col-span-4">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                (গ) নির্দেশনা (নম্বর: {toBanglaDigits(item.gaMarks)})
                              </label>
                              <input
                                type="text"
                                value={item.gaInstruction}
                                onChange={(e) =>
                                  updateAyatQuestion(sIdx, qIdx, { gaInstruction: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                              />
                            </div>
                            <div className="sm:col-span-8">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                তাহকিকের আরবি শব্দসমূহ (ডান থেকে বামে)
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={item.gaWords}
                                onChange={(e) =>
                                  updateAyatQuestion(sIdx, qIdx, { gaWords: e.target.value })
                                }
                                placeholder={item.gaWordsPlaceholder}
                                className="w-full px-3 py-1.5 text-base font-ar border border-slate-300 rounded-lg bg-white text-right"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSurahGroup}
                className="w-full py-2 border-2 border-dashed border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> নতুন সূরা গ্রুপ যোগ করুন
              </button>
            </>
          )}

          {section === 'ga' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={state.gaTitle}
                    onChange={(e) => setState((p) => ({ ...p, gaTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">নির্দেশনা</label>
                  <input
                    type="text"
                    value={state.gaInstruction}
                    onChange={(e) => setState((p) => ({ ...p, gaInstruction: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">মান</label>
                  <input
                    type="text"
                    value={state.gaMarksLine}
                    onChange={(e) => setState((p) => ({ ...p, gaMarksLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {state.gaQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2 py-1 rounded-lg shrink-0 mt-0.5">
                      {toBanglaDigits(gaStartNum + idx)}।
                    </span>
                    <textarea
                      rows={2}
                      value={q.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          gaQuestions: p.gaQuestions.map((item, i) =>
                            i === idx ? { ...item, text: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder={q.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                    {state.gaQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            gaQuestions: p.gaQuestions.filter((_, i) => i !== idx),
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
                    gaQuestions: [
                      ...p.gaQuestions,
                      {
                        id: `dq_ga_${Date.now()}`,
                        text: '',
                        placeholder: 'নির্বাচিত বিষয় সম্পর্কিত প্রশ্ন লিখুন...',
                        marks: 5,
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

          {section === 'gha' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={state.ghaTitle}
                    onChange={(e) => setState((p) => ({ ...p, ghaTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">নির্দেশনা</label>
                  <input
                    type="text"
                    value={state.ghaInstruction}
                    onChange={(e) => setState((p) => ({ ...p, ghaInstruction: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">মান</label>
                  <input
                    type="text"
                    value={state.ghaMarksLine}
                    onChange={(e) => setState((p) => ({ ...p, ghaMarksLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {state.ghaQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2 py-1 rounded-lg shrink-0 mt-0.5">
                      {toBanglaDigits(ghaStartNum + idx)}।
                    </span>
                    <textarea
                      rows={2}
                      value={q.text}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          ghaQuestions: p.ghaQuestions.map((item, i) =>
                            i === idx ? { ...item, text: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder={q.placeholder}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                    {state.ghaQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            ghaQuestions: p.ghaQuestions.filter((_, i) => i !== idx),
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
                    ghaQuestions: [
                      ...p.ghaQuestions,
                      {
                        id: `dq_gha_${Date.now()}`,
                        text: '',
                        placeholder: 'তাজভিদ সম্পর্কিত প্রশ্ন লিখুন...',
                        marks: 5,
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
