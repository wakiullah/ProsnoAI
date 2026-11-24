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
  Underline,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  Bangla2ndHscPartFormat,
  Bangla2ndHscQuestionConfig,
  Bangla2ndHscSubPart,
  DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS,
  ROMAN_LOWER_LABELS,
  formatBengaliMarks2Digit,
} from './bangla2ndDefaults';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface Bangla2ndHscGrammarGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractBangla2ndHscGrammarGroups(
  questions: QuestionData[]
): Bangla2ndHscGrammarGroup[] {
  const groups: Bangla2ndHscGrammarGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('bangla2nd-hsc-grammar') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `ব্যাকরণ অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

export function serializeHscSubPartToSubQ(
  partLetter: 'ক' | 'খ',
  sub: Bangla2ndHscSubPart,
  marks: number
) {
  const bloomLevel =
    sub.format === 'ROMAN_LIST'
      ? ('application' as const)
      : sub.format === 'PASSAGE_OR_WORDS'
      ? ('comprehension' as const)
      : ('knowledge' as const);

  const bodyText =
    sub.format === 'ROMAN_LIST'
      ? (sub.romanItems || []).map((s) => s.trim()).join('\n')
      : sub.format === 'PASSAGE_OR_WORDS'
      ? (sub.passageOrWords || '').trim()
      : '';

  return {
    part: partLetter as any,
    bloomLevel,
    bloomTitle: sub.prompt.trim(),
    questionText: bodyText,
    marks,
  };
}

export function deserializeSubQToHscSubPart(
  sq: any,
  defSub: Bangla2ndHscSubPart
): Bangla2ndHscSubPart {
  if (!sq) return defSub;
  const format: Bangla2ndHscPartFormat =
    sq.bloomLevel === 'application'
      ? 'ROMAN_LIST'
      : sq.bloomLevel === 'comprehension'
      ? 'PASSAGE_OR_WORDS'
      : 'SINGLE';

  if (format === 'ROMAN_LIST') {
    const rawLines = (sq.questionText || '').split('\n');
    const padded =
      rawLines.length >= 5
        ? rawLines
        : [...rawLines, ...Array(Math.max(0, 8 - rawLines.length)).fill('')];
    return {
      ...defSub,
      format,
      prompt: sq.bloomTitle || defSub.prompt,
      romanItems: padded,
    };
  }

  if (format === 'PASSAGE_OR_WORDS') {
    return {
      ...defSub,
      format,
      prompt: sq.bloomTitle || defSub.prompt,
      passageOrWords: sq.questionText || '',
    };
  }

  return {
    ...defSub,
    format: 'SINGLE',
    prompt: sq.bloomTitle || sq.questionText || defSub.prompt,
  };
}

interface SubPartEditorProps {
  partLabel: '(ক)' | '(খ)';
  subPart: Bangla2ndHscSubPart;
  onChange: (updated: Bangla2ndHscSubPart) => void;
}

export const Bangla2ndHscSubPartEditor: React.FC<SubPartEditorProps> = ({
  partLabel,
  subPart,
  onChange,
}) => {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleFormatSwitch = (fmt: Bangla2ndHscPartFormat) => {
    if (fmt === 'ROMAN_LIST') {
      onChange({
        ...subPart,
        format: 'ROMAN_LIST',
        romanItems:
          subPart.romanItems && subPart.romanItems.length > 0
            ? subPart.romanItems
            : ['', '', '', '', '', '', '', ''],
      });
    } else if (fmt === 'PASSAGE_OR_WORDS') {
      onChange({
        ...subPart,
        format: 'PASSAGE_OR_WORDS',
        passageOrWords: subPart.passageOrWords || '',
      });
    } else {
      onChange({
        ...subPart,
        format: 'SINGLE',
      });
    }
  };

  const handleWrapUnderline = (rIdx: number) => {
    const el = inputRefs.current[rIdx];
    const items = [...(subPart.romanItems || [])];
    const currentVal = items[rIdx] || '';

    if (el && el.selectionStart !== null && el.selectionEnd !== null && el.selectionEnd > el.selectionStart) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = currentVal.slice(start, end);
      const nextVal = `${currentVal.slice(0, start)}<u>${selected}</u>${currentVal.slice(end)}`;
      items[rIdx] = nextVal;
      onChange({ ...subPart, romanItems: items });
    } else {
      items[rIdx] = `${currentVal} <u>শব্দ</u>`.trim();
      onChange({ ...subPart, romanItems: items });
    }
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold ${
            partLabel === '(ক)'
              ? 'bg-slate-800 text-white'
              : 'bg-indigo-800 text-white'
          }`}
        >
          অংশ {partLabel}
        </span>

        {/* Format Selector for this part */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] sm:text-[11px] font-bold">
          {[
            { id: 'SINGLE' as const, label: 'একক প্রশ্ন' },
            { id: 'PASSAGE_OR_WORDS' as const, label: 'শব্দতালিকা / অনুচ্ছেদ' },
            { id: 'ROMAN_LIST' as const, label: 'রোমান তালিকা (i–viii)' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFormatSwitch(f.id)}
              className={`px-2 py-1 rounded-md transition ${
                subPart.format === f.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Input */}
      <input
        type="text"
        value={subPart.prompt}
        onChange={(e) => onChange({ ...subPart, prompt: e.target.value })}
        placeholder={subPart.promptPlaceholder || `অংশ ${partLabel}-এর প্রশ্ন বা নির্দেশনা লিখুন...`}
        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500"
      />

      {/* Format 2: Word List or Passage */}
      {subPart.format === 'PASSAGE_OR_WORDS' && (
        <textarea
          rows={3}
          value={subPart.passageOrWords || ''}
          onChange={(e) => onChange({ ...subPart, passageOrWords: e.target.value })}
          placeholder={
            subPart.passagePlaceholder ||
            'শব্দতালিকা (কমা দিয়ে) অথবা অনুচ্ছেদটি এখানে লিখুন...'
          }
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed"
        />
      )}

      {/* Format 3: Roman Numeral Sentence List (i) - (viii) */}
      {subPart.format === 'ROMAN_LIST' && (
        <div className="space-y-1.5 pl-2 border-l-2 border-indigo-300">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-indigo-900 font-bold">
            <span>রোমান ক্রমিকের বাক্যসমূহ (i, ii, iii...):</span>
            {subPart.allowUnderlineHelper && (
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                💡 বাক্যের যেকোনো শব্দ সিলেক্ট করে ডানপাশের <u>U</u> বাটনে চাপলে আন্ডারলাইন হবে
              </span>
            )}
          </div>

          {(subPart.romanItems || []).map((line, rIdx) => {
            const rom = ROMAN_LOWER_LABELS[rIdx] || `(${rIdx + 1})`;
            return (
              <div key={rIdx} className="flex items-center gap-1.5">
                <span className="text-xs italic font-serif font-bold text-slate-700 w-8 shrink-0">
                  {rom}
                </span>
                <input
                  ref={(el) => {
                    inputRefs.current[rIdx] = el;
                  }}
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const next = [...(subPart.romanItems || [])];
                    next[rIdx] = e.target.value;
                    onChange({ ...subPart, romanItems: next });
                  }}
                  placeholder={subPart.romanPlaceholder || `বাক্য ${rom} লিখুন...`}
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-500"
                />
                {subPart.allowUnderlineHelper && (
                  <button
                    type="button"
                    onClick={() => handleWrapUnderline(rIdx)}
                    title="নির্বাচিত শব্দে আন্ডারলাইন (<u>...</u>) দিন"
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                )}
                {(subPart.romanItems?.length || 0) > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = (subPart.romanItems || []).filter((_, i) => i !== rIdx);
                      onChange({ ...subPart, romanItems: next });
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded shrink-0"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {(subPart.romanItems?.length || 0) < 10 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...subPart,
                  romanItems: [...(subPart.romanItems || []), ''],
                })
              }
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 hover:text-indigo-950 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition mt-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ আরও বাক্য যুক্ত করুন</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface Bangla2ndHscGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: Bangla2ndHscGrammarGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    proceedToNirmiti?: boolean
  ) => void;
}

export const Bangla2ndHscGrammarModal: React.FC<Bangla2ndHscGrammarModalProps> = ({
  isOpen,
  onClose,
  grade = 'দ্বাদশ শ্রেণি (এইচএসসি)',
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

  const [items, setItems] = useState<Bangla2ndHscQuestionConfig[]>(
    DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS
  );

  useEffect(() => {
    if (!activeGroup) {
      setItems(DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS);
      return;
    }

    const qs = activeGroup.questions.filter(
      (q) => q.typology !== 'GROUP_TITLE' && q.typology !== 'SECTION_TITLE'
    );
    if (qs.length > 0) {
      const hydrated = qs.map((q, idx) => {
        const def =
          DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS[idx] ||
          DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS[0];
        const subs = q.subQuestions || [];
        return {
          ...def,
          id: q._id || def.id,
          qNumber: idx + 1,
          marks: q.marks || 5,
          partKa: deserializeSubQToHscSubPart(subs[0], def.partKa),
          partKha: def.partKha
            ? deserializeSubQToHscSubPart(subs[1], def.partKha)
            : undefined,
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

  const handleUpdateQuestion = (
    idx: number,
    patch: Partial<Bangla2ndHscQuestionConfig>
  ) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    return items.map((it, idx) => {
      const qNum = idx + 1;
      const subQuestions = [
        serializeHscSubPartToSubQ('ক', it.partKa, it.marks),
      ];
      if (it.partKha) {
        subQuestions.push(serializeHscSubPartToSubQ('খ', it.partKha, it.marks));
      }

      return {
        groupId: targetGroupId,
        groupRole: 'bangla2nd_hsc_pair',
        subject,
        grade,
        typology: 'DESCRIPTIVE',
        customNumber: `${toBengaliNumber(qNum)}।`,
        stemOrPassage: '',
        customMarksText: formatBengaliMarks2Digit(it.marks),
        subQuestions,
        marks: it.marks,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
      };
    });
  };

  const handleApply = (proceedToNirmiti = false) => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `bangla2nd-hsc-grammar-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId, proceedToNirmiti);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  বাংলা ২য় পত্র (HSC ও আলিম) — ব্যাকরণ অংশ (১–৬ নং প্রশ্ন)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 font-bold">
                  মোট মান: {toBengaliNumber(totalMarks)} / ৩০
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5 truncate">
                ১. উচ্চারণ (০৫) • ২. বানান (০৫) • ৩. শব্দশ্রেণি (০৫) • ৪. শব্দগঠন/সমাস (০৫) • ৫. বাক্যতত্ত্ব (০৫) • ৬. শুদ্ধ প্রয়োগ (০৫)
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
          {items.map((item, qIdx) => {
            const qNumBn = toBengaliNumber(qIdx + 1);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-700 text-white text-xs font-extrabold">
                      প্রশ্ন {qNumBn}।
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
                      {item.topicBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <span className="text-[11px] font-bold text-slate-600">পূর্ণমান:</span>
                    <input
                      type="number"
                      value={item.marks}
                      onChange={(e) =>
                        handleUpdateQuestion(qIdx, {
                          marks: Number(e.target.value) || 5,
                        })
                      }
                      className="w-10 text-center text-xs font-extrabold bg-white border border-slate-200 rounded py-0.5"
                    />
                  </div>
                </div>

                {/* Part (ক) */}
                <Bangla2ndHscSubPartEditor
                  partLabel="(ক)"
                  subPart={item.partKa}
                  onChange={(updatedKa) =>
                    handleUpdateQuestion(qIdx, { partKa: updatedKa })
                  }
                />

                {/* Centered অথবা, Divider */}
                <div className="flex items-center justify-center">
                  <span className="px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                    অথবা,
                  </span>
                </div>

                {/* Part (খ) */}
                {item.partKha && (
                  <Bangla2ndHscSubPartEditor
                    partLabel="(খ)"
                    subPart={item.partKha}
                    onChange={(updatedKha) =>
                      handleUpdateQuestion(qIdx, { partKha: updatedKha })
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_BANGLA2ND_HSC_GRAMMAR_ITEMS)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট বোর্ড কাঠামোতে রিসেট</span>
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
                  ? `পেপারে ব্যাকরণ অংশ আপডেট করুন (${toBengaliNumber(totalMarks)} নম্বর)`
                  : `পেপারে ব্যাকরণ অংশ যোগ করুন (${toBengaliNumber(totalMarks)} নম্বর)`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-xs font-extrabold shadow-sm transition"
            >
              <span>সেভ ও নির্মিতি অংশে (৭–১২ নং : ৭০) যান</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
