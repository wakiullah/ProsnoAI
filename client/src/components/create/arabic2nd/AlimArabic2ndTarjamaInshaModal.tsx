'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  DEFAULT_ALIM_AR2_Q12_PLACEHOLDERS,
  DEFAULT_ALIM_AR2_Q13_PLACEHOLDERS,
  DEFAULT_ALIM_AR2_Q14_PLACEHOLDERS,
  DEFAULT_ALIM_AR2_Q15_PLACEHOLDERS,
  DEFAULT_ALIM_AR2_Q16_PLACEHOLDERS,
} from './alimArabic2ndDefaults';

export interface AlimAr2TarjamaInshaGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractAlimAr2TarjamaInshaGroups(
  questions: QuestionData[]
): AlimAr2TarjamaInshaGroup[] {
  const groups: AlimAr2TarjamaInshaGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('alim-ar2-tarjama') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `(ج) الترجمة والإنشاء অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

interface AlimArabic2ndTarjamaInshaModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: AlimAr2TarjamaInshaGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const AlimArabic2ndTarjamaInshaModal: React.FC<
  AlimArabic2ndTarjamaInshaModalProps
> = ({
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

  const [sectionTitle, setSectionTitle] = useState('(ج) الترجمة والإنشاء');
  const [sectionMarksLine, setSectionMarksLine] = useState('الدرجة—٥٠');

  // Q12: Arabic -> Bengali (2 passages)
  const [q12Title, setQ12Title] = useState('حوّل إلى اللغة البنغالية (واحدًا فقط) :');
  const [q12Marks, setQ12Marks] = useState('١٠ = ١ × ١٠');
  const [q12Passages, setQ12Passages] = useState<[string, string]>(['', '']);

  // Q13: Bengali -> Arabic (2 passages)
  const [q13Title, setQ13Title] = useState('حوّل إلى اللغة العربية (واحدًا فقط) :');
  const [q13Marks, setQ13Marks] = useState('١٠ = ١ × ١٠');
  const [q13Passages, setQ13Passages] = useState<[string, string]>(['', '']);

  // Q14: Sentence Correction (7 sentences)
  const [q14Title, setQ14Title] = useState('صحح الجمل التالية (خمسة فقط) :');
  const [q14Marks, setQ14Marks] = useState('٥ = ٥ × ١');
  const [q14Sentences, setQ14Sentences] = useState<string[]>(['', '', '', '', '', '', '']);

  // Q15: Application / Letter
  const [q15Marks, setQ15Marks] = useState('١٠');
  const [q15Option1, setQ15Option1] = useState('');
  const [q15Option2, setQ15Option2] = useState('');

  // Q16: Essay Writing
  const [q16Title, setQ16Title] = useState(
    'اكتب مقالة بالعربية على واحد من الموضوعات التالية :'
  );
  const [q16Marks, setQ16Marks] = useState('١٥ = ١ × ١٥');
  const [q16Topics, setQ16Topics] = useState<string[]>(['', '', '']);

  const resetDefaults = () => {
    setSectionTitle('(ج) الترجمة والإنشاء');
    setSectionMarksLine('الدرجة—٥٠');
    setQ12Title('حوّل إلى اللغة البنغالية (واحدًا فقط) :');
    setQ12Marks('١٠ = ١ × ١٠');
    setQ12Passages(['', '']);
    setQ13Title('حوّل إلى اللغة العربية (واحدًا فقط) :');
    setQ13Marks('١٠ = ١ × ١٠');
    setQ13Passages(['', '']);
    setQ14Title('صحح الجمل التالية (خمسة فقط) :');
    setQ14Marks('٥ = ٥ × ١');
    setQ14Sentences(['', '', '', '', '', '', '']);
    setQ15Marks('١٠');
    setQ15Option1('');
    setQ15Option2('');
    setQ16Title('اكتب مقالة بالعربية على واحد من الموضوعات التالية :');
    setQ16Marks('١٥ = ١ × ١٥');
    setQ16Topics(['', '', '']);
  };

  useEffect(() => {
    if (!activeGroup) {
      resetDefaults();
      return;
    }

    const qs = activeGroup.questions;
    const banner = qs.find((q) => q.groupRole === 'alim_ar2_banner');
    if (banner) {
      const lines = (banner.stemOrPassage || '').split('\n');
      setSectionTitle(lines[0] || '(ج) الترجمة والإنشاء');
      setSectionMarksLine(lines[1] || 'الدرجة—٥٠');
    }

    const q12 = qs.find((q) => q.groupRole === 'alim_ar2_q12_ar_bn');
    if (q12) {
      setQ12Title(q12.stemOrPassage || 'حوّل إلى اللغة البنغالية (واحدًا فقط) :');
      setQ12Marks(q12.customMarksText || '١٠ = ١ × ١٠');
      setQ12Passages([
        q12.subQuestions?.[0]?.questionText || '',
        q12.subQuestions?.[1]?.questionText || '',
      ]);
    }

    const q13 = qs.find((q) => q.groupRole === 'alim_ar2_q13_bn_ar');
    if (q13) {
      setQ13Title(q13.stemOrPassage || 'حوّل إلى اللغة العربية (واحدًا فقط) :');
      setQ13Marks(q13.customMarksText || '١٠ = ١ × ١٠');
      setQ13Passages([
        q13.subQuestions?.[0]?.questionText || '',
        q13.subQuestions?.[1]?.questionText || '',
      ]);
    }

    const q14 = qs.find((q) => q.groupRole === 'alim_ar2_q14_correct');
    if (q14) {
      setQ14Title(q14.stemOrPassage || 'صحح الجمل التالية (خمسة فقط) :');
      setQ14Marks(q14.customMarksText || '٥ = ٥ × ١');
      const list = (q14.subQuestions || []).map((s) => s.questionText || '');
      if (list.length > 0) setQ14Sentences(list);
    }

    const q15 = qs.find((q) => q.groupRole === 'alim_ar2_q15_letter');
    if (q15) {
      setQ15Marks(q15.customMarksText || '١٠');
      setQ15Option1(q15.subQuestions?.[0]?.questionText || '');
      setQ15Option2(q15.subQuestions?.[1]?.questionText || '');
    }

    const q16 = qs.find((q) => q.groupRole === 'alim_ar2_q16_essay');
    if (q16) {
      setQ16Title(
        q16.stemOrPassage || 'اكتب مقالة بالعربية على واحد من الموضوعات التالية :'
      );
      setQ16Marks(q16.customMarksText || '١٥ = ١ × ١٥');
      const list = (q16.subQuestions || []).map((s) => s.questionText || '');
      if (list.length > 0) setQ16Topics(list);
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    return [
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_banner',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: `${sectionTitle.trim()}\n${sectionMarksLine.trim()}`,
        customMarksText: '',
        marks: 0,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
      // Q12: Arabic -> Bengali (2 passages)
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_q12_ar_bn',
        subject,
        grade,
        typology: 'TARJAMA_TASHREEH',
        customNumber: '١٢-',
        stemOrPassage: q12Title.trim(),
        customMarksText: q12Marks.trim(),
        subQuestions: [
          {
            part: 'أ' as any,
            bloomLevel: 'application',
            bloomTitle: 'ar',
            questionText: q12Passages[0].trim(),
            marks: 10,
          },
          {
            part: 'ب' as any,
            bloomLevel: 'application',
            bloomTitle: 'ar',
            questionText: q12Passages[1].trim(),
            marks: 10,
          },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
      // Q13: Bengali -> Arabic (2 passages)
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_q13_bn_ar',
        subject,
        grade,
        typology: 'TARJAMA_TASHREEH',
        customNumber: '١٣-',
        stemOrPassage: q13Title.trim(),
        customMarksText: q13Marks.trim(),
        subQuestions: [
          {
            part: 'أ' as any,
            bloomLevel: 'application',
            bloomTitle: 'bn',
            questionText: q13Passages[0].trim(),
            marks: 10,
          },
          {
            part: 'ب' as any,
            bloomLevel: 'application',
            bloomTitle: 'bn',
            questionText: q13Passages[1].trim(),
            marks: 10,
          },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar', 'bn'],
        sourceType: 'MANUAL',
      },
      // Q14: Sentence Correction (صحح الجمل التالية)
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_q14_correct',
        subject,
        grade,
        typology: 'PASSAGE_QA',
        customNumber: '١٤-',
        stemOrPassage: q14Title.trim(),
        customMarksText: q14Marks.trim(),
        subQuestions: q14Sentences.map((s, idx) => ({
          part: (ARABIC_LETTERS[idx] || 'أ') as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: s.trim(),
          marks: 1,
        })),
        marks: 5,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
      // Q15: Application / Letter
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_q15_letter',
        subject,
        grade,
        typology: 'DESCRIPTIVE',
        customNumber: '١٥-',
        stemOrPassage: '',
        customMarksText: q15Marks.trim(),
        subQuestions: [
          {
            part: 'أ' as any,
            bloomLevel: 'higher_order',
            bloomTitle: '',
            questionText: q15Option1.trim(),
            marks: 10,
          },
          {
            part: 'ب' as any,
            bloomLevel: 'higher_order',
            bloomTitle: 'أو',
            questionText: q15Option2.trim(),
            marks: 10,
          },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
      // Q16: Essay Writing
      {
        groupId: targetGroupId,
        groupRole: 'alim_ar2_q16_essay',
        subject,
        grade,
        typology: 'PASSAGE_QA',
        customNumber: '١٦-',
        stemOrPassage: q16Title.trim(),
        customMarksText: q16Marks.trim(),
        subQuestions: q16Topics.map((t, idx) => ({
          part: (ARABIC_LETTERS[idx] || 'أ') as any,
          bloomLevel: 'higher_order',
          bloomTitle: '',
          questionText: t.trim(),
          marks: 15,
        })),
        marks: 15,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      },
    ];
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `alim-ar2-tarjama-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-teal-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  আলিম আরবি ২য় পত্র — (ج) الترجمة والإنشاء (১২–১৬ নং : ৫০ নম্বর)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  পূর্ণমান: ৫০
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5 truncate">
                ১২. আরবি→বাংলা (১০) • ১৩. বাংলা→আরবি (১০) • ১৪. বাক্য শুদ্ধিকরণ (৫) • ১৫. দরখাস্ত/চিঠি (১০) • ১৬. প্রবন্ধ (১৫)
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Q12: Arabic to Bengali Passage Translation (10) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-extrabold">
                প্রশ্ন ١٢- : আরবি থেকে বাংলা অনুবাদ (২টি অনুচ্ছেদ → যেকোনো ১টি)
              </span>
              <input
                type="text"
                dir="rtl"
                value={q12Marks}
                onChange={(e) => setQ12Marks(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <input
              type="text"
              dir="rtl"
              value={q12Title}
              onChange={(e) => setQ12Title(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-serif font-bold text-right rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
            />

            {[0, 1].map((pIdx) => (
              <div key={pIdx} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  অনুচ্ছেদ ({ARABIC_LETTERS[pIdx]}) — আরবি:
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={q12Passages[pIdx]}
                  onChange={(e) => {
                    const next: [string, string] = [...q12Passages] as any;
                    next[pIdx] = e.target.value;
                    setQ12Passages(next);
                  }}
                  placeholder={DEFAULT_ALIM_AR2_Q12_PLACEHOLDERS[pIdx]}
                  className="w-full px-3 py-2 text-sm font-serif text-right rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            ))}
          </div>

          {/* Q13: Bengali to Arabic Passage Translation (10) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-700 text-white text-xs font-extrabold">
                প্রশ্ন ١٣- : বাংলা থেকে আরবি অনুবাদ (২টি বাংলা অনুচ্ছেদ → যেকোনো ১টি)
              </span>
              <input
                type="text"
                dir="rtl"
                value={q13Marks}
                onChange={(e) => setQ13Marks(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <input
              type="text"
              dir="rtl"
              value={q13Title}
              onChange={(e) => setQ13Title(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-serif font-bold text-right rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-indigo-500"
            />

            {[0, 1].map((pIdx) => (
              <div key={pIdx} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  অনুচ্ছেদ ({ARABIC_LETTERS[pIdx]}) — বাংলা:
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={q13Passages[pIdx]}
                  onChange={(e) => {
                    const next: [string, string] = [...q13Passages] as any;
                    next[pIdx] = e.target.value;
                    setQ13Passages(next);
                  }}
                  placeholder={DEFAULT_ALIM_AR2_Q13_PLACEHOLDERS[pIdx]}
                  className="w-full px-3 py-2 text-xs sm:text-[13px] rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            ))}
          </div>

          {/* Q14: Sentence Correction (صحح الجمل التالية : 5) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-lg bg-amber-700 text-white text-xs font-extrabold">
                প্রশ্ন ١٤- : বাক্য শুদ্ধিকরণ (صحح الجمل التالية — যেকোনো ৫টি)
              </span>
              <input
                type="text"
                dir="rtl"
                value={q14Marks}
                onChange={(e) => setQ14Marks(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <input
              type="text"
              dir="rtl"
              value={q14Title}
              onChange={(e) => setQ14Title(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-serif font-bold text-right rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-amber-500"
            />

            <div className="space-y-1.5">
              {q14Sentences.map((s, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0">
                    ({ARABIC_LETTERS[sIdx] || 'أ'})
                  </span>
                  <input
                    type="text"
                    dir="rtl"
                    value={s}
                    onChange={(e) => {
                      const next = [...q14Sentences];
                      next[sIdx] = e.target.value;
                      setQ14Sentences(next);
                    }}
                    placeholder={
                      DEFAULT_ALIM_AR2_Q14_PLACEHOLDERS[sIdx] ||
                      'অশুদ্ধ আরবি বাক্য লিখুন...'
                    }
                    className="flex-1 px-3 py-1.5 text-sm font-serif text-right rounded-lg border border-slate-200 bg-white outline-none focus:border-amber-500"
                  />
                  {q14Sentences.length > 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQ14Sentences(q14Sentences.filter((_, i) => i !== sIdx))
                      }
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {q14Sentences.length < 10 && (
                <button
                  type="button"
                  onClick={() => setQ14Sentences([...q14Sentences, ''])}
                  className="flex items-center gap-1 text-xs font-bold text-amber-800 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ আরও বাক্য যোগ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Q15: Application / Letter (10) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-xs font-extrabold">
                প্রশ্ন ١٥- : দরখাস্ত অথবা চিঠি (عريضة أو رسالة — ১০ নম্বর)
              </span>
              <input
                type="text"
                dir="rtl"
                value={q15Marks}
                onChange={(e) => setQ15Marks(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <textarea
              rows={2}
              dir="rtl"
              value={q15Option1}
              onChange={(e) => setQ15Option1(e.target.value)}
              placeholder={DEFAULT_ALIM_AR2_Q15_PLACEHOLDERS[0]}
              className="w-full px-3 py-2 text-sm font-serif text-right rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-500"
            />
            <div className="text-center text-xs font-extrabold text-amber-800">أو</div>
            <textarea
              rows={2}
              dir="rtl"
              value={q15Option2}
              onChange={(e) => setQ15Option2(e.target.value)}
              placeholder={DEFAULT_ALIM_AR2_Q15_PLACEHOLDERS[1]}
              className="w-full px-3 py-2 text-sm font-serif text-right rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-500"
            />
          </div>

          {/* Q16: Essay Writing (15) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-xs font-extrabold">
                প্রশ্ন ١٦- : আরবি প্রবন্ধ রচনা (مقالة بالعربية — ১৫ নম্বর)
              </span>
              <input
                type="text"
                dir="rtl"
                value={q16Marks}
                onChange={(e) => setQ16Marks(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <input
              type="text"
              dir="rtl"
              value={q16Title}
              onChange={(e) => setQ16Title(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-serif font-bold text-right rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-purple-500"
            />

            <div className="space-y-1.5">
              {q16Topics.map((topic, tIdx) => (
                <div key={tIdx} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0">
                    ({ARABIC_LETTERS[tIdx] || 'أ'})
                  </span>
                  <input
                    type="text"
                    dir="rtl"
                    value={topic}
                    onChange={(e) => {
                      const next = [...q16Topics];
                      next[tIdx] = e.target.value;
                      setQ16Topics(next);
                    }}
                    placeholder={
                      DEFAULT_ALIM_AR2_Q16_PLACEHOLDERS[tIdx] ||
                      'প্রবন্ধের শিরোনাম আরবিতে লিখুন...'
                    }
                    className="flex-1 px-3 py-1.5 text-sm font-serif text-right rounded-lg border border-slate-200 bg-white outline-none focus:border-purple-500"
                  />
                  {q16Topics.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQ16Topics(q16Topics.filter((_, i) => i !== tIdx))
                      }
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {q16Topics.length < 5 && (
                <button
                  type="button"
                  onClick={() => setQ16Topics([...q16Topics, ''])}
                  className="flex items-center gap-1 text-xs font-bold text-purple-800 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ আরও প্রবন্ধের বিষয় যোগ করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={resetDefaults}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট বোর্ড কাঠামোতে রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEditMode
                ? 'পেপারে (ج) الترجمة والإنشاء আপডেট করুন'
                : 'পেপারে (ج) الترجمة والإنشاء যোগ করুন (৫০ নম্বর)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
