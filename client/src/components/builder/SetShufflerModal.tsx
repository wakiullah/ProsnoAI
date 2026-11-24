'use client';

import React, { useState, useEffect } from 'react';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { shufflePaperSets } from '../../lib/api';
import { Shuffle, X, Check, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { ExamSet, QuestionData } from 'proshno-shared';

interface SetShufflerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BN_SET_NAMES = ['ক সেট', 'খ সেট', 'গ সেট', 'ঘ সেট'];
const EN_SET_NAMES = ['Set A', 'Set B', 'Set C', 'Set D'];

function buildLocalFallbackSets(questions: QuestionData[], setNames: string[]): ExamSet[] {
  return setNames.map((setName) => {
    const answerKeyMap: Record<number, string> = {};
    let qNum = 1;
    const entries = questions.map((q, idx) => {
      const qId = q._id?.toString() || `q-${idx}`;
      if (q.options && q.options.length > 0) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt) {
          answerKeyMap[qNum] = correctOpt.label;
        }
        const entry = {
          questionId: qId,
          order: qNum,
          customQuestionData: q,
        };
        qNum++;
        return entry;
      }
      const entry = {
        questionId: qId,
        order: qNum,
        customQuestionData: q,
      };
      qNum++;
      return entry;
    });

    return {
      setName,
      questionEntries: entries,
      answerKeyMap,
    };
  });
}

export const SetShufflerModal: React.FC<SetShufflerModalProps> = ({ isOpen, onClose }) => {
  const { questions, sets, setGeneratedSets, setActiveSet } = usePaperCartStore();
  const [isShuffling, setIsShuffling] = useState(false);
  const [setFormat, setSetFormat] = useState<'bn' | 'en'>('bn');
  const [selectedSetCount, setSelectedSetCount] = useState<number>(4);
  const [previewSets, setPreviewSets] = useState<ExamSet[]>(sets);

  useEffect(() => {
    setPreviewSets(sets);
    if (sets.length > 0) {
      const first = sets[0].setName;
      if (EN_SET_NAMES.includes(first)) {
        setSetFormat('en');
      } else {
        setSetFormat('bn');
      }
      setSelectedSetCount(sets.length);
    }
  }, [sets, isOpen]);

  if (!isOpen) return null;

  const baseNames = setFormat === 'bn' ? BN_SET_NAMES : EN_SET_NAMES;

  const handleShuffle = async () => {
    setIsShuffling(true);
    const setNames = baseNames.slice(0, selectedSetCount);

    try {
      let generated: ExamSet[];
      try {
        generated = await shufflePaperSets(questions, setNames);
        if (!generated || !Array.isArray(generated) || generated.length === 0) {
          generated = buildLocalFallbackSets(questions, setNames);
        }
      } catch {
        generated = buildLocalFallbackSets(questions, setNames);
      }

      setPreviewSets(generated);
      setGeneratedSets(generated);
      if (generated.length > 0) {
        setActiveSet(generated[0].setName);
      }
    } finally {
      setIsShuffling(false);
    }
  };

  const handleClearSets = () => {
    setPreviewSets([]);
    setGeneratedSets([]);
    setActiveSet('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-600" />
            <span>প্রশ্ন সেট ও শাফল জেনারেটর (ক/খ/গ/ঘ বা Set A/B/C/D)</span>
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            কীভাবে সেট কাজ করে?
          </p>
          <p>
            • ডিফল্টভাবে প্রশ্নপত্রে কোনো সেট লেখা থাকে না। এখানে সেট তৈরি করলেই কেবল প্রশ্নপত্রের হেডারে সেট কোড (`ক সেট` বা `Set A`) যুক্ত হবে।
          </p>
          <p>
            • বহুনির্বাচনি (MCQ) প্রশ্নগুলোর অপশন ও ক্রম প্রতিটি সেটের জন্য স্বয়ংক্রিয়ভাবে শাফল হবে এবং আলাদা উত্তরমালা তৈরি হবে।
          </p>
        </div>

        {/* Set Naming Format & Count Controls */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">১. সেটের নামকরণের ধরন:</span>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSetFormat('bn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  setFormat === 'bn'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                বাংলা (ক সেট, খ সেট...)
              </button>
              <button
                type="button"
                onClick={() => setSetFormat('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  setFormat === 'en'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                English (Set A, Set B...)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700">২. কয়টি সেট তৈরি করবেন:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
              {[1, 2, 3, 4].map((count) => {
                const labelPreview = baseNames.slice(0, count).join(', ');
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedSetCount(count)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedSetCount === count
                        ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {count}টি ({labelPreview})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            {previewSets.length > 0 && (
              <button
                type="button"
                onClick={handleClearSets}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সেট মুছে ফেলুন (সেট ছাড়া প্রশ্নপত্র)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isShuffling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4" />
              )}
              <span>সেট তৈরি ও প্রশ্নপত্রে যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Sets Answer Key Mapping Preview */}
        {previewSets.length > 0 ? (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700">
              তৈরি হওয়া সেটসমূহ (যেকোনো সেটে ক্লিক করে প্রিভিউ দেখুন):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {previewSets.map((s) => (
                <div
                  key={s.setName}
                  onClick={() => setActiveSet(s.setName)}
                  className="p-3 bg-slate-50 hover:bg-purple-50/50 cursor-pointer rounded-xl border border-slate-200 text-xs transition"
                >
                  <div className="flex justify-between items-center font-bold text-purple-900 border-b pb-1.5 mb-2">
                    <span>{s.setName}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      প্রশ্ন: {s.questionEntries.length} টি
                    </span>
                  </div>

                  {Object.keys(s.answerKeyMap || {}).length > 0 ? (
                    <div className="text-[11px] text-slate-600 max-h-28 overflow-y-auto">
                      <span className="font-semibold block mb-1">উত্তরমালা:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(s.answerKeyMap || {})
                          .slice(0, 15)
                          .map(([qNum, ans]) => (
                            <span
                              key={qNum}
                              className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-purple-700"
                            >
                              {qNum}:{ans}
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      এই সেটটি প্রশ্নপত্রের হেডারে যুক্ত হয়েছে।
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            বর্তমানে প্রশ্নপত্রে কোনো সেট নেই। সেট যুক্ত করতে উপরে &quot;সেট তৈরি ও প্রশ্নপত্রে যুক্ত করুন&quot; বাটনে চাপুন।
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সম্পন্ন করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
