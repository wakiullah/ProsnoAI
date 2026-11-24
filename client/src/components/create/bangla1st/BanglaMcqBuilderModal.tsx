'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  ArrowRight,
  ListChecks,
  Layers,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  BanglaMcqEntryType,
  BanglaMcqItemConfig,
  BanglaMcqSubQuestion,
  BanglaSyllabusSegment,
  BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS,
  DEFAULT_BANGLA_MCQ_ITEMS,
  toBengaliNumber,
} from './bangla1stDefaults';
import { BanglaMcqItemCard } from './BanglaMcqItemCard';

export interface BanglaMcqGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractBanglaMcqGroups(questions: QuestionData[]): BanglaMcqGroup[] {
  const groups: BanglaMcqGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('bangla-mcq-section') && !seen.has(q.groupId)) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `বহুনির্বাচনি অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface BanglaMcqBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: BanglaMcqGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    proceedToCq?: boolean
  ) => void;
}

const OPTION_IDS = ['ক', 'খ', 'গ', 'ঘ'];

export const BanglaMcqBuilderModal: React.FC<BanglaMcqBuilderModalProps> = ({
  isOpen,
  onClose,
  grade = '১০ম শ্রেণি (এসএসসি)',
  subject = 'বাংলা ১ম পত্র',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [includeSectionBanner, setIncludeSectionBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('বহুনির্বাচনি অভীক্ষা — পূর্ণমান: ৩০');
  const [items, setItems] = useState<BanglaMcqItemConfig[]>(DEFAULT_BANGLA_MCQ_ITEMS);

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const lastAddedItemIdRef = useRef<string | null>(null);

  // Smoothly scroll to newly added question card and focus its input
  useEffect(() => {
    if (!lastAddedItemIdRef.current || !listContainerRef.current) return;
    const targetId = lastAddedItemIdRef.current;
    lastAddedItemIdRef.current = null;

    requestAnimationFrame(() => {
      if (!listContainerRef.current) return;
      const cardEl = listContainerRef.current.querySelector(
        `[data-mcq-item-id="${targetId}"]`
      ) as HTMLElement | null;
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = cardEl.querySelector(
          'textarea, input[type="text"]'
        ) as HTMLElement | null;
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 220);
        }
      }
    });
  }, [items]);

  // Hydrate items when editing an existing group from canvas
  useEffect(() => {
    if (!activeGroup) {
      setIncludeSectionBanner(false);
      setBannerTitle('বহুনির্বাচনি অভীক্ষা — পূর্ণমান: ৩০');
      setItems(DEFAULT_BANGLA_MCQ_ITEMS);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find(
      (q) => q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE'
    );
    if (bannerQ) {
      setIncludeSectionBanner(true);
      setBannerTitle(bannerQ.stemOrPassage || 'বহুনির্বাচনি অভীক্ষা — পূর্ণমান: ৩০');
    } else {
      setIncludeSectionBanner(false);
    }

    const reconstructed: BanglaMcqItemConfig[] = [];
    let i = 0;
    while (i < qs.length) {
      const q = qs[i];
      if (q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE') {
        i++;
        continue;
      }

      if (q.groupRole === 'bangla_mcq_stem') {
        const rawLines = (q.stemOrPassage || '').split('\n');
        const stemInstruction = rawLines[0] || '';
        const stemPassage = rawLines.slice(1).join('\n');
        const linked: BanglaMcqSubQuestion[] = [];
        let j = i + 1;
        while (j < qs.length && qs[j].groupRole === 'bangla_mcq_linked') {
          const lq = qs[j];
          const opts = (lq.options || []).map((o) => o.text);
          const corIdx = Math.max(
            0,
            (lq.options || []).findIndex((o) => o.isCorrect)
          );
          linked.push({
            id: lq._id || `linked_${j}`,
            subType:
              lq.typology === 'MULTIPLE_COMPLETION_MCQ' ? 'MULTIPLE_COMPLETION' : 'SIMPLE',
            questionText: lq.stemOrPassage || '',
            statements:
              lq.statements && lq.statements.length >= 3
                ? [lq.statements[0], lq.statements[1], lq.statements[2]]
                : undefined,
            options: [opts[0] || '', opts[1] || '', opts[2] || '', opts[3] || ''],
            correctIndex: corIdx,
          });
          j++;
        }
        reconstructed.push({
          id: q._id || `stem_${i}`,
          entryType: 'STEM_GROUP',
          segment: (q.chapter as BanglaSyllabusSegment) || 'PROSE',
          questionText: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          stemInstruction,
          stemPassage,
          linkedQuestions: linked,
        });
        i = j;
        continue;
      }

      const opts = (q.options || []).map((o) => o.text);
      const corIdx = Math.max(
        0,
        (q.options || []).findIndex((o) => o.isCorrect)
      );
      reconstructed.push({
        id: q._id || `mcq_${i}`,
        entryType:
          q.typology === 'MULTIPLE_COMPLETION_MCQ' ? 'MULTIPLE_COMPLETION' : 'SIMPLE',
        segment: (q.chapter as BanglaSyllabusSegment) || 'PROSE',
        questionText: q.stemOrPassage || '',
        statements:
          q.statements && q.statements.length >= 3
            ? [q.statements[0], q.statements[1], q.statements[2]]
            : undefined,
        options: [opts[0] || '', opts[1] || '', opts[2] || '', opts[3] || ''],
        correctIndex: corIdx,
      });
      i++;
    }

    if (reconstructed.length > 0) {
      setItems(reconstructed);
    }
  }, [activeGroup]);

  // Compute sequential question numbers & total MCQ count
  const { startNumbers, totalMcqCount } = useMemo(() => {
    const starts: number[] = [];
    let seq = 1;

    items.forEach((it) => {
      starts.push(seq);
      const c =
        it.entryType === 'STEM_GROUP' ? Math.max(1, it.linkedQuestions?.length || 1) : 1;
      seq += c;
    });

    return {
      startNumbers: starts,
      totalMcqCount: seq - 1,
    };
  }, [items]);

  if (!isOpen) return null;

  const handleAddItem = (type: BanglaMcqEntryType) => {
    const nextNum = totalMcqCount + 1;
    const n1 = toBengaliNumber(nextNum);
    const n2 = toBengaliNumber(nextNum + 1);
    const newId = `bmcq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    lastAddedItemIdRef.current = newId;

    if (type === 'MULTIPLE_COMPLETION') {
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          entryType: 'MULTIPLE_COMPLETION',
          segment: 'PROSE',
          questionText: '',
          statements: ['', '', ''],
          options: [...BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS],
          correctIndex: 0,
        },
      ]);
    } else if (type === 'STEM_GROUP') {
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          entryType: 'STEM_GROUP',
          segment: 'PROSE',
          questionText: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          stemInstruction: `নিচের উদ্দীপকটি পড়ে ${n1} ও ${n2}নং প্রশ্নের উত্তর দাও:`,
          stemPassage: '',
          linkedQuestions: [
            {
              id: `sub_${Date.now()}_1`,
              subType: 'SIMPLE',
              questionText: '',
              options: ['', '', '', ''],
              correctIndex: 0,
            },
            {
              id: `sub_${Date.now()}_2`,
              subType: 'MULTIPLE_COMPLETION',
              questionText: '',
              statements: ['', '', ''],
              options: [...BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS],
              correctIndex: 3,
            },
          ],
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          entryType: 'SIMPLE',
          segment: 'PROSE',
          questionText: '',
          options: ['', '', '', ''],
          correctIndex: 0,
        },
      ]);
    }
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    if (includeSectionBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'bangla_mcq_banner',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: bannerTitle.trim(),
        customMarksText: `${toBengaliNumber(totalMcqCount)}×১=${toBengaliNumber(totalMcqCount)}`,
        marks: 0,
        difficulty: 'Easy',
        languages: ['bn'],
        sourceType: 'MANUAL',
      });
    }

    let seq = 1;
    items.forEach((it) => {
      if (it.entryType === 'STEM_GROUP') {
        const subList = it.linkedQuestions || [];
        const nStart = toBengaliNumber(seq);
        const nEnd = toBengaliNumber(seq + Math.max(0, subList.length - 1));
        const instruction =
          (it.stemInstruction || '').trim() ||
          `নিচের উদ্দীপকটি পড়ে ${nStart} ও ${nEnd}নং প্রশ্নের উত্তর দাও:`;

        list.push({
          groupId: targetGroupId,
          groupRole: 'bangla_mcq_stem',
          subject,
          grade,
          chapter: it.segment,
          typology: 'DESCRIPTIVE',
          customNumber: '',
          stemOrPassage: `${instruction}\n${(it.stemPassage || '').trim()}`,
          customMarksText: '',
          marks: 0,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });

        subList.forEach((sq) => {
          list.push({
            groupId: targetGroupId,
            groupRole: 'bangla_mcq_linked',
            subject,
            grade,
            chapter: it.segment,
            typology:
              sq.subType === 'MULTIPLE_COMPLETION' ? 'MULTIPLE_COMPLETION_MCQ' : 'SIMPLE_MCQ',
            customNumber: `${toBengaliNumber(seq)}।`,
            stemOrPassage: sq.questionText.trim(),
            statements:
              sq.subType === 'MULTIPLE_COMPLETION' && sq.statements
                ? sq.statements.map((s) => s.trim())
                : undefined,
            options: sq.options.map((optText, oIdx) => ({
              label: OPTION_IDS[oIdx],
              text: optText.trim(),
              isCorrect: sq.correctIndex === oIdx,
            })),
            customMarksText: '',
            marks: 1,
            difficulty: 'Medium',
            languages: ['bn'],
            sourceType: 'MANUAL',
          });
          seq++;
        });
      } else {
        list.push({
          groupId: targetGroupId,
          groupRole: 'bangla_mcq_item',
          subject,
          grade,
          chapter: it.segment,
          typology:
            it.entryType === 'MULTIPLE_COMPLETION' ? 'MULTIPLE_COMPLETION_MCQ' : 'SIMPLE_MCQ',
          customNumber: `${toBengaliNumber(seq)}।`,
          stemOrPassage: it.questionText.trim(),
          statements:
            it.entryType === 'MULTIPLE_COMPLETION' && it.statements
              ? it.statements.map((s) => s.trim())
              : undefined,
          options: it.options.map((optText, oIdx) => ({
            label: OPTION_IDS[oIdx],
            text: optText.trim(),
            isCorrect: it.correctIndex === oIdx,
          })),
          customMarksText: '',
          marks: 1,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });
        seq++;
      }
    });

    return list;
  };

  const handleApply = (proceedToCq = false) => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `bangla-mcq-section-${Date.now()}`;
    const generated = buildQuestions(targetGroupId);
    onSave(generated, mode, targetGroupId, proceedToCq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  বাংলা ১ম পত্র — বহুনির্বাচনি (MCQ)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 font-bold whitespace-nowrap">
                  মোট {toBengaliNumber(totalMcqCount)} / ৩০ নম্বর
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                {grade} • সাধারণ, বহুপদী (i, ii, iii) ও উদ্দীপকভিত্তিক গুচ্ছ প্রশ্ন
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

        {/* Sticky Sub-Toolbar: Quick Add 3 Types */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-600">
            নতুন বহুনির্বাচনি প্রশ্ন যোগ করুন (মোট যুক্ত: {toBengaliNumber(totalMcqCount)}টি):
          </span>

          <div className="grid grid-cols-3 sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddItem('SIMPLE')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">সাধারণ MCQ</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddItem('MULTIPLE_COMPLETION')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition"
            >
              <ListChecks className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ বহুপদী</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddItem('STEM_GROUP')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ উদ্দীপক গুচ্ছ</span>
            </button>
          </div>
        </div>

        {/* Body List */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 bg-slate-50/50"
        >
          {/* Optional Section Banner Toggle (useful when Combined MCQ + CQ in 1 paper) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSectionBanner}
                onChange={(e) => setIncludeSectionBanner(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
              />
              <span>বহুনির্বাচনি অংশের শিরোনাম ব্যানার যুক্ত করুন (একত্রে ১০০ নম্বরের প্রশ্নের জন্য)</span>
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

          {/* Question Cards */}
          {items.map((item, idx) => (
            <BanglaMcqItemCard
              key={item.id}
              item={item}
              startQuestionNumber={startNumbers[idx]}
              onChange={(updated) => {
                const next = [...items];
                next[idx] = updated;
                setItems(next);
              }}
              onDelete={() => setItems(items.filter((_, i) => i !== idx))}
            />
          ))}

          {/* Bottom "Add More MCQs" Card */}
          <div className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-3.5 sm:p-4 text-center space-y-2.5">
            <p className="text-xs font-extrabold text-slate-700">
              + আরও এমসিকিউ (MCQ) যোগ করুন ({toBengaliNumber(totalMcqCount)} / ৩০)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAddItem('SIMPLE')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-extrabold transition active:scale-98"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>+ সাধারণ MCQ যোগ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('MULTIPLE_COMPLETION')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-extrabold transition active:scale-98"
              >
                <ListChecks className="w-4 h-4 text-indigo-700" />
                <span>+ বহুপদী (i, ii, iii) যোগ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('STEM_GROUP')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-extrabold transition active:scale-98"
              >
                <Layers className="w-4 h-4 text-amber-700" />
                <span>+ উদ্দীপক গুচ্ছ যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_BANGLA_MCQ_ITEMS)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>১টি ডিফল্ট প্রশ্নে রিসেট</span>
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
                  ? `পেপারে আপডেট করুন (${toBengaliNumber(totalMcqCount)}টি MCQ)`
                  : `পেপারে যোগ করুন (${toBengaliNumber(totalMcqCount)}টি MCQ)`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-xs font-extrabold shadow-sm transition"
            >
              <span>
                {subject.includes('২য়') || subject.includes('২য়') || subject.includes('দ্বিতীয়')
                  ? 'সেভ ও রচনামূলক (নির্মিতি - ৭০) অংশে যান'
                  : 'সেভ ও সৃজনশীল (CQ - ৭০) অংশে যান'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
