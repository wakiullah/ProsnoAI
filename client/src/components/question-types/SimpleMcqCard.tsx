'use client';

import React, { useState } from 'react';
import { QuestionData, stripArabicHarakat } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { Check, Edit2, Plus, Trash2, Wand2, Copy } from 'lucide-react';

interface SimpleMcqCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
  isStaging?: boolean;
}

export const SimpleMcqCard: React.FC<SimpleMcqCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
  isStaging = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(question.stemOrPassage || '');
  const [options, setOptions] = useState(question.options || []);
  const [marks, setMarks] = useState(question.marks || 1);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({
        ...question,
        stemOrPassage: stem,
        options,
        marks,
      });
    }
  };

  const handleStripHarakat = () => {
    setStem(stripArabicHarakat(stem));
    setOptions(options.map((o) => ({ ...o, text: stripArabicHarakat(o.text) })));
  };

  const hasArabic = /[\u0600-\u06FF]/.test(isEditing ? stem : (question.stemOrPassage || ''));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
            MCQ (বহুনির্বাচনী)
          </span>
          <span className="text-xs text-slate-500 font-medium">মান: {question.marks}</span>
          {question.chapter && (
            <span className="text-xs text-slate-400">| অধ্যায়: {question.chapter}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hasArabic && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleStripHarakat();
                } else if (onUpdate) {
                  onUpdate({
                    ...question,
                    stemOrPassage: stripArabicHarakat(question.stemOrPassage || ''),
                    options: (question.options || []).map((o) => ({
                      ...o,
                      text: stripArabicHarakat(o.text),
                    })),
                  });
                }
              }}
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded border border-amber-200 hover:bg-amber-100 transition"
              title="আরবি হরকত মুছে শুধু মূল হরফ বা এবারত রাখুন"
            >
              <Wand2 className="w-3 h-3 text-amber-600" />
              <span>হরকত মুছুন</span>
            </button>
          )}

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
              title={isEditing ? 'Save' : 'Edit'}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs text-slate-500 font-medium">প্রশ্ন:</label>
            <textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-600 w-5">{opt.label})</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[oIdx].text = e.target.value;
                    setOptions(newOpts);
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
            <MultiScriptText text={question.stemOrPassage} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5 pl-3">
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

          {question.explanation && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              <span className="font-semibold text-slate-600">ব্যাখ্যা: </span>
              <MultiScriptText text={question.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
