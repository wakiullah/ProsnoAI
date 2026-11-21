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

export interface NazmSectionGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractNazmSectionGroups(questions: QuestionData[]): NazmSectionGroup[] {
  const groups: NazmSectionGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('nazm-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `কবিতা অংশ ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const DEFAULT_BANNER = '(ج) قسم النظم : الدرجات - ۲۰';

const DEFAULT_Q5_OPTIONS = [
  'اكتب خلاصة القصيدة "خلق حسن" باللغة العربية.',
  'اذكر نبذة من حياة الشاعر "على بن ابى طالب" باللغة العربية.',
  'اكتب خلاصة القصيدة "حضن الامهات" باللغة العربية.',
];

const DEFAULT_Q6_OPTIONS = [
  'بين حقوق الحيوان على الناس باللغة العربية.',
  'لماذا نعتز ونفتخر بعلم الاسلام؟',
  'من اى جهة كان الناس اكفاء؟',
];

const DEFAULT_Q7_VERSES = [
  'هو اول بيت نحفظه * بحياة الروح ويحفظنا.',
  'من حقه ان يرفقا * به والا يرهقا.',
  'ربنا اياك ندعو ربنا * اتنا النصر الذى وعدتنا.',
];

interface NazmSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: NazmSectionGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (questions: QuestionData[], mode: 'update' | 'create', targetGroupId: string) => void;
}

export const NazmSectionModal: React.FC<NazmSectionModalProps> = ({
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

  // Q5 (10 marks)
  const [includeQ5, setIncludeQ5] = useState(true);
  const [q5Number, setQ5Number] = useState('٥.');
  const [q5Title, setQ5Title] = useState('أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
  const [q5MarksFormula, setQ5MarksFormula] = useState('۱۰ = ১ × ১০');
  const [q5Options, setQ5Options] = useState(DEFAULT_Q5_OPTIONS);

  // Q6 (5 marks)
  const [includeQ6, setIncludeQ6] = useState(true);
  const [q6Number, setQ6Number] = useState('٦.');
  const [q6Title, setQ6Title] = useState('أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
  const [q6MarksFormula, setQ6MarksFormula] = useState('৫ = ১ × ৫');
  const [q6Options, setQ6Options] = useState(DEFAULT_Q6_OPTIONS);

  // Q7 (5 marks)
  const [includeQ7, setIncludeQ7] = useState(true);
  const [q7Number, setQ7Number] = useState('٧.');
  const [q7Title, setQ7Title] = useState('اشرح بيتا واحدا باللغة العربية :');
  const [q7MarksFormula, setQ7MarksFormula] = useState('৫ = ১ × ৫');
  const [q7Verses, setQ7Verses] = useState(DEFAULT_Q7_VERSES);

  useEffect(() => {
    if (!activeGroup) {
      setIncludeBanner(true);
      setBannerTitle(DEFAULT_BANNER);
      setIncludeQ5(true);
      setQ5Number('٥.');
      setQ5Title('أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
      setQ5MarksFormula('۱۰ = ১ × ১০');
      setQ5Options(DEFAULT_Q5_OPTIONS);

      setIncludeQ6(true);
      setQ6Number('٦.');
      setQ6Title('أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
      setQ6MarksFormula('৫ = ১ × ৫');
      setQ6Options(DEFAULT_Q6_OPTIONS);

      setIncludeQ7(true);
      setQ7Number('٧.');
      setQ7Title('اشرح بيتا واحدا باللغة العربية :');
      setQ7MarksFormula('৫ = ১ × ৫');
      setQ7Verses(DEFAULT_Q7_VERSES);
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

    const q5Item = qs.find((q) => q.groupRole === 'nazm_q5' || (q.customNumber && q.customNumber.includes('٥')));
    if (q5Item) {
      setIncludeQ5(true);
      setQ5Number(q5Item.customNumber || '٥.');
      setQ5Title(q5Item.stemOrPassage || 'أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
      setQ5MarksFormula(q5Item.customMarksText || '١٠ = ١ × ١٠');
      if (q5Item.subQuestions && q5Item.subQuestions.length > 0) {
        setQ5Options(q5Item.subQuestions.map((sq) => sq.questionText));
      }
    }

    const q6Item = qs.find((q) => q.groupRole === 'nazm_q6' || (q.customNumber && q.customNumber.includes('٦')));
    if (q6Item) {
      setIncludeQ6(true);
      setQ6Number(q6Item.customNumber || '٦.');
      setQ6Title(q6Item.stemOrPassage || 'أجب عن الأسئلة التالية باللغة العربية (واحدا فقط) :');
      setQ6MarksFormula(q6Item.customMarksText || '٥ = ١ × ٥');
      if (q6Item.subQuestions && q6Item.subQuestions.length > 0) {
        setQ6Options(q6Item.subQuestions.map((sq) => sq.questionText));
      }
    }

    const q7Item = qs.find((q) => q.groupRole === 'nazm_q7' || (q.customNumber && q.customNumber.includes('٧')));
    if (q7Item) {
      setIncludeQ7(true);
      setQ7Number(q7Item.customNumber || '٧.');
      setQ7Title(q7Item.stemOrPassage || 'اشرح بيتا واحدا باللغة العربية :');
      setQ7MarksFormula(q7Item.customMarksText || '٥ = ١ × ٥');
      if (q7Item.subQuestions && q7Item.subQuestions.length > 0) {
        setQ7Verses(q7Item.subQuestions.map((sq) => sq.questionText));
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
        groupRole: 'nazm_banner',
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

    // Q5: Summary / Poet Biography (10 marks)
    if (includeQ5 && q5Options.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'nazm_q5',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q5Number.trim() || '٥.',
        stemOrPassage: q5Title.trim(),
        customMarksText: q5MarksFormula.trim() || '١٠ = ١ × ١٠',
        subQuestions: q5Options.map((opt, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'knowledge',
          bloomTitle: '',
          questionText: opt.trim(),
          marks: 10,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q6: Questions on Poetry (5 marks)
    if (includeQ6 && q6Options.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'nazm_q6',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q6Number.trim() || '٦.',
        stemOrPassage: q6Title.trim(),
        customMarksText: q6MarksFormula.trim() || '٥ = ١ × ٥',
        subQuestions: q6Options.map((opt, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: opt.trim(),
          marks: 5,
        })),
        marks: 5,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q7: Verse Explanation (5 marks)
    if (includeQ7 && q7Verses.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'nazm_q7',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'POETRY_EXPLANATION',
        customNumber: q7Number.trim() || '٧.',
        stemOrPassage: q7Title.trim(),
        customMarksText: q7MarksFormula.trim() || '٥ = ١ × ٥',
        subQuestions: q7Verses.map((v, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: v.trim(),
          marks: 5,
        })),
        marks: 5,
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
      mode === 'update' && activeGroup ? activeGroup.groupId : `nazm-section-${Date.now()}`;
    const payload = buildQuestionsPayload(targetGroupId);
    onSave(payload, mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-fuchsia-900 via-purple-900 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-700/80 border border-fuchsia-500/50 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-fuchsia-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">কবিতা অংশ (قسم النظم) পরিচালনা</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30 font-serif">
                  (ج) قسم النظم : ২০ درجات
                </span>
              </div>
              <p className="text-[11px] text-fuchsia-200/90 font-serif">
                إعداد أسئلة النظم (الخلاصة والشاعر، وفهم النظم، وشرح الأبيات)
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
              <Layers className="w-3.5 h-3.5 text-fuchsia-600" />
              কবিতা অংশ ({allGroups.length}টি):
            </span>
            {allGroups.length === 0 ? (
              <span className="text-slate-500 italic text-[11px]">এখনও কোনো কবিতা অংশ যোগ করা হয়নি</span>
            ) : (
              allGroups.map((g, idx) => (
                <button
                  key={g.groupId}
                  type="button"
                  onClick={() => onSelectGroupId(g.groupId)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeGroupId === g.groupId
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  <span>{g.label || `কবিতা অংশ ${idx + 1}`}</span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectGroupId(null)}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 ${
              !activeGroupId
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-fuchsia-700 border border-fuchsia-300 hover:bg-fuchsia-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ নতুন কবিতা অংশ যোগ</span>
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
                  className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
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

          {/* Q5: Summary / Poet Biography */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ5}
                  onChange={(e) => setIncludeQ5(e.target.checked)}
                  className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <span>৫ নং প্রশ্ন — সারসংক্ষেপ বা কবি পরিচিতি (১০ নম্বর: ৩টির মধ্যে ১টি)</span>
              </label>
              <span className="text-[11px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full font-serif">
                {q5MarksFormula}
              </span>
            </div>

            {includeQ5 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q5Number}
                      onChange={(e) => setQ5Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q5Title}
                      onChange={(e) => setQ5Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">৩টি বিকল্প অপশন (الف، ب، ج):</span>
                  {q5Options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...q5Options];
                          updated[idx] = e.target.value;
                          setQ5Options(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q6: Poetry Comprehension Questions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ6}
                  onChange={(e) => setIncludeQ6(e.target.checked)}
                  className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <span>৬ নং প্রশ্ন — কবিতাভিত্তিক প্রশ্নাবলি (৫ নম্বর: ৩টির মধ্যে ১টি)</span>
              </label>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-serif">
                {q6MarksFormula}
              </span>
            </div>

            {includeQ6 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q6Number}
                      onChange={(e) => setQ6Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q6Title}
                      onChange={(e) => setQ6Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">৩টি বিকল্প প্রশ্ন (الف، ب، ج):</span>
                  {q6Options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...q6Options];
                          updated[idx] = e.target.value;
                          setQ6Options(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q7: Poetry Verse Explanation */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ7}
                  onChange={(e) => setIncludeQ7(e.target.checked)}
                  className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <span>৭ নং প্রশ্ন — শ্লোক/পঙ্ক্তি ব্যাখ্যা (৫ নম্বর: ৩টির মধ্যে ১টি)</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-serif">
                {q7MarksFormula}
              </span>
            </div>

            {includeQ7 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q7Number}
                      onChange={(e) => setQ7Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q7Title}
                      onChange={(e) => setQ7Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">৩টি কবিতার শ্লোক (الف، ب، ج):</span>
                  {q7Verses.map((verse, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={verse}
                        onChange={(e) => {
                          const updated = [...q7Verses];
                          updated[idx] = e.target.value;
                          setQ7Verses(updated);
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
                  <span>নতুন আলাদা কবিতা অংশ যুক্ত করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApply('update')}
                  className="flex items-center gap-1.5 px-5 py-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>বিদ্যমান কবিতা অংশে আপডেট করুন</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleApply('create')}
                className="flex items-center gap-1.5 px-5 py-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>প্রশ্নপত্রে কবিতা অংশ (قسم النظم) যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
