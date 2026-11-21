'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QuestionData } from 'proshno-shared';
import {
  X,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { SarfQuestionEditor } from './SarfQuestionEditor';
import { NahwQuestionEditor } from './NahwQuestionEditor';
import {
  DEFAULT_ARABIC_2ND_BANNER,
  DEFAULT_SARF_SUBQUESTIONS,
  DEFAULT_NAHW_SUBQUESTIONS,
} from './arabic2ndDefaults';

export interface SarfNahwGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractSarfNahwGroups(questions: QuestionData[]): SarfNahwGroup[] {
  const groups: SarfNahwGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('sarf-nahw-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `সরফ ও নাহু অংশ ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

interface SarfNahwModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: SarfNahwGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    proceedToIkhtibar?: boolean
  ) => void;
}

export const SarfNahwModal: React.FC<SarfNahwModalProps> = ({
  isOpen,
  onClose,
  allGroups,
  activeGroupId,
  onSelectGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  // Section Banner
  const [includeBanner, setIncludeBanner] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(DEFAULT_ARABIC_2ND_BANNER);

  // Q1 Sarf
  const [includeQ1, setIncludeQ1] = useState(true);
  const [q1Number, setQ1Number] = useState('١-');
  const [q1Title, setQ1Title] = useState(
    'أجب عن الأسئلة التالية باللغة العربية من قسم الصرف (اثنين فقط) :'
  );
  const [q1MarksFormula, setQ1MarksFormula] = useState('١٠ = ٢ × ٥');
  const [q1SubQuestions, setQ1SubQuestions] = useState(DEFAULT_SARF_SUBQUESTIONS);

  // Q2 Nahw
  const [includeQ2, setIncludeQ2] = useState(true);
  const [q2Number, setQ2Number] = useState('٢-');
  const [q2Title, setQ2Title] = useState(
    'أجب عن الأسئلة التالية باللغة العربية من قسم النحو (أربعة فقط) :'
  );
  const [q2MarksFormula, setQ2MarksFormula] = useState('٢٠ = ٤ × ٥');
  const [q2SubQuestions, setQ2SubQuestions] = useState(DEFAULT_NAHW_SUBQUESTIONS);

  // Sync state on open or activeGroup change
  useEffect(() => {
    if (!activeGroup) {
      setIncludeBanner(true);
      setBannerTitle(DEFAULT_ARABIC_2ND_BANNER);

      setIncludeQ1(true);
      setQ1Number('١-');
      setQ1Title('أجب عن الأسئلة التالية باللغة العربية من قسم الصرف (اثنين فقط) :');
      setQ1MarksFormula('١٠ = ٢ × ٥');
      setQ1SubQuestions(DEFAULT_SARF_SUBQUESTIONS);

      setIncludeQ2(true);
      setQ2Number('٢-');
      setQ2Title('أجب عن الأسئلة التالية باللغة العربية من قسم النحو (أربعة فقط) :');
      setQ2MarksFormula('٢٠ = ٤ × ٥');
      setQ2SubQuestions(DEFAULT_NAHW_SUBQUESTIONS);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find(
      (q) => q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE'
    );
    if (bannerQ) {
      setIncludeBanner(true);
      setBannerTitle(bannerQ.stemOrPassage || DEFAULT_ARABIC_2ND_BANNER);
    } else {
      setIncludeBanner(false);
    }

    const q1 = qs.find((q) => q.groupRole === 'sarf_q1' || q.customNumber?.includes('١'));
    if (q1) {
      setIncludeQ1(true);
      setQ1Number(q1.customNumber || '١-');
      setQ1Title(q1.stemOrPassage || '');
      setQ1MarksFormula(q1.customMarksText || '١٠ = ٢ × ٥');
      if (q1.subQuestions && q1.subQuestions.length > 0) {
        setQ1SubQuestions(q1.subQuestions.map((s) => s.questionText));
      }
    } else {
      setIncludeQ1(false);
    }

    const q2 = qs.find((q) => q.groupRole === 'nahw_q2' || q.customNumber?.includes('٢'));
    if (q2) {
      setIncludeQ2(true);
      setQ2Number(q2.customNumber || '٢-');
      setQ2Title(q2.stemOrPassage || '');
      setQ2MarksFormula(q2.customMarksText || '٢٠ = ٤ × ٥');
      if (q2.subQuestions && q2.subQuestions.length > 0) {
        setQ2SubQuestions(q2.subQuestions.map((s) => s.questionText));
      }
    } else {
      setIncludeQ2(false);
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    // Optional Section Banner
    if (includeBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'sarf_nahw_banner',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        stemOrPassage: bannerTitle.trim(),
        customMarksText: '',
        marks: 0,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q1 Sarf
    if (includeQ1 && q1SubQuestions.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'sarf_q1',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q1Number.trim() || '١-',
        stemOrPassage: q1Title.trim(),
        customMarksText: q1MarksFormula.trim() || '١٠ = ٢ × ٥',
        subQuestions: q1SubQuestions.map((qText, idx) => ({
          part: (ARABIC_LETTERS[idx] || String(idx + 1)) as any,
          bloomLevel: 'knowledge',
          bloomTitle: '',
          questionText: qText.trim(),
          marks: 5,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q2 Nahw
    if (includeQ2 && q2SubQuestions.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'nahw_q2',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q2Number.trim() || '٢-',
        stemOrPassage: q2Title.trim(),
        customMarksText: q2MarksFormula.trim() || '٢٠ = ٤ × ٥',
        subQuestions: q2SubQuestions.map((qText, idx) => ({
          part: (ARABIC_LETTERS[idx] || String(idx + 1)) as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: qText.trim(),
          marks: 5,
        })),
        marks: 20,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    return list;
  };

  const handleApply = (proceedToIkhtibar = false) => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId = isEditMode && activeGroup ? activeGroup.groupId : `sarf-nahw-section-${Date.now()}`;
    const generated = buildQuestions(targetGroupId);
    onSave(generated, mode, targetGroupId, proceedToIkhtibar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 font-serif">
                <span>الصرف والنحو (সরফ ও নাহু প্রশ্নাবলি - ১ ও ২ নং)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-sans font-bold">
                  মোট ৩০ নম্বর
                </span>
              </h2>
              <p className="text-xs text-emerald-200 font-sans">
                আরবি ২য় পত্রের বিভাগ (أ): ইলমুস সরফ (১০ নম্বর) ও ইলমুন নাহু (২০ নম্বর)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Group Switcher (If multiple groups exist on canvas) */}
        {allGroups.length > 0 && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> পেপারে বিদ্যমান:
            </span>
            {allGroups.map((g, idx) => {
              const isSelected = activeGroupId === g.groupId;
              return (
                <button
                  key={g.groupId}
                  type="button"
                  onClick={() => onSelectGroupId(g.groupId)}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>{g.label || `সেকশন ${idx + 1}`}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onSelectGroupId(null)}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-emerald-700 hover:bg-emerald-50 border border-dashed border-emerald-400 shrink-0 ${
                activeGroupId === null ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          {/* 1. SECTION BANNER TOGGLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-serif">বিভাগ শিরোনাম (Section Header Banner) যুক্ত করুন</span>
              </label>
              <span className="text-[11px] text-slate-500">বড় হেডিং হিসেবে পেপারে প্রিন্ট হবে</span>
            </div>
            {includeBanner && (
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                dir="rtl"
                className="w-full px-3 py-2 text-sm font-serif font-bold border border-slate-300 rounded-xl bg-slate-50/70 text-right focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900"
                placeholder="(أ) القواعد واختبار القواعد : الدرجات - ٥٠"
              />
            )}
          </div>

          {/* 2. QUESTION 1: SARF EDITOR */}
          <SarfQuestionEditor
            includeQ1={includeQ1}
            onToggleInclude={setIncludeQ1}
            q1Number={q1Number}
            onChangeNumber={setQ1Number}
            q1Title={q1Title}
            onChangeTitle={setQ1Title}
            q1MarksFormula={q1MarksFormula}
            onChangeMarksFormula={setQ1MarksFormula}
            q1SubQuestions={q1SubQuestions}
            onChangeSubQuestions={setQ1SubQuestions}
          />

          {/* 3. QUESTION 2: NAHW EDITOR */}
          <NahwQuestionEditor
            includeQ2={includeQ2}
            onToggleInclude={setIncludeQ2}
            q2Number={q2Number}
            onChangeNumber={setQ2Number}
            q2Title={q2Title}
            onChangeTitle={setQ2Title}
            q2MarksFormula={q2MarksFormula}
            onChangeMarksFormula={setQ2MarksFormula}
            q2SubQuestions={q2SubQuestions}
            onChangeSubQuestions={setQ2SubQuestions}
          />
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              নির্বাচিত মোট নম্বর:{' '}
              <strong className="text-emerald-800 text-sm">
                {(includeQ1 ? 10 : 0) + (includeQ2 ? 20 : 0)} / ৩০
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>

            <button
              type="button"
              onClick={() => handleApply(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-2xs font-serif cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditMode ? 'আপডেট ও সংরক্ষণ করুন' : 'পেপারে যোগ করুন'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 rounded-xl transition shadow-md font-serif cursor-pointer"
              title="সরফ ও নাহু পেপারে যোগ করে ৩ নং কাওয়ায়েদ অংশ ওপেন হবে"
            >
              <span>{isEditMode ? 'সংরক্ষণ ও ৩ নং কাওয়ায়েদে যান' : 'যোগ করুন ও ৩ নং কাওয়ায়েদে যান'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
