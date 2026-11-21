'use client';

import React, { useState } from 'react';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { shufflePaperSets } from '../../lib/api';
import { Shuffle, X, Check, Loader2, Sparkles } from 'lucide-react';
import { ExamSet } from 'proshno-shared';

interface SetShufflerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetShufflerModal: React.FC<SetShufflerModalProps> = ({ isOpen, onClose }) => {
  const { questions, sets, setGeneratedSets, setActiveSet } = usePaperCartStore();
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedSetCount, setSelectedSetCount] = useState<number>(4);
  const [previewSets, setPreviewSets] = useState<ExamSet[]>(sets);

  if (!isOpen) return null;

  const handleShuffle = async () => {
    setIsShuffling(true);
    const setNames = ['Set A', 'Set B', 'Set C', 'Set D'].slice(0, selectedSetCount);

    try {
      const generated = await shufflePaperSets(questions, setNames);
      setPreviewSets(generated);
      setGeneratedSets(generated);
      if (generated.length > 0) {
        setActiveSet(generated[0].setName);
      }
    } catch (err: any) {
      console.error('Error shuffling sets:', err);
    } finally {
      setIsShuffling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-600" />
            <span>স্মার্ট সেট শাফল জেনারেটর (Smart Set Shuffler)</span>
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs text-purple-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            কীভাবে কাজ করে?
          </p>
          <p>
            ১. অনুচ্ছেদভিত্তিক গ্রুপ প্রশ্নগুলো তাদের উদ্দীপকের সাথেই অবিচ্ছেদ্য থাকবে।
          </p>
          <p>
            ২. বহুনির্বাচনী প্রশ্নগুলোর অপশন (ক, খ, গ, ঘ) প্রতিটি সেটের জন্য এলোমেলো হবে এবং উত্তরমালা স্বয়ংক্রিয়ভাবে সিঙ্ক থাকবে।
          </p>
          <p>
            ৩. প্রতিটি সেটের জন্য প্রিন্টযোগ্য আলাদা উত্তরমালা ও প্রশ্নপত্র পাওয়া যাবে।
          </p>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">সেট সংখ্যা:</span>
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setSelectedSetCount(count)}
                className={`px-3 py-1 rounded font-semibold border transition ${
                  selectedSetCount === count
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {count} টি সেট ({count === 2 ? 'A, B' : count === 3 ? 'A, B, C' : 'A, B, C, D'})
              </button>
            ))}
          </div>

          <button
            onClick={handleShuffle}
            disabled={isShuffling || questions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-purple-200 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isShuffling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shuffle className="w-4 h-4" />
            )}
            <span>সেট প্রস্তুত করুন</span>
          </button>
        </div>

        {/* Sets Answer Key Mapping Preview */}
        {previewSets.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              তৈরি হওয়া সেট ও উত্তরমালা ম্যাপিং প্রিভিউ:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {previewSets.map((s) => (
                <div key={s.setName} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between items-center font-bold text-purple-900 border-b pb-1.5 mb-2">
                    <span>{s.setName} ({s.setName === 'Set A' ? 'সেট ক' : s.setName === 'Set B' ? 'সেট খ' : s.setName === 'Set C' ? 'সেট গ' : 'সেট ঘ'})</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      প্রশ্ন: {s.questionEntries.length} টি
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 max-h-32 overflow-y-auto">
                    <span className="font-semibold block mb-1">উত্তরমালা (নমুনা):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(s.answerKeyMap || {}).slice(0, 15).map(([qNum, ans]) => (
                        <span key={qNum} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-purple-700">
                          {qNum}:{ans}
                        </span>
                      ))}
                      {Object.keys(s.answerKeyMap || {}).length > 15 && (
                        <span className="text-slate-400 self-center">...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            এখনও কোনো সেট জেনারেট করা হয়নি। &quot;সেট প্রস্তুত করুন&quot; বাটনে চাপুন।
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সম্পন্ন করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
