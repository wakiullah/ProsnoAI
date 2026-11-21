'use client';

import React from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

interface TarjamaEditorProps {
  titleLabel: string;
  badgeText: string;
  badgeColorClass?: string;
  include: boolean;
  onToggleInclude: (val: boolean) => void;
  qNumber: string;
  onChangeNumber: (val: string) => void;
  qTitle: string;
  onChangeTitle: (val: string) => void;
  marksFormula: string;
  onChangeMarksFormula: (val: string) => void;
  sentences: string[];
  onChangeSentences: (val: string[]) => void;
  letterFormat: 'ar' | 'bn';
  direction?: 'rtl' | 'ltr';
  onReset: () => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
const BENGALI_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'];

export const TarjamaEditor: React.FC<TarjamaEditorProps> = ({
  titleLabel,
  badgeText,
  badgeColorClass = 'text-blue-800 bg-blue-50/40 border-blue-200',
  include,
  onToggleInclude,
  qNumber,
  onChangeNumber,
  qTitle,
  onChangeTitle,
  marksFormula,
  onChangeMarksFormula,
  sentences,
  onChangeSentences,
  letterFormat,
  direction = 'rtl',
  onReset,
}) => {
  const letters = letterFormat === 'ar' ? ARABIC_LETTERS : BENGALI_LETTERS;

  const handleAddSentence = () => {
    onChangeSentences([...sentences, '']);
  };

  const handleUpdateSentence = (index: number, val: string) => {
    const updated = [...sentences];
    updated[index] = val;
    onChangeSentences(updated);
  };

  const handleDeleteSentence = (index: number) => {
    if (sentences.length <= 1) return;
    onChangeSentences(sentences.filter((_, i) => i !== index));
  };

  return (
    <div className={`border rounded-2xl p-4 transition-all ${badgeColorClass} border hover:shadow-2xs`}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200/70">
        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={include}
            onChange={(e) => onToggleInclude(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <span className="font-serif">{titleLabel}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-sans font-bold border border-slate-200 text-slate-600">
            {badgeText}
          </span>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
          title="ডিফল্ট বাক্যসমূহ ফিরিয়ে আনুন"
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
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-blue-500 focus:outline-none"
                placeholder="٤-"
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
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-blue-500 focus:outline-none"
                placeholder="ترجم من العربية إلى البنغالية (خمسة فقط) :"
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
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="١٠ = ٥ × ٢"
              />
            </div>
          </div>

          {/* Sentences List */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>অনুবাদযোগ্য বাক্যসমূহ ({letterFormat === 'ar' ? 'আরবি' : 'বাংলা'}):</span>
              <span className="text-slate-500 font-normal">মোট {sentences.length}টি বাক্য</span>
            </div>

            {sentences.map((sent, idx) => {
              const letter = letters[idx] || String(idx + 1);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-serif font-bold flex items-center justify-center shrink-0 text-sm">
                    ({letter})
                  </span>
                  <input
                    type="text"
                    value={sent}
                    onChange={(e) => handleUpdateSentence(idx, e.target.value)}
                    dir={direction}
                    className={`flex-1 px-2.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-500 rounded-lg focus:outline-none bg-transparent ${
                      direction === 'rtl' ? 'text-right font-serif' : 'text-left font-sans'
                    }`}
                    placeholder={direction === 'rtl' ? 'اكتب الجملة هنا...' : 'বাক্য লিখুন...'}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSentence(idx)}
                    disabled={sentences.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition shrink-0"
                    title="বাক্যটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add Extra Sentence Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddSentence}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl transition shadow-2xs cursor-pointer font-serif"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة جملة أخرى (আরেকটি বাক্য যোগ করুন)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
