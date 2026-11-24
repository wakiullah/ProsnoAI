'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  Bangla2ndSscWrittenItemConfig,
  BENGALI_OPTION_LETTERS,
  DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS,
} from './bangla2ndDefaults';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface Bangla2ndSscWrittenGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractBangla2ndSscWrittenGroups(
  questions: QuestionData[]
): Bangla2ndSscWrittenGroup[] {
  const groups: Bangla2ndSscWrittenGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('bangla2nd-ssc-written') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `রচনামূলক অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface Bangla2ndSscWrittenModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: Bangla2ndSscWrittenGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const Bangla2ndSscWrittenModal: React.FC<Bangla2ndSscWrittenModalProps> = ({
  isOpen,
  onClose,
  grade = '১০ম শ্রেণি (এসএসসি)',
  subject = 'বাংলা ২য় পত্র',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [includeSectionBanner, setIncludeSectionBanner] = useState(true);
  const [bannerTitle, setBannerTitle] = useState('রচনামূলক প্রশ্ন (পূর্ণমান: ৭০)');
  const [items, setItems] = useState<Bangla2ndSscWrittenItemConfig[]>(
    DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS
  );

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeGroup) {
      setIncludeSectionBanner(true);
      setBannerTitle('রচনামূলক প্রশ্ন (পূর্ণমান: ৭০)');
      setItems(DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find(
      (q) => q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE'
    );
    if (bannerQ) {
      setIncludeSectionBanner(true);
      setBannerTitle(bannerQ.stemOrPassage || 'রচনামূলক প্রশ্ন (পূর্ণমান: ৭০)');
    } else {
      setIncludeSectionBanner(false);
    }

    const questionItems = qs.filter(
      (q) => q.typology !== 'GROUP_TITLE' && q.typology !== 'SECTION_TITLE'
    );
    if (questionItems.length > 0) {
      const hydrated: Bangla2ndSscWrittenItemConfig[] = questionItems.map((q, idx) => {
        const def =
          DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS[idx] ||
          DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS[0];
        const isSarangsho = q.groupRole === 'bangla2nd_ssc_sarangsho';
        const useAthaba =
          q.groupRole === 'bangla2nd_ssc_athaba' || isSarangsho;
        const subs = q.subQuestions || [];

        if (isSarangsho) {
          return {
            ...def,
            id: q._id || `b2_ssc_${idx + 1}`,
            kind: 'SARANGSHO_SARMORMO',
            marks: q.marks || 10,
            stemTitle: '',
            partKaHeading: subs[0]?.bloomTitle || 'সারাংশ লেখ :',
            partKhaHeading: subs[1]?.bloomTitle || 'সারমর্ম লেখ :',
            useAthabaPrefix: true,
            options: [subs[0]?.questionText || '', subs[1]?.questionText || ''],
          };
        }

        return {
          ...def,
          id: q._id || `b2_ssc_${idx + 1}`,
          marks: q.marks || def.marks,
          stemTitle: q.stemOrPassage || def.stemTitle,
          useAthabaPrefix: useAthaba,
          options:
            subs.length > 0
              ? subs.map((sq) => sq.questionText || '')
              : def.options,
        };
      });
      setItems(hydrated);
    }
  }, [activeGroup]);

  const totalMarks = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.marks) || 0), 0),
    [items]
  );

  if (!isOpen) return null;

  const handleUpdateItem = (
    idx: number,
    patch: Partial<Bangla2ndSscWrittenItemConfig>
  ) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const cur = [...items[qIdx].options];
    cur[optIdx] = val;
    handleUpdateItem(qIdx, { options: cur });
  };

  const handleAddOption = (qIdx: number) => {
    const cur = [...items[qIdx].options, ''];
    handleUpdateItem(qIdx, { options: cur });
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const cur = items[qIdx].options.filter((_, i) => i !== optIdx);
    handleUpdateItem(qIdx, { options: cur });
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    if (includeSectionBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'bangla2nd_ssc_banner',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: bannerTitle.trim(),
        customMarksText: '',
        marks: 0,
        difficulty: 'Easy',
        languages: ['bn'],
        sourceType: 'MANUAL',
      });
    }

    items.forEach((it, idx) => {
      const qNumStr = `${toBengaliNumber(idx + 1)}।`;
      const marksStr = toBengaliNumber(it.marks);

      if (it.kind === 'SARANGSHO_SARMORMO') {
        list.push({
          groupId: targetGroupId,
          groupRole: 'bangla2nd_ssc_sarangsho',
          subject,
          grade,
          typology: 'DESCRIPTIVE',
          customNumber: qNumStr,
          stemOrPassage: '',
          customMarksText: marksStr,
          subQuestions: [
            {
              part: 'ক' as any,
              bloomLevel: 'comprehension',
              bloomTitle: (it.partKaHeading || 'সারাংশ লেখ :').trim(),
              questionText: it.options[0]?.trim() || '',
              marks: it.marks,
            },
            {
              part: 'খ' as any,
              bloomLevel: 'comprehension',
              bloomTitle: (it.partKhaHeading || 'সারমর্ম লেখ :').trim(),
              questionText: it.options[1]?.trim() || '',
              marks: it.marks,
            },
          ],
          marks: it.marks,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });
      } else {
        list.push({
          groupId: targetGroupId,
          groupRole: it.useAthabaPrefix
            ? 'bangla2nd_ssc_athaba'
            : 'bangla2nd_ssc_choices',
          subject,
          grade,
          typology: 'DESCRIPTIVE',
          customNumber: qNumStr,
          stemOrPassage: it.stemTitle.trim(),
          customMarksText: marksStr,
          subQuestions: it.options.map((optText, oIdx) => ({
            part: (BENGALI_OPTION_LETTERS[oIdx] || 'ক') as any,
            bloomLevel: 'application',
            bloomTitle:
              it.useAthabaPrefix && oIdx > 0
                ? `অথবা, (${BENGALI_OPTION_LETTERS[oIdx]})`
                : `(${BENGALI_OPTION_LETTERS[oIdx]})`,
            questionText: optText.trim(),
            marks: 0,
          })),
          marks: it.marks,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });
      }
    });

    return list;
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `bangla2nd-ssc-written-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  const kindLabels: Record<string, string> = {
    ANUCHCHED: 'অনুচ্ছেদ রচনা',
    PATRA_DARKHASTA: 'পত্র / আবেদনপত্র',
    SARANGSHO_SARMORMO: 'সারাংশ ও সারমর্ম',
    BHAB_SAMPRASARAN: 'ভাব-সম্প্রসারণ',
    PRATIBEDAN: 'প্রতিবেদন রচনা',
    PRABANDHA: 'প্রবন্ধ রচনা',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  বাংলা ২য় পত্র — রচনামূলক প্রশ্ন (নির্মিতি - ৭০ নম্বর)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  মোট মান: {toBengaliNumber(totalMarks)} / ৭০
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                {grade} • ১. অনুচ্ছেদ (১০) • ২. পত্র (১০) • ৩. সারাংশ/সারমর্ম (১০) • ৪. ভাব-সম্প্রসারণ (১০) • ৫. প্রতিবেদন (১০) • ৬. প্রবন্ধ (২০)
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
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3.5 bg-slate-50/50"
        >
          {/* Optional Section Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSectionBanner}
                onChange={(e) => setIncludeSectionBanner(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
              />
              <span>রচনামূলক অংশের শিরোনাম ব্যানার যুক্ত করুন</span>
            </label>
            {includeSectionBanner && (
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full sm:w-auto sm:flex-1 min-w-[200px] px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* 6 Questions List */}
          {items.map((item, qIdx) => {
            const qNumBn = toBengaliNumber(qIdx + 1);
            const isMultiline =
              item.kind === 'PATRA_DARKHASTA' ||
              item.kind === 'SARANGSHO_SARMORMO' ||
              item.kind === 'BHAB_SAMPRASARAN' ||
              item.kind === 'PRATIBEDAN';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 transition hover:border-emerald-300"
              >
                {/* Card Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-extrabold">
                      প্রশ্ন {qNumBn}।
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                      {kindLabels[item.kind] || 'রচনামূলক'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.kind !== 'SARANGSHO_SARMORMO' &&
                      item.kind !== 'PRABANDHA' && (
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.useAthabaPrefix}
                            onChange={(e) =>
                              handleUpdateItem(qIdx, {
                                useAthabaPrefix: e.target.checked,
                              })
                            }
                            className="rounded text-emerald-600"
                          />
                          <span>“অথবা, (খ)” স্টাইল</span>
                        </label>
                      )}

                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                      <span className="text-[11px] font-bold text-slate-600">মান:</span>
                      <input
                        type="number"
                        value={item.marks}
                        onChange={(e) =>
                          handleUpdateItem(qIdx, {
                            marks: Number(e.target.value) || 10,
                          })
                        }
                        className="w-10 text-center text-xs font-extrabold bg-white border border-slate-200 rounded py-0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Question Body */}
                {item.kind === 'SARANGSHO_SARMORMO' ? (
                  <div className="space-y-3">
                    {/* (ক) সারাংশ */}
                    <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-xs font-bold">
                          (ক)
                        </span>
                        <input
                          type="text"
                          value={item.partKaHeading || ''}
                          onChange={(e) =>
                            handleUpdateItem(qIdx, { partKaHeading: e.target.value })
                          }
                          placeholder="সারাংশ লেখ :"
                          className="flex-1 px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white outline-none focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={item.options[0] || ''}
                        onChange={(e) => handleOptionChange(qIdx, 0, e.target.value)}
                        placeholder={
                          item.optionPlaceholders?.[0] ||
                          'সারাংশের জন্য গদ্য অনুচ্ছেদটি এখানে লিখুন...'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed"
                      />
                    </div>

                    {/* অথবা, (খ) সারমর্ম */}
                    <div className="space-y-1.5 bg-amber-50/40 p-3 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-800 text-white text-xs font-bold">
                          অথবা, (খ)
                        </span>
                        <input
                          type="text"
                          value={item.partKhaHeading || ''}
                          onChange={(e) =>
                            handleUpdateItem(qIdx, { partKhaHeading: e.target.value })
                          }
                          placeholder="সারমর্ম লেখ :"
                          className="flex-1 px-2.5 py-1 text-xs font-bold border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-600"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={item.options[1] || ''}
                        onChange={(e) => handleOptionChange(qIdx, 1, e.target.value)}
                        placeholder={
                          item.optionPlaceholders?.[1] ||
                          'সারমর্মের জন্য কবিতার চরণগুলো এখানে লিখুন...'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white outline-none focus:border-amber-600 leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Main Stem Prompt (যেমন: যেকোনো একটি বিষয়ে অনুচ্ছেদ রচনা কর :) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        প্রশ্নের নির্দেশনা:
                      </label>
                      <input
                        type="text"
                        value={item.stemTitle}
                        onChange={(e) =>
                          handleUpdateItem(qIdx, { stemTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Options (ক), (খ), (গ)... */}
                    <div className="space-y-2">
                      {item.options.map((optVal, oIdx) => {
                        const letter = BENGALI_OPTION_LETTERS[oIdx] || 'ক';
                        const badgeText =
                          item.useAthabaPrefix && oIdx > 0
                            ? `অথবা, (${letter})`
                            : `(${letter})`;
                        const ph =
                          item.optionPlaceholders?.[oIdx] ||
                          `বিকল্প (${letter}) এখানে লিখুন...`;

                        return (
                          <div
                            key={oIdx}
                            className="flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200"
                          >
                            <span className="px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0 mt-0.5">
                              {badgeText}
                            </span>

                            {isMultiline ? (
                              <textarea
                                rows={2}
                                value={optVal}
                                onChange={(e) =>
                                  handleOptionChange(qIdx, oIdx, e.target.value)
                                }
                                placeholder={ph}
                                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed"
                              />
                            ) : (
                              <input
                                type="text"
                                value={optVal}
                                onChange={(e) =>
                                  handleOptionChange(qIdx, oIdx, e.target.value)
                                }
                                placeholder={ph}
                                className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500"
                              />
                            )}

                            {item.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, oIdx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="বিকল্পটি মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {item.options.length < 5 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            + আরও বিকল্প ({BENGALI_OPTION_LETTERS[item.options.length]}) যোগ করুন
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_BANGLA2ND_SSC_WRITTEN_ITEMS)}
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
                ? `পেপারে রচনামূলক অংশ আপডেট করুন (${toBengaliNumber(totalMarks)} নম্বর)`
                : `পেপারে রচনামূলক অংশ যোগ করুন (${toBengaliNumber(totalMarks)} নম্বর)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
