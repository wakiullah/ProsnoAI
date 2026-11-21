'use client';

import React from 'react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { Plus, Trash2, Layers, Copy } from 'lucide-react';

interface PassageGroupCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const PassageGroupCard: React.FC<PassageGroupCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  return (
    <div className="bg-amber-50/40 rounded-lg border-2 border-amber-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded border border-amber-300">
            <Layers className="w-3 h-3" />
            অভিন্ন তথ্যভিত্তিক / অনুচ্ছেদ গ্রুপ
          </span>
          <span className="text-xs text-amber-700 font-medium">
            সংযুক্ত প্রশ্ন: {question.passageQuestions?.length || 0} টি
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddToPaper && (
            <button
              onClick={onAddToPaper}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              title="Add entire group to Question Paper"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সম্পূর্ণ গ্রুপ যুক্ত করুন</span>
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-emerald-50 transition"
              title="ডুপ্লিকেট করুন"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stimulus Passage */}
      <div className="bg-white p-3 rounded border border-amber-200 text-sm text-slate-800 leading-relaxed mb-3">
        <div className="text-xs font-bold text-amber-800 mb-1 italic">
          নিচের অনুচ্ছেদ / উদ্দীপকটি পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও:
        </div>
        <MultiScriptText text={question.stemOrPassage} />
      </div>

      {/* Linked Questions */}
      <div className="space-y-2.5 pl-2">
        {question.passageQuestions?.map((pq, pqIdx) => (
          <div key={pqIdx} className="bg-white/80 p-2.5 rounded border border-slate-200 text-xs">
            <div className="flex justify-between items-baseline font-semibold text-slate-800 mb-1">
              <div>
                <span className="font-bold text-amber-900 mr-1.5">{pq.order || `${pqIdx + 1}`}.</span>
                <MultiScriptText text={pq.questionText} />
              </div>
              <span className="text-slate-400 font-normal">[{pq.marks} নম্বর]</span>
            </div>

            {pq.options && pq.options.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-1.5 pl-3">
                {pq.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`flex items-baseline gap-1 ${
                      opt.isCorrect || opt.label === pq.correctAnswer
                        ? 'font-bold text-emerald-700 bg-emerald-50 px-1 rounded'
                        : 'text-slate-600'
                    }`}
                  >
                    <span className="font-semibold text-slate-400">{opt.label})</span>
                    <MultiScriptText text={opt.text} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
