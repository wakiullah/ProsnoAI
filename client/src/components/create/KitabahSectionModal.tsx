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

export interface KitabahSectionGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractKitabahSectionGroups(questions: QuestionData[]): KitabahSectionGroup[] {
  const groups: KitabahSectionGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('kitabah-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `লিখন অংশ ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const DEFAULT_BANNER = '(هـ) اختبار الكتابة : الدرجات - ۲۰';

const DEFAULT_Q10_TOPICS = [
  'الحوار بين المشترى والبائع فى دكان الملابس.',
  'الحوار بينك وبين ابيك فى الرحلة الى مكة المكرمة.',
];

const DEFAULT_Q11_T1_TOPIC = 'اكتب فقرة بالعربية عن "الاسلام" على أساس الأجوبة من الأسئلة التالية :';
const DEFAULT_Q11_T1_QUESTIONS = [
  'ما معنى الاسلام؟',
  'وما هى اصول الاسلام؟',
  'ولماذا نهتم بالاسلام والدين؟',
];

const DEFAULT_Q11_T2_TOPIC = 'اكتب بالعربية فقرة عن "المساواة" على أساس الأجوبة من الأسئلة التالية :';
const DEFAULT_Q11_T2_QUESTIONS = [
  'ما هى المساواة؟',
  'فى اى جهة تكون المساواة بين الناس؟',
  'اذكر دليلا من القران او الحديث عن المساواة.',
];

interface KitabahSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: KitabahSectionGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (questions: QuestionData[], mode: 'update' | 'create', targetGroupId: string) => void;
}

export const KitabahSectionModal: React.FC<KitabahSectionModalProps> = ({
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

  // Q10: Hiwar / Dialogue
  const [includeQ10, setIncludeQ10] = useState(true);
  const [q10Number, setQ10Number] = useState('١٠.');
  const [q10Title, setQ10Title] = useState('اكتب بالعربية حوارا واحدا بستة جمل على الأقل من الموضوع التالي :');
  const [q10MarksFormula, setQ10MarksFormula] = useState('۱۰ = ১ × ১০');
  const [q10Topics, setQ10Topics] = useState(DEFAULT_Q10_TOPICS);

  // Q11: Paragraph (with or option)
  const [includeQ11, setIncludeQ11] = useState(true);
  const [q11Number, setQ11Number] = useState('١١.');
  const [q11MarksFormula, setQ11MarksFormula] = useState('۱۰ = ১ × ১০');

  // Topic 1
  const [q11T1Topic, setQ11T1Topic] = useState(DEFAULT_Q11_T1_TOPIC);
  const [q11T1Questions, setQ11T1Questions] = useState(DEFAULT_Q11_T1_QUESTIONS);

  // Topic 2 (or)
  const [includeQ11OrOption, setIncludeQ11OrOption] = useState(true);
  const [q11T2Topic, setQ11T2Topic] = useState(DEFAULT_Q11_T2_TOPIC);
  const [q11T2Questions, setQ11T2Questions] = useState(DEFAULT_Q11_T2_QUESTIONS);

  useEffect(() => {
    if (!activeGroup) {
      setIncludeBanner(true);
      setBannerTitle(DEFAULT_BANNER);

      setIncludeQ10(true);
      setQ10Number('١٠.');
      setQ10Title('اكتب بالعربية حوارا واحدا بستة جمل على الأقل من الموضوع التالي :');
      setQ10MarksFormula('۱۰ = ১ × ১০');
      setQ10Topics(DEFAULT_Q10_TOPICS);

      setIncludeQ11(true);
      setQ11Number('١١.');
      setQ11MarksFormula('۱۰ = ১ × ১০');
      setQ11T1Topic(DEFAULT_Q11_T1_TOPIC);
      setQ11T1Questions(DEFAULT_Q11_T1_QUESTIONS);
      setIncludeQ11OrOption(true);
      setQ11T2Topic(DEFAULT_Q11_T2_TOPIC);
      setQ11T2Questions(DEFAULT_Q11_T2_QUESTIONS);
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

    const q10Item = qs.find((q) => q.groupRole === 'kitabah_q10' || (q.customNumber && q.customNumber.includes('١٠')));
    if (q10Item) {
      setIncludeQ10(true);
      setQ10Number(q10Item.customNumber || '١٠.');
      setQ10Title(q10Item.stemOrPassage || 'اكتب بالعربية حوارا واحدا بستة جمل على الأقل من الموضوع التالي :');
      setQ10MarksFormula(q10Item.customMarksText || '١٠ = ١ × ١٠');
      if (q10Item.subQuestions && q10Item.subQuestions.length > 0) {
        setQ10Topics(q10Item.subQuestions.map((sq) => sq.questionText));
      }
    }

    const q11Item = qs.find((q) => q.groupRole === 'kitabah_q11' || (q.customNumber && q.customNumber.includes('١١')));
    if (q11Item) {
      setIncludeQ11(true);
      setQ11Number(q11Item.customNumber || '١١.');
      setQ11MarksFormula(q11Item.customMarksText || '١٠ = ١ × ١٠');
      setQ11T1Topic(q11Item.stemOrPassage || DEFAULT_Q11_T1_TOPIC);
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const subLetters = ['الف', 'ب', 'ج', 'د'];

  const buildQuestionsPayload = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    // Banner
    if (includeBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'kitabah_banner',
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

    // Q10: Hiwar
    if (includeQ10 && q10Topics.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'kitabah_q10',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DIALOGUE',
        customNumber: q10Number.trim() || '١٠.',
        stemOrPassage: q10Title.trim(),
        customMarksText: q10MarksFormula.trim() || '١٠ = ١ × ١٠',
        subQuestions: q10Topics.map((top, idx) => ({
          part: subLetters[idx] as any || String(idx + 1),
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: top.trim(),
          marks: 10,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // Q11: Paragraph Writing (Combined with (أو) if enabled)
    if (includeQ11) {
      // Build full formatted stem with sub-questions and optional "أو" topic
      const t1QuestionsHtml = q11T1Questions
        .map((q, idx) => `(${subLetters[idx] || idx + 1}) ${q.trim()}`)
        .join('\n');

      let fullStem = `${q11T1Topic.trim()}\n${t1QuestionsHtml}`;

      if (includeQ11OrOption && q11T2Topic.trim()) {
        const t2QuestionsHtml = q11T2Questions
          .map((q, idx) => `(${subLetters[idx] || idx + 1}) ${q.trim()}`)
          .join('\n');
        fullStem += `\n(أو)\n${q11T2Topic.trim()}\n${t2QuestionsHtml}`;
      }

      list.push({
        groupId: targetGroupId,
        groupRole: 'kitabah_q11',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'PARAGRAPH_WRITING',
        customNumber: q11Number.trim() || '١١.',
        stemOrPassage: fullStem,
        customMarksText: q11MarksFormula.trim() || '١٠ = ١ × ١٠',
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
      mode === 'update' && activeGroup ? activeGroup.groupId : `kitabah-section-${Date.now()}`;
    const payload = buildQuestionsPayload(targetGroupId);
    onSave(payload, mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700/80 border border-blue-500/50 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">লিখন দক্ষতা (اختبار الكتابة)</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-serif">
                  (هـ) اختبار الكتابة : ২০ درجات
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 font-serif">
                إعداد أسئلة الحوار وكتابة الفقرة مع خيار (أو)
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
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              লিখন অংশ ({allGroups.length}টি):
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
                      ? 'bg-blue-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  <span>{g.label || `লিখন অংশ ${idx + 1}`}</span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectGroupId(null)}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 ${
              !activeGroupId
                ? 'bg-blue-700 text-white'
                : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ নতুন লিখন অংশ যোগ</span>
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
                  className="rounded text-blue-600 focus:ring-blue-500"
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

          {/* Q10: Hiwar / Dialogue */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ10}
                  onChange={(e) => setIncludeQ10(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>১০ নং প্রশ্ন — আরবি সংলাপ / হিবার লিখন (১০ নম্বর: ২টির মধ্যে ১টি)</span>
              </label>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-serif">
                {q10MarksFormula}
              </span>
            </div>

            {includeQ10 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q10Number}
                      onChange={(e) => setQ10Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নির্দেশনা (Stem):</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q10Title}
                      onChange={(e) => setQ10Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">২টি সংলাপের বিষয় (الف، ب):</span>
                  {q10Topics.map((top, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-12 text-center py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800">
                        ({subLetters[idx] || idx + 1})
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={top}
                        onChange={(e) => {
                          const updated = [...q10Topics];
                          updated[idx] = e.target.value;
                          setQ10Topics(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q11: Paragraph with Questions & (أو) Option */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ11}
                  onChange={(e) => setIncludeQ11(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>১১ নং প্রশ্ন — অনুচ্ছেদ রচনা (১০ নম্বর: অথবা সহ ২টি বিষয়ের মধ্যে ১টি)</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-serif">
                {q11MarksFormula}
              </span>
            </div>

            {includeQ11 && (
              <div className="space-y-4 pt-1">
                <div className="w-36">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রশ্ন নম্বর:</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={q11Number}
                    onChange={(e) => setQ11Number(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                  />
                </div>

                {/* Topic 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">বিষয় ১ (প্রথম অনুচ্ছেদ):</span>
                    <span className="text-[10px] text-slate-500 font-mono">প্রশ্নোত্তরের ভিত্তিতে প্যারাগ্রাফ</span>
                  </div>

                  <input
                    type="text"
                    dir="rtl"
                    value={q11T1Topic}
                    onChange={(e) => setQ11T1Topic(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif font-bold text-xs text-slate-900 outline-none text-right"
                  />

                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-600">সহায়ক প্রশ্নাবলি:</span>
                    {q11T1Questions.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-10 text-center py-1 bg-slate-100 border border-slate-300 rounded font-serif font-bold text-slate-700">
                          ({subLetters[idx] || idx + 1})
                        </span>
                        <input
                          type="text"
                          dir="rtl"
                          value={q}
                          onChange={(e) => {
                            const updated = [...q11T1Questions];
                            updated[idx] = e.target.value;
                            setQ11T1Questions(updated);
                          }}
                          className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded font-serif text-xs text-slate-900 outline-none text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider (أو) */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeQ11OrOption}
                      onChange={(e) => setIncludeQ11OrOption(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>বিকল্প বিষয় (أو - অথবা) অন্তর্ভুক্ত করুন</span>
                  </label>
                  <span className="font-serif font-extrabold text-sm text-blue-900 bg-blue-100 px-3 py-0.5 rounded-full">
                    (أو)
                  </span>
                </div>

                {/* Topic 2 (or) */}
                {includeQ11OrOption && (
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 text-xs">বিষয় ২ (বিকল্প অনুচ্ছেদ):</span>
                      <span className="text-[10px] text-blue-700 font-mono">অথবা অপশন</span>
                    </div>

                    <input
                      type="text"
                      dir="rtl"
                      value={q11T2Topic}
                      onChange={(e) => setQ11T2Topic(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif font-bold text-xs text-slate-900 outline-none text-right"
                    />

                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-600">সহায়ক প্রশ্নাবলি:</span>
                      {q11T2Questions.map((q, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-10 text-center py-1 bg-slate-100 border border-slate-300 rounded font-serif font-bold text-slate-700">
                            ({subLetters[idx] || idx + 1})
                          </span>
                          <input
                            type="text"
                            dir="rtl"
                            value={q}
                            onChange={(e) => {
                              const updated = [...q11T2Questions];
                              updated[idx] = e.target.value;
                              setQ11T2Questions(updated);
                            }}
                            className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded font-serif text-xs text-slate-900 outline-none text-right"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>বিদ্যমান অংশে আপডেট করুন</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleApply('create')}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>প্রশ্নপত্রে লিখন অংশ (اختبار الكتابة) যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
