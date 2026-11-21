'use client';

import React, { useState } from 'react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { Check, Edit2, Plus, Trash2, Copy } from 'lucide-react';

interface MultipleCompletionCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const MultipleCompletionCard: React.FC<MultipleCompletionCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(question.stemOrPassage || '');
  const [statements, setStatements] = useState(question.statements || []);
  const [options, setOptions] = useState(question.options || []);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({
        ...question,
        stemOrPassage: stem,
        statements,
        options,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded border border-purple-200">
            বহুপদী সমাপ্তিসূচক MCQ
          </span>
          <span className="text-xs text-slate-500 font-medium">মান: {question.marks}</span>
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
          <textarea
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            className="w-full text-sm p-2 border border-slate-300 rounded"
            rows={2}
          />
          <div className="space-y-1.5">
            {statements.map((stmt, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-5">
                  {['i.', 'ii.', 'iii.'][sIdx] || `${sIdx + 1}.`}
                </span>
                <input
                  type="text"
                  value={stmt}
                  onChange={(e) => {
                    const newStmts = [...statements];
                    newStmts[sIdx] = e.target.value;
                    setStatements(newStmts);
                  }}
                  className="flex-1 text-xs p-1.5 border border-slate-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-slate-800 text-sm font-medium leading-relaxed">
            {typeof index === 'number' && <span className="font-bold mr-1.5">{index}.</span>}
            <MultiScriptText text={question.stemOrPassage || 'নিচের তথ্যগুলো লক্ষ্য কর:'} />
          </div>

          <div className="my-2 pl-4 space-y-1">
            {question.statements?.map((stmt, sIdx) => (
              <div key={sIdx} className="text-xs text-slate-700">
                <span className="font-semibold text-slate-500 mr-1.5">
                  {['i.', 'ii.', 'iii.'][sIdx] || `${sIdx + 1}.`}
                </span>
                <MultiScriptText text={stmt} />
              </div>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-600 mb-1 pl-2">নিচের কোনটি সঠিক?</div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-3">
            {question.options?.map((opt, oIdx) => (
              <div
                key={oIdx}
                className={`text-xs flex items-baseline gap-1.5 ${
                  opt.isCorrect || opt.label === question.correctAnswer
                    ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200'
                    : 'text-slate-700'
                }`}
              >
                <span className="font-semibold text-slate-500">{opt.label})</span>
                <MultiScriptText text={opt.text} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
