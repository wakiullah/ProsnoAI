'use client';

import React, { useState } from 'react';
import {
  EducationStream,
  ExamSection,
  GenerateQuestionsRequest,
  HarakatMode,
  QuestionData,
  QuestionDifficulty,
  QuestionTypology,
  SupportedLanguage,
} from 'proshno-shared';
import {
  generateAiQuestions,
  getActiveAiProvider,
  getStoredGeminiKey,
  getStoredOpenRouterKey,
  uploadPdfForRag,
  AiProvider,
} from '../../lib/api';
import { MultiScriptText } from '../common/MultiScriptText';
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Upload,
  AlertCircle,
  Key,
  FolderInput,
} from 'lucide-react';

interface QuickAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stream: EducationStream;
  subject: string;
  grade: string;
  sections: ExamSection[];
  onInsertQuestions: (questions: QuestionData[], targetSectionId?: string) => void;
  onOpenKeyModal: () => void;
}

export const QuickAiDrawer: React.FC<QuickAiDrawerProps> = ({
  isOpen,
  onClose,
  stream,
  subject,
  grade,
  sections,
  onInsertQuestions,
  onOpenKeyModal,
}) => {
  const [activeProvider, setActiveProvider] = useState<AiProvider>(getActiveAiProvider());
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [typology, setTypology] = useState<QuestionTypology>('SIMPLE_MCQ');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');
  const [targetSectionId, setTargetSectionId] = useState<string>('');

  // Mode: prompt vs document
  const [mode, setMode] = useState<'prompt' | 'document'>('prompt');
  const [extractedPdfText, setExtractedPdfText] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  // Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedList, setGeneratedList] = useState<QuestionData[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const checkHasKey = () => {
    const p = getActiveAiProvider();
    setActiveProvider(p);
    return p === 'gemini' ? Boolean(getStoredGeminiKey()) : Boolean(getStoredOpenRouterKey());
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingPdf(true);
    setErrorMsg(null);
    try {
      const res = await uploadPdfForRag(file);
      setExtractedPdfText(res.text);
    } catch (err: any) {
      setErrorMsg(err.message || 'PDF টেক্সট এক্সট্রাক্ট করা যায়নি।');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleGenerate = async () => {
    if (!checkHasKey()) {
      onOpenKeyModal();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedList([]);
    setAddedIds(new Set());

    const isArabicStream = stream === 'ALIA' || stream === 'QAWMI';
    const languages: SupportedLanguage[] = isArabicStream ? ['bn', 'ar'] : ['bn'];

    const payload: GenerateQuestionsRequest = {
      mode,
      subject,
      grade,
      chapter: chapter.trim() || undefined,
      topic: topic.trim() || undefined,
      typology,
      educationStream: stream,
      harakatMode: 'WITH_HARAKAT',
      count,
      difficulty,
      languages,
      documentText: mode === 'document' ? extractedPdfText : undefined,
    };

    try {
      const res = await generateAiQuestions(payload);
      if (res.success && res.questions && res.questions.length > 0) {
        setGeneratedList(res.questions);
      } else {
        setErrorMsg(res.error || 'প্রশ্ন জেনারেট করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভার এরর।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddOne = (q: QuestionData, idx: number) => {
    const qWithSection = {
      ...q,
      sectionId: targetSectionId || undefined,
    };
    onInsertQuestions([qWithSection], targetSectionId || undefined);
    setAddedIds((prev) => new Set(prev).add(idx));
  };

  const handleAddAll = () => {
    const unadded = generatedList.filter((_, idx) => !addedIds.has(idx));
    if (unadded.length === 0) return;
    const mapped = unadded.map((q) => ({
      ...q,
      sectionId: targetSectionId || undefined,
    }));
    onInsertQuestions(mapped, targetSectionId || undefined);
    const newAdded = new Set(addedIds);
    generatedList.forEach((_, idx) => newAdded.add(idx));
    setAddedIds(newAdded);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <div>
            <h3 className="font-extrabold text-sm text-white">AI প্রশ্ন সহকারী</h3>
            <p className="text-[10px] text-teal-200 font-medium">
              সরাসরি পেপারে যোগ করার জন্য প্রশ্ন তৈরি করুন
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Form & Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('prompt')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'prompt' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            টপিক ও প্রম্পট মোড
          </button>
          <button
            onClick={() => setMode('document')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'document' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            পাঠ্যবই / PDF আপলোড
          </button>
        </div>

        {/* Input Details */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
          {mode === 'prompt' ? (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  অধ্যায় / কিতাব / পাঠ্য বিষয়:
                </label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="যেমন: সূরা আল-বাক্বারা / আল-লুগাতুল আরাবিয়্যাহ ১ম অধ্যায়"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  নির্দিষ্ট টপিক / ফোকাস (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="যেমন: তাকওয়া ও মুত্তাকীদের গুণাবলী / সিগাহ বিশ্লেষণ"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                পাঠ্যবই বা নোটের PDF ফাইল আপলোড করুন:
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {isExtractingPdf && (
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>PDF টেক্সট পড়া হচ্ছে...</span>
                </div>
              )}
              {extractedPdfText && (
                <div className="text-[10px] text-slate-500 mt-1">
                  ✓ {extractedPdfText.length} অক্ষর সফলভাবে এক্সট্রাক্ট করা হয়েছে।
                </div>
              )}
            </div>
          )}

          {/* Typology & Count */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">প্রশ্নের ধরন:</label>
              <select
                value={typology}
                onChange={(e) => setTypology(e.target.value as QuestionTypology)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="SIMPLE_MCQ">বহুনির্বাচনী (MCQ)</option>
                <option value="CQ">সৃজনশীল (CQ Bloom's)</option>
                <option value="TAHQEEQ_SIGHA">তাহকীক ও সিগাহ ছক</option>
                <option value="TARKIB_IRAB">তারকীব ও এরাব</option>
                <option value="FILL_BLANKS">শূন্যস্থান পূরণ</option>
                <option value="MATCHING">মিলকরণ ছক</option>
                <option value="DESCRIPTIVE">বর্ণনামূলক / সংক্ষিপ্ত</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">সংখ্যা (Count):</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value={3}>৩টি প্রশ্ন</option>
                <option value={5}>৫টি প্রশ্ন</option>
                <option value={10}>১০টি প্রশ্ন</option>
              </select>
            </div>
          </div>

          {/* Target Section (if sections exist) */}
          {sections.length > 0 && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                কোন বিভাগে যুক্ত করবেন?
              </label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-emerald-900"
              >
                <option value="">সাধারণ (কোনো বিভাগ ছাড়া)</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (mode === 'document' && !extractedPdfText)}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI প্রশ্ন প্রস্তুত করছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>প্রশ্ন তৈরি করুন</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results Preview */}
        {generatedList.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">
                তৈরি হওয়া প্রশ্নসমূহ ({generatedList.length}টি):
              </span>
              <button
                onClick={handleAddAll}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs"
              >
                সবগুলো পেপারে যোগ করুন
              </button>
            </div>

            <div className="space-y-2.5">
              {generatedList.map((q, idx) => {
                const isAdded = addedIds.has(idx);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-800 font-serif leading-relaxed text-xs">
                        {idx + 1}. <MultiScriptText text={q.stemOrPassage} />
                      </div>
                      <button
                        onClick={() => handleAddOne(q, idx)}
                        disabled={isAdded}
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>যুক্ত হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>যোগ করুন</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Options preview */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 font-serif pl-2 border-l-2 border-slate-200">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx}>
                            ({opt.label}) <MultiScriptText text={opt.text} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
