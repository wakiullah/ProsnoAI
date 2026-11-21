'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QuestionData } from 'proshno-shared';
import {
  X,
  BookOpen,
  CheckCircle2,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { TarjamaEditor } from './TarjamaEditor';
import { LetterWritingEditor } from './LetterWritingEditor';
import { EssayWritingEditor } from './EssayWritingEditor';
import {
  DEFAULT_ARABIC_2ND_PART_B_BANNER,
  DEFAULT_Q4_AR_TO_BN_SENTENCES,
  DEFAULT_Q5_BN_TO_AR_SENTENCES,
  DEFAULT_Q6_APPLICATION_OPTION_1,
  DEFAULT_Q6_APPLICATION_OPTION_2,
  DEFAULT_Q7_ESSAY_TOPICS,
} from './arabic2ndDefaults';

export interface TarjamaInshaGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractTarjamaInshaGroups(questions: QuestionData[]): TarjamaInshaGroup[] {
  const groups: TarjamaInshaGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith('tarjama-insha-section') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `অনুবাদ ও রচনা অংশ ${groups.length + 1}`,
        questions: groupQs,
      });
    }
  });

  return groups;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
const BENGALI_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'];

interface TarjamaInshaModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: TarjamaInshaGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const TarjamaInshaModal: React.FC<TarjamaInshaModalProps> = ({
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

  // Section Banner
  const [includeBanner, setIncludeBanner] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(DEFAULT_ARABIC_2ND_PART_B_BANNER);

  // Q4: Arabic to Bengali Translation (10 marks)
  const [includeQ4, setIncludeQ4] = useState(true);
  const [q4Number, setQ4Number] = useState('٤-');
  const [q4Title, setQ4Title] = useState(
    'ترجم من العربية إلى البنغالية (خمسة فقط) :'
  );
  const [q4MarksFormula, setQ4MarksFormula] = useState('١٠ = ٥ × ٢');
  const [q4Sentences, setQ4Sentences] = useState(DEFAULT_Q4_AR_TO_BN_SENTENCES);

  // Q5: Bengali to Arabic Translation (10 marks)
  const [includeQ5, setIncludeQ5] = useState(true);
  const [q5Number, setQ5Number] = useState('٥-');
  const [q5Title, setQ5Title] = useState(
    'ترجم من البنغالية إلى العربية (خمسة فقط) :'
  );
  const [q5MarksFormula, setQ5MarksFormula] = useState('١٠ = ٥ × ٢');
  const [q5Sentences, setQ5Sentences] = useState(DEFAULT_Q5_BN_TO_AR_SENTENCES);

  // Q6: Application / Letter Writing (10 marks)
  const [includeQ6, setIncludeQ6] = useState(true);
  const [q6Number, setQ6Number] = useState('٦-');
  const [q6MarksFormula, setQ6MarksFormula] = useState('١٠ = ١ × ١٠');
  const [q6Option1, setQ6Option1] = useState(DEFAULT_Q6_APPLICATION_OPTION_1);
  const [q6Option2, setQ6Option2] = useState(DEFAULT_Q6_APPLICATION_OPTION_2);
  const [q6OrText, setQ6OrText] = useState('أو');

  // Q7: Essay Writing (15 marks)
  const [includeQ7, setIncludeQ7] = useState(true);
  const [q7Number, setQ7Number] = useState('٧-');
  const [q7Title, setQ7Title] = useState(
    'اكتب بالعربية مقالة من الموضوعات التالية (واحدة فقط) :'
  );
  const [q7MarksFormula, setQ7MarksFormula] = useState('١٥ = ١ × ١٥');
  const [q7Topics, setQ7Topics] = useState(DEFAULT_Q7_ESSAY_TOPICS);

  // Sync state on activeGroup change
  useEffect(() => {
    if (!activeGroup) {
      setIncludeBanner(true);
      setBannerTitle(DEFAULT_ARABIC_2ND_PART_B_BANNER);

      setIncludeQ4(true);
      setQ4Number('٤-');
      setQ4Title('ترجم من العربية إلى البنغالية (خمسة فقط) :');
      setQ4MarksFormula('١٠ = ٥ × ٢');
      setQ4Sentences(DEFAULT_Q4_AR_TO_BN_SENTENCES);

      setIncludeQ5(true);
      setQ5Number('٥-');
      setQ5Title('ترجم من البنغالية إلى العربية (خمسة فقط) :');
      setQ5MarksFormula('١٠ = ٥ × ٢');
      setQ5Sentences(DEFAULT_Q5_BN_TO_AR_SENTENCES);

      setIncludeQ6(true);
      setQ6Number('٦-');
      setQ6MarksFormula('١٠ = ١ × ١٠');
      setQ6Option1(DEFAULT_Q6_APPLICATION_OPTION_1);
      setQ6Option2(DEFAULT_Q6_APPLICATION_OPTION_2);
      setQ6OrText('أو');

      setIncludeQ7(true);
      setQ7Number('٧-');
      setQ7Title('اكتب بالعربية مقالة من الموضوعات التالية (واحدة فقط) :');
      setQ7MarksFormula('١٥ = ١ × ١٥');
      setQ7Topics(DEFAULT_Q7_ESSAY_TOPICS);
      return;
    }

    const qs = activeGroup.questions;
    const bannerQ = qs.find(
      (q) => q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE'
    );
    if (bannerQ) {
      setIncludeBanner(true);
      setBannerTitle(bannerQ.stemOrPassage || DEFAULT_ARABIC_2ND_PART_B_BANNER);
    } else {
      setIncludeBanner(false);
    }

    const q4 = qs.find((q) => q.groupRole === 'tarjama_q4' || q.customNumber?.includes('٤'));
    if (q4) {
      setIncludeQ4(true);
      setQ4Number(q4.customNumber || '٤-');
      setQ4Title(q4.stemOrPassage || '');
      setQ4MarksFormula(q4.customMarksText || '١٠ = ٥ × ٢');
      if (q4.subQuestions && q4.subQuestions.length > 0) {
        setQ4Sentences(q4.subQuestions.map((s) => s.questionText));
      }
    } else {
      setIncludeQ4(false);
    }

    const q5 = qs.find((q) => q.groupRole === 'tarjama_q5' || q.customNumber?.includes('٥'));
    if (q5) {
      setIncludeQ5(true);
      setQ5Number(q5.customNumber || '٥-');
      setQ5Title(q5.stemOrPassage || '');
      setQ5MarksFormula(q5.customMarksText || '١٠ = ٥ × ٢');
      if (q5.subQuestions && q5.subQuestions.length > 0) {
        setQ5Sentences(q5.subQuestions.map((s) => s.questionText));
      }
    } else {
      setIncludeQ5(false);
    }

    const q6 = qs.find((q) => q.groupRole === 'insha_q6' || q.customNumber?.includes('٦'));
    if (q6) {
      setIncludeQ6(true);
      setQ6Number(q6.customNumber || '٦-');
      setQ6MarksFormula(q6.customMarksText || '١٠ = ١ × ١٠');
      const lines = (q6.stemOrPassage || '').split('\n').map((l) => l.trim()).filter(Boolean);
      const orIdx = lines.findIndex((l) => l.includes('أو') || l.includes('(أو)'));
      if (orIdx !== -1) {
        setQ6Option1(lines.slice(0, orIdx).join('\n'));
        setQ6OrText(lines[orIdx]);
        setQ6Option2(lines.slice(orIdx + 1).join('\n'));
      } else {
        setQ6Option1(lines[0] || DEFAULT_Q6_APPLICATION_OPTION_1);
        setQ6Option2(lines[1] || DEFAULT_Q6_APPLICATION_OPTION_2);
      }
    } else {
      setIncludeQ6(false);
    }

    const q7 = qs.find((q) => q.groupRole === 'insha_q7' || q.customNumber?.includes('٧'));
    if (q7) {
      setIncludeQ7(true);
      setQ7Number(q7.customNumber || '٧-');
      setQ7Title(q7.stemOrPassage || '');
      setQ7MarksFormula(q7.customMarksText || '١٥ = ١ × ١٥');
      if (q7.subQuestions && q7.subQuestions.length > 0) {
        setQ7Topics(q7.subQuestions.map((s) => s.questionText));
      }
    } else {
      setIncludeQ7(false);
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  const totalCalculatedMarks =
    (includeQ4 ? 10 : 0) +
    (includeQ5 ? 10 : 0) +
    (includeQ6 ? 10 : 0) +
    (includeQ7 ? 15 : 0);

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];

    // 0. Section Banner
    if (includeBanner && bannerTitle.trim()) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'tarjama_insha_banner',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        stemOrPassage: bannerTitle.trim(),
        customMarksText: '',
        marks: 0,
        difficulty: 'Easy',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 1. Q4: Arabic to Bengali Translation
    if (includeQ4 && q4Sentences.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'tarjama_q4',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q4Number.trim() || '٤-',
        stemOrPassage: q4Title.trim(),
        customMarksText: q4MarksFormula.trim() || '١٠ = ٥ × ٢',
        subQuestions: q4Sentences.map((sent, idx) => ({
          part: (ARABIC_LETTERS[idx] || String(idx + 1)) as any,
          bloomLevel: 'application',
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

    // 2. Q5: Bengali to Arabic Translation
    if (includeQ5 && q5Sentences.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'tarjama_q5',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q5Number.trim() || '٥-',
        stemOrPassage: q5Title.trim(),
        customMarksText: q5MarksFormula.trim() || '١٠ = ٥ × ٢',
        subQuestions: q5Sentences.map((sent, idx) => ({
          part: (BENGALI_LETTERS[idx] || String(idx + 1)) as any,
          bloomLevel: 'application',
          bloomTitle: '',
          questionText: sent.trim(),
          marks: 2,
        })),
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar', 'bn'],
        sourceType: 'MANUAL',
      });
    }

    // 3. Q6: Application / Letter Writing (PARAGRAPH_WRITING with 'أو')
    if (includeQ6 && (q6Option1.trim() || q6Option2.trim())) {
      const fullStem = `${q6Option1.trim()}\n${q6OrText.trim() || 'أو'}\n${q6Option2.trim()}`;
      list.push({
        groupId: targetGroupId,
        groupRole: 'insha_q6',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'PARAGRAPH_WRITING',
        customNumber: q6Number.trim() || '٦-',
        stemOrPassage: fullStem,
        customMarksText: q6MarksFormula.trim() || '١٠ = ١ × ١٠',
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 4. Q7: Essay / Maqalah Writing
    if (includeQ7 && q7Topics.length > 0) {
      list.push({
        groupId: targetGroupId,
        groupRole: 'insha_q7',
        subject: 'قواعد اللغة العربية',
        grade: 'الصف العاشر من الداخل',
        typology: 'DESCRIPTIVE',
        customNumber: q7Number.trim() || '٧-',
        stemOrPassage: q7Title.trim(),
        customMarksText: q7MarksFormula.trim() || '١٥ = ١ × ١٥',
        subQuestions: q7Topics.map((top, idx) => ({
          part: (ARABIC_LETTERS[idx] || String(idx + 1)) as any,
          bloomLevel: 'higher_order',
          bloomTitle: '',
          questionText: top.trim(),
          marks: 15,
        })),
        marks: 15,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    return list;
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup ? activeGroup.groupId : `tarjama-insha-section-${Date.now()}`;
    const generated = buildQuestions(targetGroupId);
    onSave(generated, mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 font-serif">
                <span>الترجمة والإنشاء (অনুবাদ ও রচনা - ৪, ৫, ৬ ও ৭ নং)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-sans font-bold">
                  মোট ৪৫ নম্বর
                </span>
              </h2>
              <p className="text-xs text-blue-200 font-sans">
                আরবি ২য় পত্রের বিভাগ (ب): অনুবাদ (২০ নম্বর), দরখাস্ত/চিঠি (১০ নম্বর) ও প্রবন্ধ রচনা (১৫ নম্বর)
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
              <Layers className="w-3.5 h-3.5 text-blue-600" /> পেপারে বিদ্যমান:
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
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>{g.label || `অনুবাদ ও রচনা ${idx + 1}`}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onSelectGroupId(null)}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-blue-700 hover:bg-blue-50 border border-dashed border-blue-400 shrink-0 ${
                activeGroupId === null ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {/* Section Banner Toggle */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-serif">বিভাগ শিরোনাম (Section Header Banner) যুক্ত করুন</span>
              </label>
              <span className="text-[11px] text-slate-500">বড় হেডিং হিসেবে পেপারে প্রিন্ট হবে</span>
            </div>
            {includeBanner && (
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                dir="rtl"
                className="w-full px-3 py-2 text-sm font-serif font-bold border border-slate-300 rounded-xl bg-slate-50/70 text-right focus:bg-white focus:border-blue-500 focus:outline-none text-slate-900"
                placeholder="(ب) الترجمة والإنشاء : الدرجات - ٤٥"
              />
            )}
          </div>

          {/* 1. Q4: Arabic to Bengali Translation */}
          <TarjamaEditor
            titleLabel="৪ নং প্রশ্ন: ترجم من العربية إلى البنغالية (আরবি থেকে বাংলা অনুবাদ)"
            badgeText="১০ নম্বর"
            badgeColorClass="bg-blue-50/30 border-blue-200"
            include={includeQ4}
            onToggleInclude={setIncludeQ4}
            qNumber={q4Number}
            onChangeNumber={setQ4Number}
            qTitle={q4Title}
            onChangeTitle={setQ4Title}
            marksFormula={q4MarksFormula}
            onChangeMarksFormula={setQ4MarksFormula}
            sentences={q4Sentences}
            onChangeSentences={setQ4Sentences}
            letterFormat="ar"
            direction="rtl"
            onReset={() => {
              setQ4Number('٤-');
              setQ4Title('ترجم من العربية إلى البنغالية (خمسة فقط) :');
              setQ4MarksFormula('١٠ = ٥ × ٢');
              setQ4Sentences(DEFAULT_Q4_AR_TO_BN_SENTENCES);
            }}
          />

          {/* 2. Q5: Bengali to Arabic Translation */}
          <TarjamaEditor
            titleLabel="৫ নং প্রশ্ন: ترجم من البنغالية إلى العربية (বাংলা থেকে আরবি অনুবাদ)"
            badgeText="১০ নম্বর"
            badgeColorClass="bg-teal-50/30 border-teal-200"
            include={includeQ5}
            onToggleInclude={setIncludeQ5}
            qNumber={q5Number}
            onChangeNumber={setQ5Number}
            qTitle={q5Title}
            onChangeTitle={setQ5Title}
            marksFormula={q5MarksFormula}
            onChangeMarksFormula={setQ5MarksFormula}
            sentences={q5Sentences}
            onChangeSentences={setQ5Sentences}
            letterFormat="bn"
            direction="ltr"
            onReset={() => {
              setQ5Number('٥-');
              setQ5Title('ترجم من البنغالية إلى العربية (خمسة فقط) :');
              setQ5MarksFormula('١٠ = ٥ × ٢');
              setQ5Sentences(DEFAULT_Q5_BN_TO_AR_SENTENCES);
            }}
          />

          {/* 3. Q6: Application / Letter Writing */}
          <LetterWritingEditor
            include={includeQ6}
            onToggleInclude={setIncludeQ6}
            qNumber={q6Number}
            onChangeNumber={setQ6Number}
            marksFormula={q6MarksFormula}
            onChangeMarksFormula={setQ6MarksFormula}
            option1={q6Option1}
            onChangeOption1={setQ6Option1}
            option2={q6Option2}
            onChangeOption2={setQ6Option2}
            orText={q6OrText}
            onChangeOrText={setQ6OrText}
            onReset={() => {
              setQ6Number('٦-');
              setQ6MarksFormula('١٠ = ١ × ١٠');
              setQ6Option1(DEFAULT_Q6_APPLICATION_OPTION_1);
              setQ6Option2(DEFAULT_Q6_APPLICATION_OPTION_2);
              setQ6OrText('أو');
            }}
          />

          {/* 4. Q7: Essay / Maqalah Writing */}
          <EssayWritingEditor
            include={includeQ7}
            onToggleInclude={setIncludeQ7}
            qNumber={q7Number}
            onChangeNumber={setQ7Number}
            qTitle={q7Title}
            onChangeTitle={setQ7Title}
            marksFormula={q7MarksFormula}
            onChangeMarksFormula={setQ7MarksFormula}
            topics={q7Topics}
            onChangeTopics={setQ7Topics}
            onReset={() => {
              setQ7Number('٧-');
              setQ7Title('اكتب بالعربية مقالة من الموضوعات التالية (واحدة فقط) :');
              setQ7MarksFormula('١٥ = ١ × ١٥');
              setQ7Topics(DEFAULT_Q7_ESSAY_TOPICS);
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>
              নির্বাচিত মোট নম্বর:{' '}
              <strong className="text-blue-900 text-sm">{totalCalculatedMarks} / ৪৫</strong>
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
              onClick={handleApply}
              disabled={totalCalculatedMarks === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-md font-serif cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditMode ? 'আপডেট ও সংরক্ষণ করুন' : 'অনুবাদ ও রচনা পেপারে যোগ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
