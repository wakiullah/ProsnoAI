'use client';

import React, { useRef, useEffect } from 'react';
import { Trash2, Plus, CheckCircle2, Layers, ListChecks, HelpCircle } from 'lucide-react';
import {
  BanglaMcqItemConfig,
  BanglaMcqSubQuestion,
  BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS,
  toBengaliNumber,
} from './bangla1stDefaults';

interface BanglaMcqItemCardProps {
  item: BanglaMcqItemConfig;
  startQuestionNumber: number;
  onChange: (updated: BanglaMcqItemConfig) => void;
  onDelete: () => void;
}

const OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ'];

export const BanglaMcqItemCard: React.FC<BanglaMcqItemCardProps> = ({
  item,
  startQuestionNumber,
  onChange,
  onDelete,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastAddedSubIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastAddedSubIdRef.current || !cardRef.current) return;
    const targetEl = cardRef.current.querySelector(
      `[data-sub-mcq-id="${lastAddedSubIdRef.current}"]`
    ) as HTMLElement | null;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = targetEl.querySelector('input') as HTMLInputElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 180);
      }
    }
    lastAddedSubIdRef.current = null;
  }, [item.linkedQuestions?.length]);

  const handleOptionChange = (idx: number, val: string) => {
    const next: [string, string, string, string] = [...item.options] as any;
    next[idx] = val;
    onChange({ ...item, options: next });
  };

  const handleStatementChange = (idx: number, val: string) => {
    const cur = item.statements || ['', '', ''];
    const next: [string, string, string] = [...cur] as any;
    next[idx] = val;
    onChange({ ...item, statements: next });
  };

  const handleSubQuestionUpdate = (sIdx: number, patch: Partial<BanglaMcqSubQuestion>) => {
    const list = [...(item.linkedQuestions || [])];
    if (!list[sIdx]) return;
    list[sIdx] = { ...list[sIdx], ...patch };
    onChange({ ...item, linkedQuestions: list });
  };

  const handleAddLinkedQuestion = (subType: 'SIMPLE' | 'MULTIPLE_COMPLETION') => {
    const list = [...(item.linkedQuestions || [])];
    const newId = `sub_${Date.now()}_${list.length + 1}`;
    lastAddedSubIdRef.current = newId;

    if (subType === 'MULTIPLE_COMPLETION') {
      list.push({
        id: newId,
        subType: 'MULTIPLE_COMPLETION',
        questionText: '',
        statements: ['', '', ''],
        options: [...BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS],
        correctIndex: 0,
      });
    } else {
      list.push({
        id: newId,
        subType: 'SIMPLE',
        questionText: '',
        options: ['', '', '', ''],
        correctIndex: 0,
      });
    }

    const nextEndNum = toBengaliNumber(startQuestionNumber + list.length - 1);
    const startNum = toBengaliNumber(startQuestionNumber);
    onChange({
      ...item,
      stemInstruction: `নিচের উদ্দীপকটি পড়ে ${startNum}–${nextEndNum}নং প্রশ্নের উত্তর দাও:`,
      linkedQuestions: list,
    });
  };

  const handleRemoveLinkedQuestion = (sIdx: number) => {
    const list = (item.linkedQuestions || []).filter((_, i) => i !== sIdx);
    onChange({ ...item, linkedQuestions: list });
  };

  const endQNum =
    item.entryType === 'STEM_GROUP'
      ? startQuestionNumber + Math.max(1, (item.linkedQuestions?.length || 1) - 1)
      : startQuestionNumber;

  const badgeLabel =
    item.entryType === 'STEM_GROUP'
      ? `প্রশ্ন ${toBengaliNumber(startQuestionNumber)}–${toBengaliNumber(endQNum)}`
      : `প্রশ্ন ${toBengaliNumber(startQuestionNumber)}।`;

  const typeInfo =
    item.entryType === 'MULTIPLE_COMPLETION'
      ? {
          label: 'বহুপদী (i, ii, iii)',
          icon: ListChecks,
          className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        }
      : item.entryType === 'STEM_GROUP'
      ? {
          label: 'উদ্দীপকভিত্তিক গুচ্ছ',
          icon: Layers,
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        }
      : {
          label: 'সাধারণ MCQ',
          icon: HelpCircle,
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };

  const TypeIcon = typeInfo.icon;

  return (
    <div
      ref={cardRef}
      data-mcq-item-id={item.id}
      className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3 transition hover:border-emerald-300"
    >
      {/* Top Bar: Question Number + Fixed Type Badge + Delete */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-extrabold">
            {badgeLabel}
          </span>

          <span
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${typeInfo.className}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{typeInfo.label}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 text-xs font-bold transition"
          title="প্রশ্নটি মুছুন"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">মুছুন</span>
        </button>
      </div>

      {/* ─── CASE 1 & 2: SIMPLE OR MULTIPLE COMPLETION MCQ ─── */}
      {item.entryType !== 'STEM_GROUP' ? (
        <div className="space-y-2.5">
          <input
            type="text"
            value={item.questionText}
            onChange={(e) => onChange({ ...item, questionText: e.target.value })}
            placeholder="নতুন বহুনির্বাচনি প্রশ্ন লিখুন?"
            className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none bg-slate-50/60 focus:bg-white transition"
          />

          {/* Statements (i, ii, iii) for Multiple Completion */}
          {item.entryType === 'MULTIPLE_COMPLETION' && (
            <div className="pl-2.5 sm:pl-3 border-l-2 border-indigo-300 space-y-2 bg-indigo-50/40 p-2.5 sm:p-3 rounded-r-xl">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-[11px] font-bold text-indigo-900">
                  বহুপদী তথ্যসমূহ (i, ii, iii) — নিচে অটোমেটিক “নিচের কোনটি সঠিক?” যুক্ত হবে:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...item,
                      options: [...BANGLA_MULTI_COMPLETION_DEFAULT_OPTIONS],
                    })
                  }
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition"
                >
                  ডিফল্ট অপশন (i ও ii...) বসান
                </button>
              </div>
              {(['i.', 'ii.', 'iii.'] as const).map((roman, rIdx) => (
                <div key={roman} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 w-5 shrink-0">
                    {roman}
                  </span>
                  <input
                    type="text"
                    value={item.statements?.[rIdx] || ''}
                    onChange={(e) => handleStatementChange(rIdx, e.target.value)}
                    placeholder={`তথ্য ${roman} লিখুন`}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 4 Options Grid (ক, খ, গ, ঘ) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTION_LABELS.map((lbl, oIdx) => {
              const isCorrect = item.correctIndex === oIdx;
              return (
                <div
                  key={lbl}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...item, correctIndex: oIdx })}
                    title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                    className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 transition ${
                      isCorrect
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                    }`}
                  >
                    {lbl}
                  </button>
                  <input
                    type="text"
                    value={item.options[oIdx] || ''}
                    onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                    placeholder={`অপশন ${lbl}`}
                    className="flex-1 min-w-0 text-xs sm:text-[13px] font-medium bg-transparent outline-none text-slate-800"
                  />
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ─── CASE 3: STEM / PASSAGE LINKED MCQ GROUP (উদ্দীপকভিত্তিক গুচ্ছ) ─── */
        <div className="space-y-3 bg-amber-50/30 p-2.5 sm:p-3.5 rounded-xl border border-amber-200/80">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-900 block">
              উদ্দীপক নির্দেশনা (যেমন: নিচের উদ্দীপকটি পড়ে {toBengaliNumber(startQuestionNumber)} ও{' '}
              {toBengaliNumber(endQNum)}নং প্রশ্নের উত্তর দাও:):
            </label>
            <input
              type="text"
              value={item.stemInstruction || ''}
              onChange={(e) => onChange({ ...item, stemInstruction: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-amber-300 bg-white outline-none focus:border-amber-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-900 block">
              উদ্দীপক (গদ্য অনুচ্ছেদ অথবা কবিতার চরণ):
            </label>
            <textarea
              rows={3}
              value={item.stemPassage || ''}
              onChange={(e) => onChange({ ...item, stemPassage: e.target.value })}
              placeholder="উদ্দীপকের টেক্সট বা কবিতার লাইনগুলো লিখুন..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white outline-none focus:border-amber-600 leading-relaxed"
            />
          </div>

          {/* Linked Sub-MCQs */}
          <div className="space-y-2.5 pt-1">
            {(item.linkedQuestions || []).map((subQ, sIdx) => {
              const qNum = toBengaliNumber(startQuestionNumber + sIdx);
              const isMulti = subQ.subType === 'MULTIPLE_COMPLETION';
              return (
                <div
                  key={subQ.id}
                  data-sub-mcq-id={subQ.id}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[11px] font-bold">
                        প্রশ্ন {qNum}।
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isMulti
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isMulti ? 'বহুপদী (i, ii, iii)' : 'সাধারণ MCQ'}
                      </span>
                    </div>

                    {(item.linkedQuestions?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkedQuestion(sIdx)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-rose-600 hover:bg-rose-50 font-bold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={subQ.questionText}
                    onChange={(e) =>
                      handleSubQuestionUpdate(sIdx, { questionText: e.target.value })
                    }
                    placeholder="নতুন বহুনির্বাচনি প্রশ্ন লিখুন?"
                    className="w-full px-2.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50/40 focus:bg-white"
                  />

                  {isMulti && (
                    <div className="space-y-1.5 pl-2.5 border-l-2 border-indigo-300 bg-indigo-50/30 p-2 rounded-r-lg">
                      {(['i.', 'ii.', 'iii.'] as const).map((rom, rIdx) => (
                        <div key={rom} className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-indigo-700 w-5 shrink-0">
                            {rom}
                          </span>
                          <input
                            type="text"
                            value={subQ.statements?.[rIdx] || ''}
                            onChange={(e) => {
                              const cur = subQ.statements || ['', '', ''];
                              const next: [string, string, string] = [...cur] as any;
                              next[rIdx] = e.target.value;
                              handleSubQuestionUpdate(sIdx, { statements: next });
                            }}
                            placeholder={`তথ্য ${rom} লিখুন`}
                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 bg-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {OPTION_LABELS.map((lbl, oIdx) => {
                      const isCor = subQ.correctIndex === oIdx;
                      return (
                        <div
                          key={lbl}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                            isCor ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSubQuestionUpdate(sIdx, { correctIndex: oIdx })}
                            className={`w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${
                              isCor ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lbl}
                          </button>
                          <input
                            type="text"
                            value={subQ.options[oIdx] || ''}
                            onChange={(e) => {
                              const nextOpts: [string, string, string, string] = [
                                ...subQ.options,
                              ] as any;
                              nextOpts[oIdx] = e.target.value;
                              handleSubQuestionUpdate(sIdx, { options: nextOpts });
                            }}
                            placeholder={`অপশন ${lbl}`}
                            className="flex-1 min-w-0 text-xs bg-transparent outline-none"
                          />
                          {isCor && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Add sub-question buttons inside stimulus group */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddLinkedQuestion('SIMPLE')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200/90 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ এই উদ্দীপকে সাধারণ MCQ</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddLinkedQuestion('MULTIPLE_COMPLETION')}
                className="flex items-center gap-1 text-xs font-bold text-indigo-900 bg-indigo-100/90 hover:bg-indigo-200/90 px-3 py-1.5 rounded-lg transition"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>+ এই উদ্দীপকে বহুপদী (i, ii, iii)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
