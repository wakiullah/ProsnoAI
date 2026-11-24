'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  BanglaCqItemConfig,
  BanglaSyllabusSegment,
  BANGLA_CQ_SECTIONS_4_PART,
  BANGLA_CQ_SECTIONS_ALIM_2_PART,
  DEFAULT_BANGLA_CQ_ITEMS,
  isAlimGrade,
  toBengaliNumber,
} from './bangla1stDefaults';

export interface BanglaCqGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractBanglaCqGroups(questions: QuestionData[]): BanglaCqGroup[] {
  const groups: BanglaCqGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('bangla-cq-section') && !seen.has(q.groupId)) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `সৃজনশীল অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface BanglaCqBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: BanglaCqGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const BanglaCqBuilderModal: React.FC<BanglaCqBuilderModalProps> = ({
  isOpen,
  onClose,
  grade = '১০ম শ্রেণি (এসএসসি)',
  subject = 'বাংলা ১ম পত্র',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const isAlim = isAlimGrade(grade);
  const sectionDefs = isAlim ? BANGLA_CQ_SECTIONS_ALIM_2_PART : BANGLA_CQ_SECTIONS_4_PART;

  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [includeSectionBanners, setIncludeSectionBanners] = useState(true);
  const [items, setItems] = useState<BanglaCqItemConfig[]>(DEFAULT_BANGLA_CQ_ITEMS);
  const [activeTab, setActiveTab] = useState<'ALL' | BanglaSyllabusSegment>('ALL');

  // Hydrate when editing existing CQ group from canvas
  useEffect(() => {
    if (!activeGroup) {
      setIncludeSectionBanners(true);
      setItems(DEFAULT_BANGLA_CQ_ITEMS);
      return;
    }

    const qs = activeGroup.questions;
    const hasBanners = qs.some(
      (q) => q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE'
    );
    setIncludeSectionBanners(hasBanners);

    let currentSeg: BanglaSyllabusSegment = 'PROSE';
    const reconstructed: BanglaCqItemConfig[] = [];

    qs.forEach((q, idx) => {
      if (q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE') {
        const t = q.stemOrPassage || '';
        if (t.includes('কবিতা')) currentSeg = 'POETRY';
        else if (t.includes('উপন্যাস')) currentSeg = 'NOVEL';
        else if (t.includes('নাটক')) currentSeg = 'DRAMA';
        else currentSeg = 'PROSE';
        return;
      }

      if (q.typology === 'CQ') {
        const seg = (q.chapter as BanglaSyllabusSegment) || currentSeg;
        const subs = q.subQuestions || [];
        reconstructed.push({
          id: q._id || `bcq_${idx}`,
          segment: isAlim && (seg === 'NOVEL' || seg === 'DRAMA') ? 'PROSE' : seg,
          stimulusText: q.stemOrPassage || '',
          qKa: subs[0]?.questionText || '',
          qKha: subs[1]?.questionText || '',
          qGa: subs[2]?.questionText || '',
          qGha: subs[3]?.questionText || '',
        });
      }
    });

    if (reconstructed.length > 0) {
      setItems(reconstructed);
    }
  }, [activeGroup, isAlim]);

  if (!isOpen) return null;

  const handleAddCq = (seg?: BanglaSyllabusSegment) => {
    const targetSeg: BanglaSyllabusSegment =
      seg || (activeTab === 'ALL' ? 'PROSE' : activeTab);
    setItems([
      ...items,
      {
        id: `bcq_${Date.now()}`,
        segment: targetSeg,
        stimulusText: '',
        qKa: '',
        qKha: '',
        qGa: '',
        qGha: '',
      },
    ]);
  };

  const handleUpdateCq = (id: string, patch: Partial<BanglaCqItemConfig>) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const handleDeleteCq = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  // Group items in official section order (PROSE -> POETRY -> NOVEL -> DRAMA)
  const orderedSections = useMemo(() => {
    let globalSeq = 1;
    return sectionDefs.map((sec) => {
      const secItems = items
        .filter((it) =>
          isAlim && sec.id === 'PROSE'
            ? it.segment === 'PROSE' || it.segment === 'NOVEL' || it.segment === 'DRAMA'
            : it.segment === sec.id
        )
        .map((it) => ({
          item: it,
          qNumber: globalSeq++,
        }));
      return {
        ...sec,
        entries: secItems,
      };
    });
  }, [items, sectionDefs, isAlim]);

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    orderedSections.forEach((sec) => {
      if (sec.entries.length === 0) return;

      if (includeSectionBanners) {
        list.push({
          groupId: targetGroupId,
          groupRole: `bangla_cq_banner_${sec.id.toLowerCase()}`,
          subject,
          grade,
          chapter: sec.id,
          typology: 'GROUP_TITLE',
          customNumber: '',
          stemOrPassage: sec.bannerTitle,
          customMarksText: '',
          marks: 0,
          difficulty: 'Easy',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });
      }

      sec.entries.forEach(({ item, qNumber }) => {
        const fullStimulus =
          item.hasSecondStimulus && item.stimulus2Text?.trim()
            ? `উদ্দীপক-১:\n${item.stimulusText.trim()}\n\nউদ্দীপক-২:\n${item.stimulus2Text.trim()}`
            : item.stimulusText.trim();

        list.push({
          groupId: targetGroupId,
          groupRole: 'bangla_cq_item',
          subject,
          grade,
          chapter: sec.id,
          typology: 'CQ',
          customNumber: `${toBengaliNumber(qNumber)}।`,
          stemOrPassage: fullStimulus,
          customMarksText: '',
          subQuestions: [
            {
              part: 'ক',
              bloomLevel: 'knowledge',
              bloomTitle: 'জ্ঞানমূলক',
              questionText: item.qKa.trim(),
              marks: 1,
            },
            {
              part: 'খ',
              bloomLevel: 'comprehension',
              bloomTitle: 'অনুধাবনমূলক',
              questionText: item.qKha.trim(),
              marks: 2,
            },
            {
              part: 'গ',
              bloomLevel: 'application',
              bloomTitle: 'প্রয়োগমূলক',
              questionText: item.qGa.trim(),
              marks: 3,
            },
            {
              part: 'ঘ',
              bloomLevel: 'higher_order',
              bloomTitle: 'উচ্চতর দক্ষতামূলক',
              questionText: item.qGha.trim(),
              marks: 4,
            },
          ],
          marks: 10,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        });
      });
    });

    return list;
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `bangla-cq-section-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-teal-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>বাংলা ১ম পত্র — সৃজনশীল প্রশ্ন (CQ - ৭০ নম্বর)</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold">
                  মোট {toBengaliNumber(items.length)} / ১১টি প্রশ্ন (উত্তর ৭টি = ৭০)
                </span>
              </h2>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {isAlim
                  ? 'আলিম সিলেবাস: গদ্যাংশ (৬টি → যেকোনো ৪টি = ৪০) ও কবিতাংশ (৫টি → যেকোনো ৩টি = ৩০)'
                  : `${grade}: ক অংশ-গদ্য (৪→২), খ অংশ-কবিতা (৩→২), গ অংশ-উপন্যাস (২→১), ঘ অংশ-নাটক (২→১) + যেকোনো ১টি = ৭টি`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs & Add CQ Button */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTab === 'ALL'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              সকল বিভাগ ({toBengaliNumber(items.length)}/১১)
            </button>
            {orderedSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === sec.id
                    ? 'bg-indigo-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {sec.bannerTitle} ({toBengaliNumber(sec.entries.length)}/
                {toBengaliNumber(sec.targetQuestionCount)})
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleAddCq()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ নতুন সৃজনশীল প্রশ্ন</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSectionBanners}
                onChange={(e) => setIncludeSectionBanners(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>
                বিভাগ শিরোনাম ({isAlim ? 'ক বিভাগ—গদ্যাংশ, খ বিভাগ—কবিতাংশ' : 'ক অংশ—গদ্য, খ অংশ—কবিতা, গ অংশ—উপন্যাস, ঘ অংশ—নাটক'}) পেপারে প্রদর্শন করুন
              </span>
            </label>
          </div>

          {orderedSections.map((sec) => {
            if (activeTab !== 'ALL' && activeTab !== sec.id) return null;
            return (
              <div key={sec.id} className="space-y-3">
                <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 px-3.5 py-2 rounded-xl">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-950">
                      {sec.bannerTitle}
                    </span>
                    <span className="text-[11px] text-indigo-700 ml-2 font-semibold">
                      (বোর্ড মানদণ্ড: {toBengaliNumber(sec.targetQuestionCount)}টি প্রশ্ন থাকবে, ন্যূনতম{' '}
                      {toBengaliNumber(sec.minAnswerCount)}টির উত্তর দিতে হবে)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCq(sec.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>এই বিভাগে প্রশ্ন যোগ</span>
                  </button>
                </div>

                {sec.entries.map(({ item, qNumber }) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-700 text-white text-xs font-extrabold">
                          সৃজনশীল প্রশ্ন {toBengaliNumber(qNumber)}।
                        </span>
                        <select
                          value={item.segment}
                          onChange={(e) =>
                            handleUpdateCq(item.id, {
                              segment: e.target.value as BanglaSyllabusSegment,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                        >
                          {sectionDefs.map((sd) => (
                            <option key={sd.id} value={sd.id}>
                              {sd.bannerTitle}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(item.hasSecondStimulus)}
                            onChange={(e) =>
                              handleUpdateCq(item.id, { hasSecondStimulus: e.target.checked })
                            }
                            className="rounded text-indigo-600"
                          />
                          <span>দ্বিতীয় উদ্দীপক (উদ্দীপক-২)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteCq(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        {item.hasSecondStimulus ? 'উদ্দীপক-১ (গদ্য বা কবিতার চরণ):' : 'উদ্দীপক (গদ্য অনুচ্ছেদ বা কবিতার চরণ):'}
                      </label>
                      <textarea
                        rows={3}
                        value={item.stimulusText}
                        onChange={(e) =>
                          handleUpdateCq(item.id, { stimulusText: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none leading-relaxed"
                      />
                    </div>

                    {item.hasSecondStimulus && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 block">
                          উদ্দীপক-২:
                        </label>
                        <textarea
                          rows={2}
                          value={item.stimulus2Text || ''}
                          onChange={(e) =>
                            handleUpdateCq(item.id, { stimulus2Text: e.target.value })
                          }
                          placeholder="দ্বিতীয় উদ্দীপক লিখুন..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none leading-relaxed"
                        />
                      </div>
                    )}

                    {/* ক, খ, গ, ঘ Sub-questions with fixed 1, 2, 3, 4 marks */}
                    <div className="space-y-2 pt-1">
                      {(
                        [
                          { key: 'qKa' as const, label: 'ক.', title: 'জ্ঞানমূলক', marks: '১' },
                          { key: 'qKha' as const, label: 'খ.', title: 'অনুধাবনমূলক', marks: '২' },
                          { key: 'qGa' as const, label: 'গ.', title: 'প্রয়োগমূলক', marks: '৩' },
                          { key: 'qGha' as const, label: 'ঘ.', title: 'উচ্চতর দক্ষতা', marks: '৪' },
                        ] as const
                      ).map((part) => (
                        <div key={part.key} className="flex items-center gap-2">
                          <span className="w-7 text-xs font-extrabold text-slate-800 shrink-0">
                            {part.label}
                          </span>
                          <input
                            type="text"
                            value={item[part.key]}
                            onChange={(e) =>
                              handleUpdateCq(item.id, { [part.key]: e.target.value })
                            }
                            placeholder={`${part.title} প্রশ্ন লিখুন...`}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                          />
                          <span className="w-6 text-center text-xs font-mono font-bold text-slate-600 bg-slate-100 py-1 rounded shrink-0">
                            {part.marks}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_BANGLA_CQ_ITEMS)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট নমুনায় রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEditMode
                ? `সৃজনশীল অংশ আপডেট করুন (${toBengaliNumber(items.length)}টি প্রশ্ন)`
                : `পেপারে সৃজনশীল অংশ যোগ করুন (${toBengaliNumber(items.length)}টি প্রশ্ন)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
