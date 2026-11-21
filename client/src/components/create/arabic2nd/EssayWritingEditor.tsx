'use client';

import React from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { DEFAULT_Q7_ESSAY_TOPICS } from './arabic2ndDefaults';

interface EssayWritingEditorProps {
  include: boolean;
  onToggleInclude: (val: boolean) => void;
  qNumber: string;
  onChangeNumber: (val: string) => void;
  qTitle: string;
  onChangeTitle: (val: string) => void;
  marksFormula: string;
  onChangeMarksFormula: (val: string) => void;
  topics: string[];
  onChangeTopics: (val: string[]) => void;
  onReset: () => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

export const EssayWritingEditor: React.FC<EssayWritingEditorProps> = ({
  include,
  onToggleInclude,
  qNumber,
  onChangeNumber,
  qTitle,
  onChangeTitle,
  marksFormula,
  onChangeMarksFormula,
  topics,
  onChangeTopics,
  onReset,
}) => {
  const handleAddTopic = () => {
    onChangeTopics([...topics, '']);
  };

  const handleUpdateTopic = (index: number, val: string) => {
    const updated = [...topics];
    updated[index] = val;
    onChangeTopics(updated);
  };

  const handleDeleteTopic = (index: number) => {
    if (topics.length <= 1) return;
    onChangeTopics(topics.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-amber-200 rounded-2xl p-4 transition-all bg-amber-50/30 hover:border-amber-300">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-amber-200/60">
        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={include}
            onChange={(e) => onToggleInclude(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="font-serif">৭ নং প্রশ্ন: كتابة مقالة (প্রবন্ধ বা রচনা লিখন)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-sans font-bold border border-amber-200 text-amber-800">
            ১৫ নম্বর
          </span>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-amber-800 flex items-center gap-1 font-semibold transition"
          title="ডিফল্ট প্রবন্ধ টপিক ফিরিয়ে আনুন"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট</span>
        </button>
      </div>

      {include && (
        <div className="space-y-3">
          {/* Question Number, Title & Marks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর
              </label>
              <input
                type="text"
                value={qNumber}
                onChange={(e) => onChangeNumber(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-amber-500 focus:outline-none"
                placeholder="٧-"
              />
            </div>
            <div className="md:col-span-7">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                প্রশ্নের মূল নির্দেশনা (Title)
              </label>
              <input
                type="text"
                value={qTitle}
                onChange={(e) => onChangeTitle(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-amber-500 focus:outline-none"
                placeholder="اكتب بالعربية مقالة من الموضوعات التالية (واحدة فقط) :"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর বণ্টন (Marks)
              </label>
              <input
                type="text"
                value={marksFormula}
                onChange={(e) => onChangeMarksFormula(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-amber-500 focus:outline-none text-amber-900"
                placeholder="١٥ = ١ × ١٥"
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>প্রবন্ধের বিষয়সমূহ (الموضوعات):</span>
              <span className="text-slate-500 font-normal">মোট {topics.length}টি বিষয়</span>
            </div>

            {topics.map((t, idx) => {
              const letter = ARABIC_LETTERS[idx] || String(idx + 1);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-serif font-bold flex items-center justify-center shrink-0 text-sm">
                    ({letter})
                  </span>
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => handleUpdateTopic(idx, e.target.value)}
                    dir="rtl"
                    className="flex-1 px-2.5 py-1 text-xs font-serif border border-transparent hover:border-slate-300 focus:border-amber-500 rounded-lg text-right focus:outline-none bg-transparent"
                    placeholder="اكتب الموضوع هنا..."
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteTopic(idx)}
                    disabled={topics.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition shrink-0"
                    title="বিষয়টি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add Extra Topic Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddTopic}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded-xl transition shadow-2xs cursor-pointer font-serif"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة موضوع آخر (আরেকটি বিষয় যোগ করুন)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
