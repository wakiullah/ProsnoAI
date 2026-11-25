'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  AlimFiqhSectionConfig,
  DEFAULT_ALIM_FIQH_1ST_SECTIONS,
  DEFAULT_ALIM_FIQH_2ND_SECTIONS,
  toArabicNumber,
} from './aqaidFiqhDefaults';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface AlimFiqhGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractAlimFiqhGroups(questions: QuestionData[]): AlimFiqhGroup[] {
  const groups: AlimFiqhGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('alim-fiqh-section') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `আল ফিকহ অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface AlimFiqhBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSecondPaper: boolean; // true => Code 204 (Usul + Faraid), false => Code 203 (Al-Fiqh 1st)
  grade?: string;
  subject?: string;
  allGroups: AlimFiqhGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const AlimFiqhBuilderModal: React.FC<AlimFiqhBuilderModalProps> = ({
  isOpen,
  onClose,
  isSecondPaper,
  grade = 'আলিম ১ম বর্ষ',
  subject,
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const defaultSections = isSecondPaper
    ? DEFAULT_ALIM_FIQH_2ND_SECTIONS
    : DEFAULT_ALIM_FIQH_1ST_SECTIONS;

  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [sections, setSections] = useState<AlimFiqhSectionConfig[]>(defaultSections);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastAddedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastAddedIdRef.current || !containerRef.current) return;
    const targetId = lastAddedIdRef.current;
    lastAddedIdRef.current = null;
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector(
        `[data-af-qid="${targetId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
        if (ta) setTimeout(() => ta.focus(), 180);
      }
    });
  }, [sections]);

  useEffect(() => {
    if (!activeGroup) {
      setSections(defaultSections);
      return;
    }

    const qs = activeGroup.questions;
    const reconstructed: AlimFiqhSectionConfig[] = [];
    let currentSec: AlimFiqhSectionConfig | null = null;
    let secIdx = 0;

    qs.forEach((q, idx) => {
      if (q.groupRole === 'alim_fiqh_banner') {
        const defSec = defaultSections[secIdx] || defaultSections[0];
        const lines = (q.stemOrPassage || '').split('\n').filter((l) => l.trim());
        currentSec = {
          id: q._id || `af_sec_${idx}`,
          headerLines: lines.length > 0 ? lines : defSec.headerLines,
          sectionLabelBn: defSec.sectionLabelBn,
          sectionMarks: q.marks || defSec.sectionMarks,
          questions: [],
        };
        reconstructed.push(currentSec);
        secIdx++;
      } else if (q.groupRole === 'alim_fiqh_item') {
        if (!currentSec) {
          currentSec = {
            ...defaultSections[0],
            questions: [],
          };
          reconstructed.push(currentSec);
        }
        const bnSub = q.subQuestions?.[0];
        const hasBn = Boolean(bnSub && bnSub.questionText?.trim());
        currentSec.questions.push({
          id: q._id || `af_q_${idx}`,
          arabicText: q.stemOrPassage || '',
          arabicPlaceholder: 'আরবি প্রশ্নটি এখানে লিখুন...',
          includeBengali: hasBn,
          bengaliText: hasBn ? bnSub!.questionText : '',
          bengaliPlaceholder: 'এই প্রশ্নের বাংলা অনুবাদ এখানে লিখুন...',
        });
      }
    });

    if (reconstructed.length > 0) {
      setSections(reconstructed);
    }
  }, [activeGroup, defaultSections]);

  const allHaveBengali = useMemo(() => {
    const allQs = sections.flatMap((s) => s.questions);
    return allQs.length > 0 && allQs.every((q) => q.includeBengali);
  }, [sections]);

  const totalQuestions = useMemo(
    () => sections.reduce((acc, s) => acc + s.questions.length, 0),
    [sections]
  );

  if (!isOpen) return null;

  const handleToggleAllBengali = (checked: boolean) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => ({ ...q, includeBengali: checked })),
      }))
    );
  };

  const handleUpdateHeaderLine = (sIdx: number, lIdx: number, val: string) => {
    const next = [...sections];
    const lines = [...next[sIdx].headerLines];
    lines[lIdx] = val;
    next[sIdx] = { ...next[sIdx], headerLines: lines };
    setSections(next);
  };

  const handleUpdateQuestion = (
    sIdx: number,
    qIdx: number,
    patch: Partial<AlimFiqhSectionConfig['questions'][number]>
  ) => {
    const next = [...sections];
    const qs = [...next[sIdx].questions];
    qs[qIdx] = { ...qs[qIdx], ...patch };
    next[sIdx] = { ...next[sIdx], questions: qs };
    setSections(next);
  };

  const handleAddQuestion = (sIdx: number) => {
    const newId = `af_q_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    lastAddedIdRef.current = newId;
    const next = [...sections];
    next[sIdx] = {
      ...next[sIdx],
      questions: [
        ...next[sIdx].questions,
        {
          id: newId,
          arabicText: '',
          arabicPlaceholder: 'নতুন আরবি প্রশ্নটি এখানে লিখুন...',
          includeBengali: allHaveBengali,
          bengaliText: '',
          bengaliPlaceholder: 'এই প্রশ্নের বাংলা অনুবাদ এখানে লিখুন...',
        },
      ],
    };
    setSections(next);
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    const next = [...sections];
    next[sIdx] = {
      ...next[sIdx],
      questions: next[sIdx].questions.filter((_, i) => i !== qIdx),
    };
    setSections(next);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];
    let seq = 1;
    const subjName =
      subject || (isSecondPaper ? 'আল ফিকহ দ্বিতীয় পত্র' : 'আল ফিকহ প্রথম পত্র');

    sections.forEach((sec) => {
      const cleanLines = sec.headerLines.map((l) => l.trim()).filter(Boolean);
      if (cleanLines.length > 0) {
        list.push({
          groupId: targetGroupId,
          groupRole: 'alim_fiqh_banner',
          subject: subjName,
          grade,
          typology: 'GROUP_TITLE',
          customNumber: '',
          stemOrPassage: cleanLines.join('\n'),
          customMarksText: '',
          marks: sec.sectionMarks,
          difficulty: 'Easy',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      sec.questions.forEach((q) => {
        const bnVal = q.includeBengali ? q.bengaliText.trim() : '';
        list.push({
          groupId: targetGroupId,
          groupRole: 'alim_fiqh_item',
          subject: subjName,
          grade,
          typology: 'DESCRIPTIVE',
          customNumber: `${toArabicNumber(seq)}.`,
          stemOrPassage: q.arabicText.trim(),
          customMarksText: '',
          subQuestions:
            q.includeBengali && bnVal
              ? [
                  {
                    part: 'bn' as any,
                    bloomLevel: 'comprehension',
                    bloomTitle: 'বাংলা অনুবাদ',
                    questionText: bnVal,
                    marks: 0,
                  },
                ]
              : undefined,
          marks: 0,
          difficulty: 'Medium',
          languages: q.includeBengali ? ['ar', 'bn'] : ['ar'],
          sourceType: 'MANUAL',
        });
        seq++;
      });
    });

    return list;
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `alim-fiqh-section-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  let runningSeq = 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  {isSecondPaper
                    ? 'আল ফিকহ ২য় পত্র (আলিম — কোড: ২০৪) বিল্ডার'
                    : 'আল ফিকহ ১ম পত্র (আলিম — কোড: ২০৩) বিল্ডার'}
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  পূর্ণমান: ১০০ ({toBengaliNumber(totalQuestions)}টি প্রশ্ন)
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                {isSecondPaper
                  ? 'أصول الفقه (৬০) + الفرائض (أ: ৩০, ب: ১০) • প্রতিটি প্রশ্নে ঐচ্ছিক বাংলা অনুবাদ যুক্ত করা যাবে'
                  : 'আরবি ফিকহ প্রশ্নাবলি (যেকোনো ৫টি = ১০০) • প্রতিটি প্রশ্নে ঐচ্ছিক বাংলা অনুবাদ যুক্ত করা যাবে'}
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

        {/* Sub-Toolbar: Global Bilingual Toggle */}
        <div className="bg-indigo-50/80 border-b border-indigo-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <label className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allHaveBengali}
              onChange={(e) => handleToggleAllBengali(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <Languages className="w-4 h-4 text-indigo-700" />
            <span>সকল আরবি প্রশ্নের নিচে বাংলা অনুবাদ যুক্ত করুন</span>
          </label>
          <span className="text-[11px] text-indigo-800 font-semibold">
            অথবা নিচে প্রতিটি প্রশ্নে আলাদাভাবে চেকমার্ক দিন
          </span>
        </div>

        {/* Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50"
        >
          {sections.map((sec, sIdx) => (
            <div
              key={sec.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3"
            >
              {/* Section Arabic Header Lines */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-2">
                <div className="text-xs font-extrabold text-emerald-950">
                  {sec.sectionLabelBn}
                </div>
                <div className="space-y-1.5">
                  {sec.headerLines.map((line, lIdx) => (
                    <input
                      key={lIdx}
                      type="text"
                      dir="rtl"
                      value={line}
                      onChange={(e) =>
                        handleUpdateHeaderLine(sIdx, lIdx, e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-sm font-serif font-bold text-center rounded-lg border border-emerald-200 bg-white outline-none focus:border-emerald-600"
                    />
                  ))}
                </div>
              </div>

              {/* Questions inside this section */}
              <div className="space-y-3">
                {sec.questions.map((q, qIdx) => {
                  const numAr = toArabicNumber(runningSeq);
                  const numBn = toBengaliNumber(runningSeq);
                  runningSeq++;

                  return (
                    <div
                      key={q.id}
                      data-af-qid={q.id}
                      className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800 text-white text-xs font-extrabold">
                            প্রশ্ন {numBn} ({numAr}.)
                          </span>

                          {/* Per-Question Bengali Translation Checkbox */}
                          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-900 cursor-pointer hover:bg-indigo-50 transition select-none">
                            <input
                              type="checkbox"
                              checked={q.includeBengali}
                              onChange={(e) =>
                                handleUpdateQuestion(sIdx, qIdx, {
                                  includeBengali: e.target.checked,
                                })
                              }
                              className="w-3.5 h-3.5 rounded text-indigo-600"
                            />
                            <span>বাংলা অনুবাদ যুক্ত করুন</span>
                          </label>
                        </div>

                        {sec.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="প্রশ্নটি মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Arabic Question Input (RTL) */}
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={q.arabicText}
                        onChange={(e) =>
                          handleUpdateQuestion(sIdx, qIdx, {
                            arabicText: e.target.value,
                          })
                        }
                        placeholder={q.arabicPlaceholder}
                        className="w-full px-3 py-2 text-sm font-serif rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed text-right"
                      />

                      {/* Optional Bengali Translation Input (Next Line on Canvas) */}
                      {q.includeBengali && (
                        <div className="pl-2.5 border-l-2 border-indigo-400 space-y-1">
                          <label className="text-[11px] font-bold text-indigo-800 block">
                            বাংলা অনুবাদ (প্রশ্নপত্রে আরবির ঠিক পরের লাইনে বসবে):
                          </label>
                          <textarea
                            rows={2}
                            dir="ltr"
                            value={q.bengaliText}
                            onChange={(e) =>
                              handleUpdateQuestion(sIdx, qIdx, {
                                bengaliText: e.target.value,
                              })
                            }
                            placeholder={q.bengaliPlaceholder}
                            className="w-full px-3 py-1.5 text-xs sm:text-[13px] rounded-xl border border-indigo-200 bg-white outline-none focus:border-indigo-500 leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleAddQuestion(sIdx)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ এই বিভাগে আরও ১টি প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSections(defaultSections)}
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
                ? `পেপারে আল ফিকহ প্রশ্নাবলি আপডেট করুন (১০০ নম্বর)`
                : `পেপারে আল ফিকহ প্রশ্নাবলি যোগ করুন (১০০ নম্বর)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
