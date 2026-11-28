'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sigma,
  Eye,
  EyeOff,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../../common/MultiScriptText';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';
import {
  STD_GROUP_PREFIX,
  StandardCqItemConfig,
  StandardSubjectConfig,
} from './standardCqMcqConfig';
import { MathSymbolToolbar } from './MathSymbolToolbar';
import { StimulusMediaEditor } from './StimulusMediaEditor';

export interface StandardCqGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractStandardCqGroups(questions: QuestionData[]): StandardCqGroup[] {
  const groups: StandardCqGroup[] = [];
  const seen = new Set<string>();
  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith(STD_GROUP_PREFIX.CQ) && !seen.has(q.groupId)) {
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

interface StandardCqBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StandardSubjectConfig;
  grade?: string;
  subject?: string;
  allGroups: StandardCqGroup[];
  activeGroupId: string | null;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const StandardCqBuilderModal: React.FC<StandardCqBuilderModalProps> = ({
  isOpen,
  onClose,
  config,
  grade = '১০ম শ্রেণি (এসএসসি)',
  subject,
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const subjectLabel = subject || config.label;
  const isThreePart = config.cqPartMode === '3_PART';
  const hasSections = config.sections.length > 0;

  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [includeTopBanner, setIncludeTopBanner] = useState(true);
  const [includeSectionBanners, setIncludeSectionBanners] = useState(hasSections);
  const [showSymbolBar, setShowSymbolBar] = useState(config.showMathToolbarByDefault);
  const [showPreview, setShowPreview] = useState(config.showMathToolbarByDefault);
  const [items, setItems] = useState<StandardCqItemConfig[]>(config.defaultCqItems);

  const activeFieldRef = useRef<{
    id: string;
    field: 'stimulusText' | 'qKa' | 'qKha' | 'qGa' | 'qGha';
    el: HTMLInputElement | HTMLTextAreaElement | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowSymbolBar(config.showMathToolbarByDefault);
    setShowPreview(config.showMathToolbarByDefault);

    if (!activeGroup) {
      setIncludeTopBanner(true);
      setIncludeSectionBanners(hasSections);
      setItems(config.defaultCqItems.map((it) => ({ ...it })));
      return;
    }

    const qs = activeGroup.questions;
    setIncludeTopBanner(qs.some((q) => q.groupRole === 'std_cq_top_banner'));
    setIncludeSectionBanners(qs.some((q) => q.groupRole === 'std_cq_section_banner'));

    let currentSecId = config.sections[0]?.id;
    const reconstructed: StandardCqItemConfig[] = [];

    qs.forEach((q, idx) => {
      if (q.groupRole === 'std_cq_section_banner' && q.chapter) {
        currentSecId = q.chapter;
        return;
      }
      if (q.typology === 'CQ') {
        const subs = q.subQuestions || [];
        reconstructed.push({
          id: q._id || `std_cq_${idx}`,
          sectionId: q.chapter || currentSecId,
          stimulusText: q.stemOrPassage || '',
          stimulusImage: q.stimulusImage,
          stimulusTable: q.stimulusTable,
          qKa: subs[0]?.questionText || '',
          qKha: subs[1]?.questionText || '',
          qGa: subs[2]?.questionText || '',
          qGha: subs[3]?.questionText || '',
        });
      }
    });

    setItems(reconstructed.length > 0 ? reconstructed : config.defaultCqItems.map((it) => ({ ...it })));
  }, [isOpen, activeGroup, config, hasSections]);

  if (!isOpen) return null;

  const updateItem = (id: string, patch: Partial<StandardCqItemConfig>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const handleInsertSymbol = (snippet: string) => {
    const target = activeFieldRef.current;
    if (!target) return;
    const item = items.find((it) => it.id === target.id);
    if (!item) return;

    const currentVal = String(item[target.field] || '');
    const el = target.el;
    if (el && typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const nextVal = currentVal.slice(0, start) + snippet + currentVal.slice(end);
      updateItem(target.id, { [target.field]: nextVal });
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      updateItem(target.id, { [target.field]: currentVal + snippet });
    }
  };

  const handleAddItem = (sectionId?: string) => {
    setItems((prev) => [
      ...prev,
      {
        id: `std_cq_${Date.now()}_${prev.length}`,
        sectionId: sectionId || config.sections[0]?.id,
        stimulusText: '',
        qKa: '',
        qKha: '',
        qGa: '',
        qGha: isThreePart ? undefined : '',
      },
    ]);
  };

  const handleSaveToCanvas = () => {
    const targetGroupId = activeGroup ? activeGroup.groupId : `${STD_GROUP_PREFIX.CQ}-${Date.now()}`;
    const generated: QuestionData[] = [];

    if (includeTopBanner) {
      const topTitle = config.hasShortQuestions
        ? `ক অংশ — সৃজনশীল প্রশ্ন (যেকোনো ${toBengaliNumber(config.cqAnswerCount)}টি প্রশ্নের উত্তর দাও)`
        : `সৃজনশীল প্রশ্ন (যেকোনো ${toBengaliNumber(config.cqAnswerCount)}টি প্রশ্নের উত্তর দাও)`;
      generated.push({
        subject: subjectLabel,
        grade,
        typology: 'GROUP_TITLE',
        stemOrPassage: topTitle,
        customMarksText: `${toBengaliNumber(config.cqAnswerCount)}×১০ = ${toBengaliNumber(config.cqTotalMarks)}`,
        marks: config.cqTotalMarks,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
        groupId: targetGroupId,
        groupRole: 'std_cq_top_banner',
      });
    }

    let qNum = 1;

    const pushCqItem = (it: StandardCqItemConfig) => {
      const subQuestions = isThreePart
        ? [
            { part: 'ক' as const, bloomLevel: 'knowledge' as const, bloomTitle: 'সহজ', questionText: it.qKa.trim() || 'ক অংশের প্রশ্ন লিখুন।', marks: 2 },
            { part: 'খ' as const, bloomLevel: 'application' as const, bloomTitle: 'মধ্যম', questionText: it.qKha.trim() || 'খ অংশের প্রশ্ন লিখুন।', marks: 4 },
            { part: 'গ' as const, bloomLevel: 'higher_order' as const, bloomTitle: 'কঠিন', questionText: it.qGa.trim() || 'গ অংশের প্রশ্ন লিখুন।', marks: 4 },
          ]
        : [
            { part: 'ক' as const, bloomLevel: 'knowledge' as const, bloomTitle: 'জ্ঞানমূলক', questionText: it.qKa.trim() || 'জ্ঞানমূলক প্রশ্ন লিখুন।', marks: 1 },
            { part: 'খ' as const, bloomLevel: 'comprehension' as const, bloomTitle: 'অনুধাবনমূলক', questionText: it.qKha.trim() || 'অনুধাবনমূলক প্রশ্ন লিখুন।', marks: 2 },
            { part: 'গ' as const, bloomLevel: 'application' as const, bloomTitle: 'প্রয়োগমূলক', questionText: it.qGa.trim() || 'প্রয়োগমূলক প্রশ্ন লিখুন।', marks: 3 },
            { part: 'ঘ' as const, bloomLevel: 'higher_order' as const, bloomTitle: 'উচ্চতর দক্ষতা', questionText: (it.qGha || '').trim() || 'উচ্চতর দক্ষতামূলক প্রশ্ন লিখুন।', marks: 4 },
          ];

      generated.push({
        subject: subjectLabel,
        grade,
        chapter: it.sectionId,
        typology: 'CQ',
        stemOrPassage: it.stimulusText.trim(),
        stimulusImage: it.stimulusImage,
        stimulusTable: it.stimulusTable,
        subQuestions,
        customNumber: `${toBengaliNumber(qNum)}.`,
        customMarksText: '',
        marks: 10,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
        groupId: targetGroupId,
        groupRole: 'std_cq_item',
      });
      qNum += 1;
    };

    if (hasSections) {
      config.sections.forEach((sec) => {
        const secItems = items.filter((it) => (it.sectionId || config.sections[0].id) === sec.id);
        if (secItems.length === 0) return;
        if (includeSectionBanners) {
          generated.push({
            subject: subjectLabel,
            grade,
            chapter: sec.id,
            typology: 'SECTION_TITLE',
            stemOrPassage: sec.bannerTitle,
            marks: 0,
            difficulty: 'Medium',
            languages: ['bn'],
            sourceType: 'MANUAL',
            groupId: targetGroupId,
            groupRole: 'std_cq_section_banner',
          });
        }
        secItems.forEach(pushCqItem);
      });
    } else {
      items.forEach(pushCqItem);
    }

    onSave(generated, isEditMode ? 'update' : 'create', targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border sm:border-slate-200">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-emerald-700 text-white shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold truncate">
              {config.label} — সৃজনশীল ({toBengaliNumber(config.cqTotalMarks)})
            </h2>
            <p className="text-[10px] sm:text-xs text-emerald-100 truncate">
              {isThreePart ? 'ক=২, খ=৪, গ=৪' : 'ক=১, খ=২, গ=৩, ঘ=৪'} • {toBengaliNumber(config.cqTotalCount)}টি → {toBengaliNumber(config.cqAnswerCount)}টি
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Controls + Symbol Bar */}
        <div className="px-2.5 py-1.5 sm:px-5 sm:py-2 bg-slate-50 border-b border-slate-200 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto whitespace-nowrap text-[11px]">
            <div className="flex items-center gap-2 shrink-0">
              <label className="inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTopBanner}
                  onChange={(e) => setIncludeTopBanner(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                শিরোনাম
              </label>
              {hasSections && (
                <label className="inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSectionBanners}
                    onChange={(e) => setIncludeSectionBanners(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  বিভাগ
                </label>
              )}
              {config.showMathToolbarByDefault && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSymbolBar((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                      showSymbolBar ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <Sigma className="w-3 h-3" /> সূত্র
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                      showPreview ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {showPreview ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} প্রিভিউ
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {toBengaliNumber(items.length)}টি
              </span>
              <button
                type="button"
                onClick={() => setItems(config.defaultCqItems.map((it) => ({ ...it })))}
                className="p-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                title="ডিফল্ট রিসেট"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {showSymbolBar && <MathSymbolToolbar onInsert={handleInsertSymbol} />}
        </div>

        {/* Minimal High-Density Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 sm:px-5 sm:py-3.5 space-y-2.5 sm:space-y-3.5 bg-slate-50/40">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              {/* Slim Card Bar */}
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {toBengaliNumber(idx + 1)}
                  </span>
                  {hasSections ? (
                    <select
                      value={item.sectionId || config.sections[0].id}
                      onChange={(e) => updateItem(item.id, { sectionId: e.target.value })}
                      className="text-[11px] px-1.5 py-0.5 rounded border border-slate-300 bg-white font-semibold text-slate-700 outline-none truncate max-w-[210px] sm:max-w-none"
                    >
                      {config.sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.shortLabel}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-slate-700">প্রশ্ন {toBengaliNumber(idx + 1)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded shrink-0"
                  title="মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inputs */}
              <div className="p-2.5 sm:p-3 space-y-2">
                <div>
                  <textarea
                    rows={2}
                    value={item.stimulusText}
                    onFocus={(e) => {
                      activeFieldRef.current = { id: item.id, field: 'stimulusText', el: e.currentTarget };
                    }}
                    onChange={(e) => updateItem(item.id, { stimulusText: e.target.value })}
                    placeholder="উদ্দীপক লিখুন..."
                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 outline-none resize-y"
                  />
                  {showPreview && item.stimulusText.trim() && (
                    <div className="mt-1 px-2 py-1 rounded bg-emerald-50/50 border border-emerald-200/70 text-xs text-slate-800 font-serif">
                      <MultiScriptText text={item.stimulusText} />
                    </div>
                  )}
                </div>

                <StimulusMediaEditor
                  image={item.stimulusImage}
                  table={item.stimulusTable}
                  onChangeImage={(stimulusImage) => updateItem(item.id, { stimulusImage })}
                  onChangeTable={(stimulusTable) => updateItem(item.id, { stimulusTable })}
                />

                {/* Sub-questions: Full-width inputs on mobile! */}
                <div className="space-y-1.5">
                  {(
                    [
                      { field: 'qKa' as const, badge: isThreePart ? 'ক (২)' : 'ক (১)', placeholder: 'ক. প্রশ্ন...' },
                      { field: 'qKha' as const, badge: isThreePart ? 'খ (৪)' : 'খ (২)', placeholder: 'খ. প্রশ্ন...' },
                      { field: 'qGa' as const, badge: isThreePart ? 'গ (৪)' : 'গ (৩)', placeholder: 'গ. প্রশ্ন...' },
                      ...(isThreePart
                        ? []
                        : [{ field: 'qGha' as const, badge: 'ঘ (৪)', placeholder: 'ঘ. প্রশ্ন...' }]),
                    ]
                  ).map((part) => (
                    <div key={part.field} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-1 rounded-md shrink-0 w-12 text-center">
                          {part.badge}
                        </span>
                        <input
                          type="text"
                          value={item[part.field] || ''}
                          onFocus={(e) => {
                            activeFieldRef.current = {
                              id: item.id,
                              field: part.field,
                              el: e.currentTarget,
                            };
                          }}
                          onChange={(e) => updateItem(item.id, { [part.field]: e.target.value })}
                          placeholder={part.placeholder}
                          className="flex-1 min-w-0 text-sm px-2.5 py-1 rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                        />
                      </div>
                      {showPreview && (item[part.field] || '').includes('$') && (
                        <div className="ml-13 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-xs font-serif text-slate-800">
                          <MultiScriptText text={item[part.field]} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="w-full py-2 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> নতুন সৃজনশীল প্রশ্ন
          </button>
        </div>

        {/* Slim Footer */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-white border-t border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-600">
            মোট <strong>{toBengaliNumber(items.length)}</strong>টি প্রশ্ন
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveToCanvas}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEditMode ? 'আপডেট' : 'যুক্ত করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
