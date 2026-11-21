'use client';

import React from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { DEFAULT_NAHW_SUBQUESTIONS } from './arabic2ndDefaults';

interface NahwQuestionEditorProps {
  includeQ2: boolean;
  onToggleInclude: (val: boolean) => void;
  q2Number: string;
  onChangeNumber: (val: string) => void;
  q2Title: string;
  onChangeTitle: (val: string) => void;
  q2MarksFormula: string;
  onChangeMarksFormula: (val: string) => void;
  q2SubQuestions: string[];
  onChangeSubQuestions: (val: string[]) => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

export const NahwQuestionEditor: React.FC<NahwQuestionEditorProps> = ({
  includeQ2,
  onToggleInclude,
  q2Number,
  onChangeNumber,
  q2Title,
  onChangeTitle,
  q2MarksFormula,
  onChangeMarksFormula,
  q2SubQuestions,
  onChangeSubQuestions,
}) => {
  const handleAddQuestion = () => {
    onChangeSubQuestions([...q2SubQuestions, '']);
  };

  const handleUpdateQuestion = (index: number, val: string) => {
    const updated = [...q2SubQuestions];
    updated[index] = val;
    onChangeSubQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (q2SubQuestions.length <= 1) return;
    onChangeSubQuestions(q2SubQuestions.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    onChangeNumber('٢-');
    onChangeTitle('أجب عن الأسئلة التالية باللغة العربية من قسم النحو (أربعة فقط) :');
    onChangeMarksFormula('٢٠ = ٤ × ٥');
    onChangeSubQuestions(DEFAULT_NAHW_SUBQUESTIONS);
  };

  return (
    <div className="border border-teal-200 rounded-2xl bg-teal-50/30 p-4 transition-all hover:border-teal-300">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-teal-200/60">
        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={includeQ2}
            onChange={(e) => onToggleInclude(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="font-serif">২ নং প্রশ্ন: قسم النحو (ইলমুন নাহু)</span>
        </label>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 font-semibold transition"
          title="ডিফল্ট প্রশ্নাবলি ফিরিয়ে আনুন"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট</span>
        </button>
      </div>

      {includeQ2 && (
        <div className="space-y-3">
          {/* Question Number, Title & Marks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর
              </label>
              <input
                type="text"
                value={q2Number}
                onChange={(e) => onChangeNumber(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none"
                placeholder="٢-"
              />
            </div>
            <div className="md:col-span-7">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                প্রশ্নের মূল নির্দেশনা (Title)
              </label>
              <input
                type="text"
                value={q2Title}
                onChange={(e) => onChangeTitle(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none"
                placeholder="أجب عن الأسئلة التالية باللغة العربية من قسم النحو..."
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর বণ্টন (Marks)
              </label>
              <input
                type="text"
                value={q2MarksFormula}
                onChange={(e) => onChangeMarksFormula(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-teal-500 focus:outline-none text-teal-800"
                placeholder="٢٠ = ٤ × ٥"
              />
            </div>
          </div>

          {/* Sub-questions List */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>উপ-প্রশ্নসমূহ (Sub-questions):</span>
              <span className="text-slate-500 font-normal">মোট {q2SubQuestions.length}টি প্রশ্ন</span>
            </div>

            {q2SubQuestions.map((q, idx) => {
              const letter = ARABIC_LETTERS[idx] || String(idx + 1);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-serif font-bold flex items-center justify-center shrink-0 text-sm">
                    ({letter})
                  </span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                    dir="rtl"
                    className="flex-1 px-2.5 py-1 text-xs font-serif border border-transparent hover:border-slate-300 focus:border-teal-500 rounded-lg text-right focus:outline-none bg-transparent"
                    placeholder="اكتب السؤال هنا..."
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    disabled={q2SubQuestions.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition shrink-0"
                    title="প্রশ্নটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add Extra Question Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-white hover:bg-teal-100 border border-teal-300 rounded-xl transition shadow-2xs cursor-pointer font-serif"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة سؤال آخر (অ্যাড এক্সট্রা প্রশ্ন)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
