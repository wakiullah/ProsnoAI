'use client';

import React, { useState } from 'react';
import {
  GenerateQuestionsRequest,
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
  AiProvider,
} from '../../lib/api';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { MultiScriptText } from '../common/MultiScriptText';
import {
  Sparkles,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Key,
  Settings,
} from 'lucide-react';
import { ApiKeySettingsModal } from '../common/ApiKeySettingsModal';

interface SideAiAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  onQuestionAdded?: () => void;
}

export const SideAiAssistant: React.FC<SideAiAssistantProps> = ({
  isOpen,
  onToggle,
  onQuestionAdded,
}) => {
  const { headerConfig, addQuestion, addQuestions } = usePaperCartStore();

  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini');
  const [subject, setSubject] = useState(headerConfig.subject || 'বাংলা ১ম পত্র');
  const [chapter, setChapter] = useState('');
  const [typology, setTypology] = useState<QuestionTypology>('SIMPLE_MCQ');
  const [count, setCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');
  const [languages, setLanguages] = useState<SupportedLanguage[]>(['bn']);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  React.useEffect(() => {
    if (headerConfig.subject || headerConfig.kitab) {
      setSubject(headerConfig.subject || headerConfig.kitab || '');
    }
  }, [headerConfig.subject, headerConfig.kitab]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<QuestionData[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const checkHasKey = () => {
    const provider = getActiveAiProvider();
    setActiveProvider(provider);
    return provider === 'gemini' ? Boolean(getStoredGeminiKey()) : Boolean(getStoredOpenRouterKey());
  };

  const handleGenerate = async () => {
    const hasKey = checkHasKey();
    if (!hasKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setAddedIds(new Set());
    setSelectedIndices(new Set());

    const payload: GenerateQuestionsRequest = {
      mode: 'prompt',
      subject: subject || headerConfig.subject || 'বাংলা',
      grade: headerConfig.grade || '১০ম শ্রেণি',
      chapter,
      typology,
      count,
      difficulty,
      languages,
      additionalPrompt: additionalPrompt.trim() || undefined,
    };

    try {
      const res = await generateAiQuestions(payload);
      if (res.success && res.questions) {
        setGeneratedList(res.questions);
      } else {
        setErrorMessage(res.error || 'প্রশ্ন তৈরি করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'নেটওয়ার্ক বা সার্ভার ত্রুটি।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSingle = (q: QuestionData, index: number) => {
    addQuestion(q);
    setAddedIds((prev) => new Set(prev).add(index));
    if (onQuestionAdded) onQuestionAdded();
  };

  const handleAddSelected = () => {
    const selected = generatedList.filter((_, idx) => selectedIndices.has(idx));
    if (selected.length === 0) return;
    addQuestions(selected);
    setAddedIds((prev) => {
      const next = new Set(prev);
      selectedIndices.forEach((i) => next.add(i));
      return next;
    });
    setSelectedIndices(new Set());
    if (onQuestionAdded) onQuestionAdded();
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-l-xl shadow-xl flex flex-col items-center gap-1.5 transition group"
        title="AI প্রশ্ন সহকারী খুলুন"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
        <span className="[writing-mode:vertical-rl] text-xs font-bold tracking-wider py-1">
          AI প্রশ্ন সহকারী
        </span>
        <ChevronLeft className="w-4 h-4 text-emerald-200 group-hover:-translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed right-0 top-16 bottom-0 w-[420px] max-w-[95vw] bg-white border-l border-slate-300 shadow-2xl z-40 flex flex-col transition-all">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold leading-tight">AI প্রশ্ন সহকারী</h2>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(true)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition ${
                    activeProvider === 'gemini'
                      ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  }`}
                  title="AI ইঞ্জিন পরিবর্তন / সেটিংস"
                >
                  <span>{activeProvider === 'gemini' ? 'Google Gemini' : 'OpenRouter'}</span>
                  <Settings className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-emerald-100">ক্লিক করলেই সরাসরি প্রশ্নপত্রে বসে যাবে</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Box */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-0.5">বিষয়:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-0.5">অধ্যায় / টপিক:</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="যেমন: সুভা, আলো..."
                className="w-full p-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-0.5">ধরন:</label>
              <select
                value={typology}
                onChange={(e) => setTypology(e.target.value as QuestionTypology)}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="SIMPLE_MCQ">সাধারণ MCQ</option>
                <option value="MULTIPLE_COMPLETION_MCQ">বহুপদী MCQ</option>
                <option value="CQ">সৃজনশীল (CQ)</option>
                <option value="FILL_BLANKS">শূন্যস্থান</option>
                <option value="MATCHING">মিলকরণ</option>
                <option value="MULTI_PART">বহুধাপ প্রশ্ন (ক, খ, গ)</option>
                <option value="QAWAID_MISAL">ব্যাকরণ ও নির্ণয়মূলক</option>
                <option value="TARKIB_IRAB">তারকীব ও এ'রাব</option>
                <option value="TAHQEEQ_SIGHA">তাহকীক ও সীগাহ</option>
                <option value="TARJAMA_TASHREEH">তরজমা ও তাশরীহ</option>
                <option value="HURUF_TAJWEED">হুরূফ ও তাজবীদ</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-0.5">সংখ্যা:</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-bold text-emerald-800"
              >
                <option value={3}>৩ টি</option>
                <option value={5}>৫ টি</option>
                <option value={10}>১০ টি</option>
                <option value={15}>১৫ টি</option>
              </select>
            </div>
          </div>

          {/* Special AI Instructions (Optional) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-0.5">
              বিশেষ এআই নির্দেশনা (ঐচ্ছিক):
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="যেমন: বিগত বছরের বোর্ড পরীক্ষার আদলে তৈরি করুন, বা কেবল নির্দিষ্ট টপিক থেকে প্রশ্ন দিন..."
              rows={2}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI প্রশ্ন প্রস্তুত করছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{count}টি প্রশ্ন জেনারেট করুন</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-700 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.includes('API Key') && (
                  <button
                    onClick={() => setIsKeyModalOpen(true)}
                    className="block text-emerald-700 font-bold underline mt-1"
                  >
                    {activeProvider === 'gemini' ? 'Google Gemini' : 'OpenRouter'} API Key সেট করুন
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Bar */}
        {generatedList.length > 0 && (
          <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              ফলাফল: {generatedList.length}টি প্রশ্ন
            </span>
            {selectedIndices.size > 0 && (
              <button
                onClick={handleAddSelected}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition"
              >
                সিলেক্ট করা {selectedIndices.size}টি যোগ করুন
              </button>
            )}
          </div>
        )}

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {generatedList.length === 0 && !isGenerating && (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">কোনো প্রশ্ন তৈরি করা হয়নি</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                উপরে বিষয় ও অধ্যায় লিখে &quot;জেনারেট করুন&quot; চাপুন। প্রশ্নগুলো আসার পর একটি ক্লিকেই প্রশ্নপত্রে যোগ হয়ে যাবে।
              </p>
            </div>
          )}

          {generatedList.map((q, idx) => {
            const isAdded = addedIds.has(idx);
            const isSelected = selectedIndices.has(idx);

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isAdded
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : isSelected
                    ? 'bg-blue-50/50 border-blue-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectIndex(idx)}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-slate-700">{idx + 1}.</span>
                  </div>

                  {isAdded ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      যুক্ত হয়েছে
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddSingle(q, idx)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-sm transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>যুক্ত করুন</span>
                    </button>
                  )}
                </div>

                {/* Stem */}
                <div className="text-slate-800 font-medium leading-relaxed">
                  <MultiScriptText text={q.stemOrPassage} />
                </div>

                {/* Statements if MULTIPLE_COMPLETION */}
                {q.statements && q.statements.length > 0 && (
                  <div className="my-1 pl-2 space-y-0.5 text-slate-600 text-[11px]">
                    {q.statements.map((st, sIdx) => (
                      <div key={sIdx}>
                        <span className="font-bold mr-1">{['i.', 'ii.', 'iii.'][sIdx]}</span>
                        <MultiScriptText text={st} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Options if MCQ */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 mt-1.5 pl-2 text-[11px]">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`flex items-baseline gap-1 ${
                          opt.isCorrect ? 'font-bold text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        <span className="font-semibold text-slate-400">{opt.label})</span>
                        <MultiScriptText text={opt.text} />
                      </div>
                    ))}
                  </div>
                )}

                {/* CQ sub-questions */}
                {q.subQuestions && q.subQuestions.length > 0 && (
                  <div className="mt-1.5 pl-2 space-y-1 text-[11px] border-t pt-1">
                    {q.subQuestions.map((sq, sqIdx) => (
                      <div key={sqIdx} className="flex justify-between text-slate-700">
                        <span>
                          <span className="font-bold text-indigo-700 mr-1">{sq.part})</span>
                          <MultiScriptText text={sq.questionText} />
                        </span>
                        <span className="text-slate-400 font-semibold">[{sq.marks}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ApiKeySettingsModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => checkHasKey()}
      />
    </>
  );
};
