'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QuestionData } from 'proshno-shared';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Pencil,
  Sparkles,
  Layers,
} from 'lucide-react';

export interface VocabSectionGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractVocabSectionGroups(questions: QuestionData[]): VocabSectionGroup[] {
  const groups: VocabSectionGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('vocab-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `শূন্যস্থান অংশ ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const DEFAULT_BANNER = '(د) اختبار المفردات : الدرجات - ۲۰';

const DEFAULT_Q8_CLUES = 'هاجر ، لا يخشى ، يعلم ، ان سن ، صدق';
const DEFAULT_Q8_SENTENCES = [
  'لقد كان الفاروق رجلا ربانيا بحق .......... الا الله.',
  'ان عمر فاروق قد اسلم وامن بالله و .......... رسوله.',
  'بعد .......... سيفه ذهب عمر الفاروق لقتل محمد (صلعم).',
  'كان خباب بن الارت .......... فاطمة وسعيدا القران الكريم.',
  'توجه عمر الفاروق الى مقام ابراهيم فصلى ثم .......... الى المدينة.',
];

const DEFAULT_Q9_SENTENCES = [
  'نشأ الامام ابو حنيفة فى اسرة صالحة ..........',
  'كان ابوه يبيع .......... فى دكان له بالكوفة.',
  'فناقش ابو حنيفة .......... حتى اسكته.',
  'اراد المنصور ان يوليه فى منصب ..........',
  'وصلى ابو حنيفة ثلاثين سنة .......... بوضوء العتمة.',
];

interface VocabSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: VocabSectionGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (questions: QuestionData[], mode: 'update' | 'create', targetGroupId: string) => void;
}

export const VocabSectionModal: React.FC<VocabSectionModalProps> = ({
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

  // Banner
  const [includeBanner, setIncludeBanner] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(DEFAULT_BANNER);

  // Q8: With Clues
  const [includeQ8, setIncludeQ8] = useState(true);
  const [q8Number, setQ8Number] = useState('٨.');
  const [q8Title, setQ8Title] = useState('املأ الفراغات فى الجمل الاتية بكلمة مناسبة من الصندوق :');
  const [q8MarksFormula, setQ8MarksFormula] = useState('۱۰ = ৫ × ২');
  const [q8Clues, setQ8Clues] = useState(DEFAULT_Q8_CLUES);
  const [q8Sentences, setQ8Sentences] = useState(DEFAULT_Q8_SENTENCES);

  // Q9: Without Clues
  const [includeQ9, setIncludeQ9] = useState(true);
  const [q9Number, setQ9Number] = useState('٩.');
  const [q9Title, setQ9Title] = useState('املأ الفراغات فى الجمل الاتية بكلمة مناسبة من عندك :');
  const [q9MarksFormula, setQ9MarksFormula] = useState('۱۰ = ৫ × ২');
  const [q9Sentences, setQ9Sentences] = useState(DEFAULT_Q9_SENTENCES);

  useEffect(() => {
    if (!activeGroup) {
      setIncludeBanner(true);
      setBannerTitle(DEFAULT_BANNER);
      setIncludeQ8(true);
      setQ8Number('٨.');
      setQ8Title('املأ الفراغات فى الجمل الاتية بكلمة مناسبة من الصندوق :');
      setQ8MarksFormula('۱۰ = ৫ × ২');
      setQ8Clues(DEFAULT_Q8_CLUES);
      setQ8Sentences(DEFAULT_Q8_SENTENCES);

      setIncludeQ9(true);
      setQ9Number('٩.');
      setQ9Title('املأ الفراغات فى الجمل الاتية بكلمة مناسبة من عندك :');
      setQ9MarksFormula('۱۰ = ৫ × ২');
      setQ9Sentences(DEFAULT_Q9_SENTENCES);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find((q) => q.typology === 'SECTION_TITLE');
    if (bannerQ) {
      setIncludeBanner(true);
      setBannerTitle(bannerQ.stemOrPassage || DEFAULT_BANNER);
    } else {
      setIncludeBanner(false);
    }

    const q8Item = qs.find((q) => q.groupRole === 'vocab_q8' || (q.customNumber && q.customNumber.includes('٨')));
    if (q8Item) {
      setIncludeQ8(true);
      setQ8Number(q8Item.customNumber || '٨.');
      setQ8Title(q8Item.stemOrPassage || 'املأ الفراغات فى الجمل الاتية بكلمة مناسبة من الصندوق :');
      setQ8MarksFormula(q8Item.customMarksText || '١٠ = ٥ × ٢');
      if (q8Item.wordClues && q8Item.wordClues.length > 0) {
        setQ8Clues(q8Item.wordClues.join(' ، '));
      }
      if (q8Item.subQuestions && q8Item.subQuestions.length > 0) {
        setQ8Sentences(q8Item.subQuestions.map((sq) => sq.questionText));
      }
    }

    const q9Item = qs.find((q) => q.groupRole === 'vocab_q9' || (q.customNumber && q.customNumber.includes('٩')));
    if (q9Item) {
      setIncludeQ9(true);
      setQ9Number(q9Item.customNumber || '٩.');
      setQ9Title(q9Item.stemOrPassage || 'املأ الفراغات فى الجمل الاتية بكلمة مناسبة من عندك :');
      setQ9MarksFormula(q9Item.customMarksText || '١٠ = ٥ × ٢');
      if (q9Item.subQuestions && q9Item.subQuestions.length > 0) {
        setQ9Sentences(q9Item.subQuestions.map((sq) => sq.questionText));
      }
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const subLetters = ['الف', 'ب', 'ج', 'د', 'هـ'];

  const buildQuestionsPayload = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    // Banner
    if (includeBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'vocab_banner',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'SECTION_TITLE',
        stemOrPassage: bannerTitle.trim(),
        marks: 0,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q8: With Clues
    if (includeQ8 && q8Sentences.length > 0) {
      const cluesList = q8Clues
        .split(/[،,]/)
        .map((c) => c.trim())
        .filter(Boolean);

      list.push({
        groupId: targetGroupId,
        groupRole: 'vocab_q8',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'FILL_BLANKS',
        customNumber: q8Number.trim() || '٨.',
        stemOrPassage: q8Title.trim(),
        customMarksText: q8MarksFormula.trim() || '١٠ = ٥ × ٢',
        wordClues: cluesList.length > 0 ? cluesList : undefined,
        subQuestions: q8Sentences.map((sent, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: sent.trim(),
          marks: 2,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q9: Without Clues
    if (includeQ9 && q9Sentences.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'vocab_q9',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'FILL_BLANKS',
        customNumber: q9Number.trim() || '٩.',
        stemOrPassage: q9Title.trim(),
        customMarksText: q9MarksFormula.trim() || '١٠ = ٥ × ٢',
        subQuestions: q9Sentences.map((sent, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: sent.trim(),
          marks: 2,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    return list;
  };

  const handleApply = (modeOverride?: 'update' | 'create') => {
    const mode = modeOverride || (isEditMode ? 'update' : 'create');
    const targetGroupId =
      mode === 'update' && activeGroup ? activeGroup.groupId : `vocab-section-${Date.now()}`;
    const payload = buildQuestionsPayload(targetGroupId);
    onSave(payload, mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700/80 border border-amber-500/50 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">শব্দভাণ্ডার ও শূন্যস্থান (اختبار المفردات)</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 font-serif">
                  (د) اختبار المفردات : ২০ درجات
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-serif">
                إعداد أسئلة ملء الفراغات من الصندوق ومن عندك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Selector */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              শূন্যস্থান অংশ ({allGroups.length}টি):
            </span>
            {allGroups.length === 0 ? (
              <span className="text-slate-500 italic text-[11px]">এখনও কোনো অংশ যোগ করা হয়নি</span>
            ) : (
              allGroups.map((g, idx) => (
                <button
                  key={g.groupId}
                  type="button"
                  onClick={() => onSelectGroupId(g.groupId)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeGroupId === g.groupId
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  <span>{g.label || `শূন্যস্থান অংশ ${idx + 1}`}</span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectGroupId(null)}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 ${
              !activeGroupId
                ? 'bg-amber-700 text-white'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ নতুন শূন্যস্থান অংশ যোগ</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 text-xs">
          {/* Section Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm">বিভাগীয় হেডার ব্যানার (Section Banner)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">নম্বর ছাড়া বড় শিরোনাম</span>
            </div>
            {includeBanner && (
              <input
                type="text"
                dir="rtl"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-serif text-sm font-bold text-slate-900 focus:bg-white outline-none text-right"
              />
            )}
          </div>

          {/* Q8: With Clues Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ8}
                  onChange={(e) => setIncludeQ8(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>৮ নং প্রশ্ন — শব্দ বাক্স সহ শূন্যস্থান পূরণ (১০ নম্বর: ৫টি বাক্য)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-serif">
                {q8MarksFormula}
              </span>
            </div>

            {includeQ8 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q8Number}
                      onChange={(e) => setQ8Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q8Title}
                      onChange={(e) => setQ8Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ক্লু বক্সের শব্দসমূহ (কমা দিয়ে আলাদা করুন):
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={q8Clues}
                    onChange={(e) => setQ8Clues(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">৫টি শূন্যস্থান বাক্য (الف، ب، ج، د، هـ):</span>
                  {q8Sentences.map((sent, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={sent}
                        onChange={(e) => {
                          const updated = [...q8Sentences];
                          updated[idx] = e.target.value;
                          setQ8Sentences(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q9: Without Clues */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ9}
                  onChange={(e) => setIncludeQ9(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>৯ নং প্রশ্ন — শব্দ বাক্স ছাড়া (মন থেকে) শূন্যস্থান পূরণ (১০ নম্বর: ৫টি বাক্য)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-serif">
                {q9MarksFormula}
              </span>
            </div>

            {includeQ9 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q9Number}
                      onChange={(e) => setQ9Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q9Title}
                      onChange={(e) => setQ9Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">৫টি শূন্যস্থান বাক্য (الف، ب، ج، د، هـ):</span>
                  {q9Sentences.map((sent, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={sent}
                        onChange={(e) => {
                          const updated = [...q9Sentences];
                          updated[idx] = e.target.value;
                          setQ9Sentences(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
          >
            বাতিল
          </button>

          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => handleApply('create')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন আলাদা অংশ হিসেবে যুক্ত করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApply('update')}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>বিদ্যমান অংশে আপডেট করুন</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleApply('create')}
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>প্রশ্নপত্রে শূন্যস্থান অংশ (اختبار المفردات) যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
