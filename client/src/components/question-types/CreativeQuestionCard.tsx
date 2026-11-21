'use client';

import React, { useState } from 'react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { BookOpen, Check, Edit2, Plus, Trash2, Copy } from 'lucide-react';

interface CreativeQuestionCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const CreativeQuestionCard: React.FC<CreativeQuestionCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(question.stemOrPassage || '');
  const [subQuestions, setSubQuestions] = useState(question.subQuestions || []);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({
        ...question,
        stemOrPassage: stem,
        subQuestions,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-indigo-100 p-4 shadow-sm hover:border-indigo-200 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
            <BookOpen className="w-3 h-3" />
            সৃজনশীল প্রশ্ন (CQ)
          </span>
          <span className="text-xs text-indigo-900 font-bold">পূর্ণমান: {question.marks || 10}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddToPaper && (
            <button
              onClick={onAddToPaper}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              title="Add to Question Paper"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যুক্ত করুন</span>
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
          {onUpdate && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-4 h-4" />}
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

      {isEditing ? (
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">উদ্দীপক:</label>
            <textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            {subQuestions.map((sq, sqIdx) => (
              <div key={sqIdx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 w-6">{sq.part})</span>
                <input
                  type="text"
                  value={sq.questionText}
                  onChange={(e) => {
                    const updated = [...subQuestions];
                    updated[sqIdx].questionText = e.target.value;
                    setSubQuestions(updated);
                  }}
                  className="flex-1 text-xs p-1.5 border border-slate-300 rounded"
                />
                <span className="text-xs text-slate-400 font-semibold w-6">[{sq.marks}]</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-slate-800 leading-relaxed mb-3">
            <div className="text-xs font-bold text-slate-500 mb-1">
              {typeof index === 'number' && <span className="mr-1">{index} নং প্রশ্ন:</span>}
              উদ্দীপক:
            </div>
            <MultiScriptText text={question.stemOrPassage} />
          </div>

          <div className="space-y-2 pl-3">
            {question.subQuestions?.map((sq, sqIdx) => (
              <div key={sqIdx} className="flex justify-between items-baseline text-xs text-slate-800">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-indigo-700">{sq.part})</span>
                  <span>
                    <span className="text-[10px] text-slate-400 font-medium mr-1">
                      [{sq.bloomTitle}]
                    </span>
                    <MultiScriptText text={sq.questionText} />
                  </span>
                </div>
                <span className="font-semibold text-slate-500 ml-4">
                  {sq.marks === 1 ? '১' : sq.marks === 2 ? '২' : sq.marks === 3 ? '৩' : '৪'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
