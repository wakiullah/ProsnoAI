'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
  DEFAULT_Q6_APPLICATION_OPTION_1,
  DEFAULT_Q6_APPLICATION_OPTION_2,
} from './arabic2ndDefaults';

interface LetterWritingEditorProps {
  include: boolean;
  onToggleInclude: (val: boolean) => void;
  qNumber: string;
  onChangeNumber: (val: string) => void;
  marksFormula: string;
  onChangeMarksFormula: (val: string) => void;
  option1: string;
  onChangeOption1: (val: string) => void;
  option2: string;
  onChangeOption2: (val: string) => void;
  orText: string;
  onChangeOrText: (val: string) => void;
  onReset: () => void;
}

export const LetterWritingEditor: React.FC<LetterWritingEditorProps> = ({
  include,
  onToggleInclude,
  qNumber,
  onChangeNumber,
  marksFormula,
  onChangeMarksFormula,
  option1,
  onChangeOption1,
  option2,
  onChangeOption2,
  orText,
  onChangeOrText,
  onReset,
}) => {
  return (
    <div className="border border-purple-200 rounded-2xl p-4 transition-all bg-purple-50/30 hover:border-purple-300">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-purple-200/60">
        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={include}
            onChange={(e) => onToggleInclude(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="font-serif">৬ নং প্রশ্ন: عريضة أو رسالة (দরখাস্ত অথবা পত্র লিখন)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-sans font-bold border border-purple-200 text-purple-700">
            ১০ নম্বর
          </span>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-purple-700 flex items-center gap-1 font-semibold transition"
          title="ডিফল্ট দরখাস্ত ও পত্র ফিরিয়ে আনুন"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট</span>
        </button>
      </div>

      {include && (
        <div className="space-y-3">
          {/* Question Number & Marks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর
              </label>
              <input
                type="text"
                value={qNumber}
                onChange={(e) => onChangeNumber(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-purple-500 focus:outline-none"
                placeholder="٦-"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                বিকল্প বিভাজক (Separator)
              </label>
              <input
                type="text"
                value={orText}
                onChange={(e) => onChangeOrText(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-center focus:border-purple-500 focus:outline-none text-purple-800"
                placeholder="أو"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নম্বর বণ্টন (Marks)
              </label>
              <input
                type="text"
                value={marksFormula}
                onChange={(e) => onChangeMarksFormula(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-lg bg-white text-right focus:border-purple-500 focus:outline-none text-purple-900"
                placeholder="١٠ = ١ × ١٠"
              />
            </div>
          </div>

          {/* Option 1: Application */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              প্রথম বিষয়: عريضة (দরখাস্ত / আবেদনপত্র)
            </label>
            <textarea
              value={option1}
              onChange={(e) => onChangeOption1(e.target.value)}
              dir="rtl"
              rows={2}
              className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-purple-500 focus:outline-none"
              placeholder="اكتب عريضة باللغة العربية إلى مدير المدرسة..."
            />
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 font-serif font-bold text-xs">
              {orText || 'أو'}
            </span>
          </div>

          {/* Option 2: Letter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              দ্বিতীয় বিষয়: رسالة (পত্র / চিঠি)
            </label>
            <textarea
              value={option2}
              onChange={(e) => onChangeOption2(e.target.value)}
              dir="rtl"
              rows={2}
              className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-purple-500 focus:outline-none"
              placeholder="اكتب رسالة بالعربية إلى أخيك..."
            />
          </div>
        </div>
      )}
    </div>
  );
};
