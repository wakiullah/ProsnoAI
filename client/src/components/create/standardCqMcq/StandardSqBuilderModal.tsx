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
  StandardSqItemConfig,
  StandardSubjectConfig,
} from './standardCqMcqConfig';
import { MathSymbolToolbar } from './MathSymbolToolbar';
import { StimulusMediaEditor } from './StimulusMediaEditor';

export interface StandardSqGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractStandardSqGroups(questions: QuestionData[]): StandardSqGroup[] {
  const groups: StandardSqGroup[] = [];
  const seen = new Set<string>();
  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith(STD_GROUP_PREFIX.SQ) && !seen.has(q.groupId)) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `সংক্ষিপ্ত প্রশ্ন ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });
  return groups;
}

interface StandardSqBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StandardSubjectConfig;
  grade?: string;
  subject?: string;
  allGroups: StandardSqGroup[];
  activeGroupId: string | null;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const StandardSqBuilderModal: React.FC<StandardSqBuilderModalProps> = ({
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
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [sectionTitle, setSectionTitle] = useState(
    `খ অংশ — সংক্ষিপ্ত প্রশ্ন (যেকোনো ${toBengaliNumber(config.sqAnswerCount)}টি প্রশ্নের উত্তর দাও)`
  );
  const [answerCount, setAnswerCount] = useState(config.sqAnswerCount);
  const [marksPerQ, setMarksPerQ] = useState(config.sqMarksPerQuestion);
  const [showSymbolBar, setShowSymbolBar] = useState(config.showMathToolbarByDefault);
  const [showPreview, setShowPreview] = useState(config.showMathToolbarByDefault);
  const [items, setItems] = useState<StandardSqItemConfig[]>(config.defaultSqItems);

  const activeFieldRef = useRef<{ id: string; el: HTMLTextAreaElement | null } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowSymbolBar(config.showMathToolbarByDefault);
    setShowPreview(config.showMathToolbarByDefault);

    if (!activeGroup) {
      setSectionTitle(
        `খ অংশ — সংক্ষিপ্ত প্রশ্ন (যেকোনো ${toBengaliNumber(config.sqAnswerCount)}টি প্রশ্নের উত্তর দাও)`
      );
      setAnswerCount(config.sqAnswerCount);
      setMarksPerQ(config.sqMarksPerQuestion);
      setItems(config.defaultSqItems.map((it) => ({ ...it })));
      return;
    }

    const qs = activeGroup.questions;
    const banner = qs.find((q) => q.groupRole === 'std_sq_banner');
    if (banner?.stemOrPassage) setSectionTitle(banner.stemOrPassage);

    const reconstructed: StandardSqItemConfig[] = qs
      .filter((q) => q.groupRole === 'std_sq_item' || q.typology === 'DESCRIPTIVE')
      .map((q, idx) => ({
        id: q._id || `std_sq_${idx}`,
        questionText: q.stemOrPassage || '',
        marks: q.marks || config.sqMarksPerQuestion,
        stimulusImage: q.stimulusImage,
        stimulusTable: q.stimulusTable,
      }));

    setItems(reconstructed.length > 0 ? reconstructed : config.defaultSqItems.map((it) => ({ ...it })));
  }, [isOpen, activeGroup, config]);

  if (!isOpen) return null;

  const updateItem = (id: string, patch: Partial<StandardSqItemConfig>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const handleInsertSymbol = (snippet: string) => {
    const target = activeFieldRef.current;
    if (!target) return;
    const item = items.find((it) => it.id === target.id);
    if (!item) return;

    const currentVal = item.questionText || '';
    const el = target.el;
    if (el && typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const nextVal = currentVal.slice(0, start) + snippet + currentVal.slice(end);
      updateItem(target.id, { questionText: nextVal });
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      updateItem(target.id, { questionText: currentVal + snippet });
    }
  };

  const handleSaveToCanvas = () => {
    const targetGroupId = activeGroup ? activeGroup.groupId : `${STD_GROUP_PREFIX.SQ}-${Date.now()}`;
    const totalMarks = answerCount * marksPerQ;
    const generated: QuestionData[] = [
      {
        subject: subjectLabel,
        grade,
        typology: 'GROUP_TITLE',
        stemOrPassage: sectionTitle.trim() || 'সংক্ষিপ্ত প্রশ্ন',
        customMarksText: `${toBengaliNumber(answerCount)}×${toBengaliNumber(marksPerQ)} = ${toBengaliNumber(totalMarks)}`,
        marks: totalMarks,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
        groupId: targetGroupId,
        groupRole: 'std_sq_banner',
      },
      ...items.map(
        (it, idx): QuestionData => ({
          subject: subjectLabel,
          grade,
          typology: 'DESCRIPTIVE',
          stemOrPassage: it.questionText.trim() || `সংক্ষিপ্ত প্রশ্ন ${toBengaliNumber(idx + 1)}`,
          stimulusImage: it.stimulusImage,
          stimulusTable: it.stimulusTable,
          customNumber: `${toBengaliNumber(idx + 1)}.`,
          customMarksText: toBengaliNumber(it.marks || marksPerQ),
          marks: it.marks || marksPerQ,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
          groupId: targetGroupId,
          groupRole: 'std_sq_item',
        })
      ),
    ];

    onSave(generated, isEditMode ? 'update' : 'create', targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border sm:border-slate-200">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-amber-600 text-white shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold truncate">
              {config.label} — সংক্ষিপ্ত প্রশ্ন ({toBengaliNumber(answerCount * marksPerQ)})
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-100 truncate">
              যেকোনো {toBengaliNumber(answerCount)}টি × {toBengaliNumber(marksPerQ)} নম্বর
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Settings + Symbol Bar */}
        <div className="px-2.5 py-1.5 sm:px-5 sm:py-2 bg-slate-50 border-b border-slate-200 space-y-1.5 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="flex-1 min-w-[160px] px-2 py-1 rounded-md border border-slate-300 bg-white font-semibold outline-none focus:border-amber-500"
              placeholder="শিরোনাম..."
            />
            <div className="flex items-center gap-1.5">
              <label className="inline-flex items-center gap-1 font-semibold text-slate-700">
                উত্তর:
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={answerCount}
                  onChange={(e) => setAnswerCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-10 px-1 py-0.5 rounded border border-slate-300 bg-white text-center font-bold"
                />
              </label>
              <label className="inline-flex items-center gap-1 font-semibold text-slate-700">
                মান:
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={marksPerQ}
                  onChange={(e) => setMarksPerQ(Math.max(1, Number(e.target.value) || 1))}
                  className="w-10 px-1 py-0.5 rounded border border-slate-300 bg-white text-center font-bold"
                />
              </label>
              {config.showMathToolbarByDefault && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSymbolBar((v) => !v)}
                    className={`p-1 rounded border ${showSymbolBar ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-300'}`}
                    title="সূত্র বার"
                  >
                    <Sigma className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className={`p-1 rounded border ${showPreview ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-300'}`}
                    title="প্রিভিউ"
                  >
                    {showPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setItems(config.defaultSqItems.map((it) => ({ ...it })))}
                className="p-1 rounded border border-slate-300 bg-white"
                title="ডিফল্ট"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showSymbolBar && <MathSymbolToolbar onInsert={handleInsertSymbol} />}
        </div>

        {/* High-Density Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 sm:px-5 sm:py-3.5 space-y-2 bg-slate-50/40">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                  {toBengaliNumber(idx + 1)}
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <textarea
                    rows={2}
                    value={item.questionText}
                    onFocus={(e) => {
                      activeFieldRef.current = { id: item.id, el: e.currentTarget };
                    }}
                    onChange={(e) => updateItem(item.id, { questionText: e.target.value })}
                    placeholder="সংক্ষিপ্ত প্রশ্ন লিখুন..."
                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-amber-500 outline-none resize-y"
                  />
                  {showPreview && item.questionText.includes('$') && (
                    <div className="px-2 py-1 rounded bg-amber-50/50 border border-amber-200/70 text-xs font-serif">
                      <MultiScriptText text={item.questionText} />
                    </div>
                  )}
                  <StimulusMediaEditor
                    image={item.stimulusImage}
                    table={item.stimulusTable}
                    onChangeImage={(stimulusImage) => updateItem(item.id, { stimulusImage })}
                    onChangeTable={(stimulusTable) => updateItem(item.id, { stimulusTable })}
                  />
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
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { id: `std_sq_${Date.now()}_${prev.length}`, questionText: '', marks: marksPerQ },
              ])
            }
            className="w-full py-2 rounded-xl border border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-800 font-bold text-xs inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> নতুন সংক্ষিপ্ত প্রশ্ন
          </button>
        </div>

        {/* Slim Footer */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-white border-t border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-600">
            <strong>{toBengaliNumber(items.length)}</strong>টি প্রশ্ন • মান <strong>{toBengaliNumber(answerCount * marksPerQ)}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveToCanvas}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
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
