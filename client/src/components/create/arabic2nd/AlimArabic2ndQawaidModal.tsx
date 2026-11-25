'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  AlimQawaidQuestionItem,
  DEFAULT_ALIM_AR2_QAWAID_QUESTIONS,
} from './alimArabic2ndDefaults';
import { toArabicNumber } from '../aqaidFiqh/aqaidFiqhDefaults';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface AlimAr2QawaidGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractAlimAr2QawaidGroups(
  questions: QuestionData[]
): AlimAr2QawaidGroup[] {
  const groups: AlimAr2QawaidGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('alim-ar2-qawaid') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `(أ) القواعد অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface AlimArabic2ndQawaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: AlimAr2QawaidGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    proceedToIkhtibar?: boolean
  ) => void;
}

export const AlimArabic2ndQawaidModal: React.FC<AlimArabic2ndQawaidModalProps> = ({
  isOpen,
  onClose,
  grade = 'الصف الثاني من العالم',
  subject = 'الأدب العربي (الورقة الثانية)',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [sectionTitle, setSectionTitle] = useState('(أ) القواعد');
  const [sectionMarksLine, setSectionMarksLine] = useState('الدرجة—٣٥');
  const [instructionText, setInstructionText] = useState(
    'أجب عن سبعة فقط والدرجة متساوية :'
  );
  const [marksFormula, setMarksFormula] = useState('٣٥ = ٧ × ٥');
  const [items, setItems] = useState<AlimQawaidQuestionItem[]>(
    DEFAULT_ALIM_AR2_QAWAID_QUESTIONS
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastAddedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastAddedIdRef.current || !containerRef.current) return;
    const targetId = lastAddedIdRef.current;
    lastAddedIdRef.current = null;
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector(
        `[data-aa2-qid="${targetId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input') as HTMLInputElement | null;
        if (input) setTimeout(() => input.focus(), 180);
      }
    });
  }, [items]);

  useEffect(() => {
    if (!activeGroup) {
      setSectionTitle('(أ) القواعد');
      setSectionMarksLine('الدرجة—٣٥');
      setInstructionText('أجب عن سبعة فقط والدرجة متساوية :');
      setMarksFormula('٣٥ = ٧ × ٥');
      setItems(DEFAULT_ALIM_AR2_QAWAID_QUESTIONS);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find((q) => q.groupRole === 'alim_ar2_banner');
    if (bannerQ) {
      const lines = (bannerQ.stemOrPassage || '').split('\n');
      setSectionTitle(lines[0] || '(أ) القواعد');
      setSectionMarksLine(lines[1] || 'الدرجة—٣٥');
    }

    const instrQ = qs.find((q) => q.groupRole === 'alim_ar2_qawaid_instr');
    if (instrQ) {
      setInstructionText(instrQ.stemOrPassage || 'أجب عن سبعة فقط والدرجة متساوية :');
      setMarksFormula(instrQ.customMarksText || '٣٥ = ٧ × ٥');
    }

    const qItems = qs.filter((q) => q.groupRole === 'alim_ar2_qawaid_item');
    if (qItems.length > 0) {
      setItems(
        qItems.map((q, idx) => ({
          id: q._id || `aa2_q_${idx}`,
          text: q.stemOrPassage || '',
          placeholder:
            DEFAULT_ALIM_AR2_QAWAID_QUESTIONS[idx]?.placeholder ||
            'প্রশ্নটি আরবিতে লিখুন...',
        }))
      );
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const newId = `aa2_q_${Date.now()}`;
    lastAddedIdRef.current = newId;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        text: '',
        placeholder: 'নতুন আরবি ব্যাকরণ প্রশ্ন লিখুন...',
      },
    ]);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_banner',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: `${sectionTitle.trim()}\n${sectionMarksLine.trim()}`,
        customMarksText: '',
        marks: 35,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_qawaid_instr',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: instructionText.trim(),
        customMarksText: marksFormula.trim(),
        marks: 0,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
    ];

    items.forEach((it, idx) => {
      list.push({
        groupId: targetGroupId,
        groupRole: 'alim_ar2_qawaid_item',
        subject,
        grade,
        typology: 'DESCRIPTIVE',
        customNumber: `${toArabicNumber(idx + 1)}-`,
        stemOrPassage: it.text.trim(),
        customMarksText: '',
        marks: 0,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    });

    return list;
  };

  const handleApply = (proceedToIkhtibar = false) => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `alim-ar2-qawaid-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId, proceedToIkhtibar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  আলিম আরবি ২য় পত্র — (أ) القواعد (১–১০ নং প্রশ্ন : ৩৫ নম্বর)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  {toBengaliNumber(items.length)}টি প্রশ্ন থেকে ৭টি (৫×৭=৩৫)
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                বিষয় কোড: ২০৬ • নাহু ও সরফ মিলিয়ে ১০টি স্বতন্ত্র আরবি প্রশ্ন (١- থেকে ١٠-)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3.5 bg-slate-50/50"
        >
          {/* Section Banner & Instruction */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  বিভাগ শিরোনাম (আরবি):
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-serif font-bold text-center rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  বিভাগের মোট নম্বর:
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={sectionMarksLine}
                  onChange={(e) => setSectionMarksLine(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-serif font-bold text-center rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  নির্দেশনা:
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-serif font-bold text-right rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  মান বণ্টন সূত্র:
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={marksFormula}
                  onChange={(e) => setMarksFormula(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-serif font-bold text-center rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 10 Standalone Questions (١- to ١٠-) */}
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                data-aa2-qid={item.id}
                className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs"
              >
                <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-extrabold shrink-0">
                  {toArabicNumber(idx + 1)}-
                </span>
                <input
                  type="text"
                  dir="rtl"
                  value={item.text}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setItems(next);
                  }}
                  placeholder={item.placeholder}
                  className="flex-1 px-3 py-1.5 text-sm font-serif text-right rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-emerald-500"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                    title="প্রশ্নটি মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ আরও একটি আরবি ব্যাকরণ প্রশ্ন যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_ALIM_AR2_QAWAID_QUESTIONS)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট ১০টি প্রশ্নে রিসেট</span>
          </button>

          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApply(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isEditMode
                  ? 'পেপারে (أ) القواعد আপডেট করুন'
                  : 'পেপারে (أ) القواعد যোগ করুন (৩৫ নম্বর)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-xs font-extrabold shadow-sm transition"
            >
              <span>সেভ ও (ب) اختبار القواعد (১৫ নম্বর) অংশে যান</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
