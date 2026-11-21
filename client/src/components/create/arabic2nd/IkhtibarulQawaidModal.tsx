'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QuestionData } from 'proshno-shared';
import {
  X,
  BookOpen,
  CheckCircle2,
  Plus,
  RotateCcw,
  Layers,
  PlusCircle,
  Filter,
  ArrowRight,
} from 'lucide-react';
import {
  DEFAULT_IKHTIBAR_ITEMS,
  IkhtibarItemConfig,
} from './arabic2ndDefaults';
import { IkhtibarItemCard } from './IkhtibarItemCard';

export interface IkhtibarQawaidGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractIkhtibarQawaidGroups(questions: QuestionData[]): IkhtibarQawaidGroup[] {
  const groups: IkhtibarQawaidGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('ikhtibar-qawaid-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `কাওয়ায়েদ পরীক্ষা ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
const ARABIC_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];

interface IkhtibarulQawaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: IkhtibarQawaidGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    proceedToInsha?: boolean
  ) => void;
}

export const IkhtibarulQawaidModal: React.FC<IkhtibarulQawaidModalProps> = ({
  isOpen,
  onClose,
  allGroups,
  activeGroupId,
  onSelectGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  // Q3 main configuration
  const [q3Number, setQ3Number] = useState('٣-');
  const [q3Title, setQ3Title] = useState('اختبار القواعد (خمسة فقط) :');
  const [q3MarksFormula, setQ3MarksFormula] = useState('٢٠ = ٤ × ٥');
  const [q3Marks, setQ3Marks] = useState(20);

  // Items configuration
  const [items, setItems] = useState<IkhtibarItemConfig[]>(DEFAULT_IKHTIBAR_ITEMS);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');

  // Sync state on open or activeGroup change
  useEffect(() => {
    if (!activeGroup) {
      setQ3Number('٣-');
      setQ3Title('اختبار القواعد (خمسة فقط) :');
      setQ3MarksFormula('٢٠ = ٤ × ٥');
      setQ3Marks(20);
      setItems(DEFAULT_IKHTIBAR_ITEMS);
      return;
    }

    const qs = activeGroup.questions;
    const titleQ = qs.find(
      (q) => q.groupRole === 'ikhtibar_q3_title' || (q.customNumber && q.customNumber.includes('٣'))
    );
    if (titleQ) {
      setQ3Number(titleQ.customNumber || '٣-');
      setQ3Title(titleQ.stemOrPassage || 'اختبار القواعد (خمسة فقط) :');
      setQ3MarksFormula(titleQ.customMarksText || '٢٠ = ٤ × ٥');
      setQ3Marks(titleQ.marks || 20);
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const enabledCount = items.filter((it) => it.enabled).length;

  const handleToggleItem = (index: number, enabled: boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], enabled };
    setItems(updated);
  };

  const handleUpdateItem = (index: number, updatedItem: IkhtibarItemConfig) => {
    const updated = [...items];
    updated[index] = updatedItem;
    setItems(updated);
  };

  const handleSelectAll = (select: boolean) => {
    setItems(items.map((it) => ({ ...it, enabled: select })));
  };

  const handleResetToDefault = () => {
    setQ3Number('٣-');
    setQ3Title('اختبار القواعد (خمسة فقط) :');
    setQ3MarksFormula('٢٠ = ٤ × ٥');
    setQ3Marks(20);
    setItems(DEFAULT_IKHTIBAR_ITEMS);
  };

  const handleAddNewItem = () => {
    const nextIdx = items.length;
    const newItem: IkhtibarItemConfig = {
      id: `custom_item_${Date.now()}`,
      letter: ARABIC_LETTERS[nextIdx] || String(nextIdx + 1),
      title: 'أجب عما يأتي :',
      type: 'sentence_list',
      sentences: ['جملة رقم ١', 'جملة رقم ٢'],
      enabled: true,
    };
    setItems([...items, newItem]);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    // 1. Parent Q3 Title Question
    list.push({
      groupId: targetGroupId,
      groupRole: 'ikhtibar_q3_title',
      subject: 'قواعد اللغة العربية',
      grade: 'الصف العاشر من الداخل',
      typology: 'GROUP_TITLE',
      customNumber: q3Number.trim() || '٣-',
      stemOrPassage: q3Title.trim(),
      customMarksText: q3MarksFormula.trim() || '٢٠ = ٤ × ٥',
      marks: q3Marks,
      difficulty: 'Medium',
      languages: ['ar'],
      sourceType: 'MANUAL',
    });

    // 2. Active sub-items
    const activeItems = items.filter((it) => it.enabled);
    activeItems.forEach((it, idx) => {
      const letter = ARABIC_LETTERS[idx] || String(idx + 1);

      if (it.type === 'word_list') {
        list.push({
          groupId: targetGroupId,
          groupRole: 'ikhtibar_item_word_list',
          subject: 'قواعد اللغة العربية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: `(${letter})`,
          stemOrPassage: `${it.title.trim()}\n${(it.wordListText || '').trim()}`,
          customMarksText: '',
          marks: 0,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      } else if (it.type === 'sentence_list') {
        list.push({
          groupId: targetGroupId,
          groupRole: 'ikhtibar_item_sentences',
          subject: 'قواعد اللغة العربية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: `(${letter})`,
          stemOrPassage: it.title.trim(),
          customMarksText: '',
          subQuestions: (it.sentences || []).map((sent, sIdx) => ({
            part: (ARABIC_DIGITS[sIdx] || String(sIdx + 1)) as any,
            bloomLevel: 'application',
            bloomTitle: '',
            questionText: sent.trim(),
            marks: 0,
          })),
          marks: 0,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      } else if (it.type === 'cloze_box') {
        list.push({
          groupId: targetGroupId,
          groupRole: 'ikhtibar_item_cloze',
          subject: 'قواعد اللغة العربية',
          grade: 'الصف العاشر من الداخل',
          typology: 'FILL_BLANKS',
          customNumber: `(${letter})`,
          stemOrPassage: `${it.title.trim()}\n${(it.passageText || '').trim()}`,
          customMarksText: '',
          wordClues: it.boxWords && it.boxWords.length > 0 ? it.boxWords : undefined,
          marks: 0,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      } else if (it.type === 'tashkeel') {
        list.push({
          groupId: targetGroupId,
          groupRole: 'ikhtibar_item_tashkeel',
          subject: 'قواعد اللغة العربية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: `(${letter})`,
          stemOrPassage: `${it.title.trim()}\n${(it.passageText || '').trim()}`,
          customMarksText: '',
          marks: 0,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }
    });

    return list;
  };

  const handleApply = (proceedToInsha = false) => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup ? activeGroup.groupId : `ikhtibar-qawaid-section-${Date.now()}`;
    const generated = buildQuestions(targetGroupId);
    onSave(generated, mode, targetGroupId, proceedToInsha);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 font-serif">
                <span>اختبار القواعد (৩ নং প্রশ্ন - প্রয়োগমূলক ব্যাকরণ)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 font-sans font-bold">
                  {q3Marks} নম্বর
                </span>
              </h2>
              <p className="text-xs text-teal-200 font-sans">
                সহিহ-মো’তাল, মুজাররাদ-মাযীদ, জমার প্রকার, মুবতাদা-খবর, বাক্য শুদ্ধিকরণ, তারকীব, শূন্যস্থান ও হরকত
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Group Switcher */}
        {allGroups.length > 0 && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-teal-600" /> পেপারে বিদ্যমান:
            </span>
            {allGroups.map((g, idx) => {
              const isSelected = activeGroupId === g.groupId;
              return (
                <button
                  key={g.groupId}
                  type="button"
                  onClick={() => onSelectGroupId(g.groupId)}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>{g.label || `কাওয়ায়েদ ${idx + 1}`}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onSelectGroupId(null)}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-teal-700 hover:bg-teal-50 border border-dashed border-teal-400 shrink-0 ${
                activeGroupId === null ? 'bg-teal-100 ring-2 ring-teal-500' : 'bg-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {/* Main Question 3 Header & Marks Configuration */}
          <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 font-serif">
                ৩ নং মূল প্রশ্নের শিরোনাম ও নম্বর বণ্টন
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 font-semibold transition"
                title="ডিফল্ট সেটিংস ফিরিয়ে আনুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  নম্বর
                </label>
                <input
                  type="text"
                  value={q3Number}
                  onChange={(e) => setQ3Number(e.target.value)}
                  dir="rtl"
                  className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none"
                  placeholder="٣-"
                />
              </div>

              <div className="md:col-span-7">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  প্রশ্নের মূল নির্দেশনা (Title)
                </label>
                <input
                  type="text"
                  value={q3Title}
                  onChange={(e) => setQ3Title(e.target.value)}
                  dir="rtl"
                  className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none"
                  placeholder="اختبار القواعد (خمسة فقط) :"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  নম্বর বণ্টন (Marks Formula)
                </label>
                <input
                  type="text"
                  value={q3MarksFormula}
                  onChange={(e) => setQ3MarksFormula(e.target.value)}
                  dir="rtl"
                  className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none text-teal-800"
                  placeholder="٢٠ = ٤ × ٥"
                />
              </div>
            </div>
          </div>

          {/* Sub-Items Selection Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>নির্বাচিত আইটেম:</span>
                <strong className="text-teal-800 font-mono text-sm px-2 py-0.5 bg-teal-50 rounded-md border border-teal-200">
                  {enabledCount} / {items.length}টি
                </strong>
              </span>

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-[11px] font-bold text-teal-700 hover:underline"
              >
                সব সিলেক্ট করুন
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-[11px] font-bold text-slate-500 hover:underline"
              >
                সব আনচেক করুন
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                  filterMode === 'all'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                সকল আইটেম ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('selected')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                  filterMode === 'selected'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                নির্বাচিত ({enabledCount})
              </button>
            </div>
          </div>

          {/* Sub-items List */}
          <div className="space-y-3">
            {items
              .map((item, originalIdx) => ({ item, originalIdx }))
              .filter(({ item }) => filterMode === 'all' || item.enabled)
              .map(({ item, originalIdx }, displayIdx) => {
                // Calculate dynamic Arabic letter based on order of enabled items
                const enabledItemsBefore = items
                  .slice(0, originalIdx)
                  .filter((it) => it.enabled).length;
                const letter = item.enabled
                  ? ARABIC_LETTERS[enabledItemsBefore] || String(enabledItemsBefore + 1)
                  : ARABIC_LETTERS[originalIdx] || String(originalIdx + 1);

                return (
                  <IkhtibarItemCard
                    key={item.id || originalIdx}
                    item={item}
                    index={originalIdx}
                    letter={letter}
                    onToggle={(enabled) => handleToggleItem(originalIdx, enabled)}
                    onChange={(updated) => handleUpdateItem(originalIdx, updated)}
                    onDelete={
                      items.length > 1
                        ? () => setItems(items.filter((_, i) => i !== originalIdx))
                        : undefined
                    }
                  />
                );
              })}
          </div>

          {/* Add custom item */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleAddNewItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition shadow-2xs font-serif"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة نوع آخر (নতুন ব্যাকরণ আইটেম যোগ করুন)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span>
              মোট নির্বাচিত আইটেম: <strong className="text-teal-800 text-sm">{enabledCount}টি</strong> (৩ নং প্রশ্নের অধীন)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>

            <button
              type="button"
              onClick={() => handleApply(false)}
              disabled={enabledCount === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-2xs font-serif cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditMode ? 'আপডেট ও সংরক্ষণ করুন' : 'কাওয়ায়েদ পেপারে যোগ করুন'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              disabled={enabledCount === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-md font-serif cursor-pointer"
              title="কাওয়ায়েদ পেপারে সেভ করে ৪-৭ নং অনুবাদ ও রচনা অংশে যান"
            >
              <span>{isEditMode ? 'সংরক্ষণ ও অনুবাদ-ইনশায় যান' : 'যোগ করুন ও অনুবাদ-ইনশায় যান'}</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
