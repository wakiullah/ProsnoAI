'use client';

import React, { useState } from 'react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { Plus, Trash2, Edit2, Check, X, Copy } from 'lucide-react';

interface FillBlanksCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const FillBlanksCard: React.FC<FillBlanksCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(question.stemOrPassage || '');
  const [marks, setMarks] = useState<number>(question.marks || 5);
  const [hasClues, setHasClues] = useState<boolean>(Boolean(question.hasClues));
  const [wordCluesText, setWordCluesText] = useState<string>((question.wordClues || []).join(', '));

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      const clues = wordCluesText
        .split(/[,،]+/)
        .map((c) => c.trim())
        .filter(Boolean);
      onUpdate({
        ...question,
        stemOrPassage: stem,
        marks: Number(marks) || 5,
        hasClues,
        wordClues: hasClues ? clues : undefined,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStem(question.stemOrPassage || '');
    setMarks(question.marks || 5);
    setHasClues(Boolean(question.hasClues));
    setWordCluesText((question.wordClues || []).join(', '));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
            শূন্যস্থান পূরণ {hasClues ? '(ক্লু সহ)' : '(ক্লু ছাড়া)'}
          </span>
          <span className="text-xs text-slate-500 font-medium">মান: {marks}</span>
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
              title={isEditing ? 'সংরক্ষণ করুন' : 'এডিট করুন'}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleCancel}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition"
              title="বাতিল করুন"
            >
              <X className="w-4 h-4" />
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
        <div className="space-y-3 mt-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-3">
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                প্রশ্ন / শূন্যস্থান বাক্য:
              </label>
              <textarea
                value={stem}
                onChange={(e) => setStem(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                rows={3}
                placeholder="বাক্য বা অনুচ্ছেদ লিখুন (যেমন: বাংলাদেশ একটি ______ প্রধান দেশ।)"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">নম্বর (মান):</label>
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value) || 1)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasClues}
                onChange={(e) => setHasClues(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>ক্লু বক্স (Word Bank) ব্যবহার করুন</span>
            </label>

            {hasClues && (
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  ক্লু শব্দসমূহ (কমা দিয়ে আলাদা করুন):
                </label>
                <input
                  type="text"
                  value={wordCluesText}
                  onChange={(e) => setWordCluesText(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  placeholder="যেমন: নদী, পাহাড়, বন, সাগর"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {hasClues && question.wordClues && question.wordClues.length > 0 && (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-2 rounded mb-3 flex flex-wrap gap-1.5 justify-center">
              {question.wordClues.map((clue, cIdx) => (
                <span key={cIdx} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                  <MultiScriptText text={clue} />
                </span>
              ))}
            </div>
          )}

          <div className="text-slate-800 text-sm leading-relaxed">
            {typeof index === 'number' && <span className="font-bold mr-1.5">{index}.</span>}
            <MultiScriptText text={question.stemOrPassage} />
          </div>
        </>
      )}
    </div>
  );
};
