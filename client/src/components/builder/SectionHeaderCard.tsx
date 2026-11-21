'use client';

import React, { useState } from 'react';
import { ExamSection, formatMarksFormula } from 'proshno-shared';
import {
  Layers,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Calculator,
  Plus,
} from 'lucide-react';

interface SectionHeaderCardProps {
  section: ExamSection;
  totalSectionQuestions: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<ExamSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddQuestionToSection: () => void;
}

export const SectionHeaderCard: React.FC<SectionHeaderCardProps> = ({
  section,
  totalSectionQuestions,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddQuestionToSection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [instructions, setInstructions] = useState(section.instructions || '');
  const [requiredCount, setRequiredCount] = useState<number | ''>(
    section.requiredCount !== undefined ? section.requiredCount : ''
  );
  const [marksPerQuestion, setMarksPerQuestion] = useState<number | ''>(
    section.marksPerQuestion !== undefined ? section.marksPerQuestion : ''
  );
  const [customTotalMarks, setCustomTotalMarks] = useState<number | ''>(
    section.totalMarks !== undefined ? section.totalMarks : ''
  );

  const formulaPreview = formatMarksFormula(
    typeof requiredCount === 'number' ? requiredCount : undefined,
    typeof marksPerQuestion === 'number' ? marksPerQuestion : undefined,
    typeof customTotalMarks === 'number' ? customTotalMarks : undefined
  );

  const handleSave = () => {
    onUpdate({
      name: name.trim() || 'নতুন বিভাগ',
      instructions: instructions.trim() || undefined,
      requiredCount: typeof requiredCount === 'number' ? requiredCount : undefined,
      marksPerQuestion: typeof marksPerQuestion === 'number' ? marksPerQuestion : undefined,
      totalMarks: typeof customTotalMarks === 'number' ? customTotalMarks : undefined,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-md p-4 mb-3 border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Section Title & Details */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                {section.name}
              </h3>
              {formulaPreview && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {formulaPreview}
                </span>
              )}
            </div>
            {section.instructions && (
              <p className="text-xs text-slate-300 mt-0.5 italic">
                {section.instructions}
              </p>
            )}
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span>
                উপলব্ধ প্রশ্ন: <b className="text-slate-200">{totalSectionQuestions}</b> টি
              </span>
              {section.requiredCount && (
                <>
                  <span>•</span>
                  <span>
                    উত্তর দিতে হবে: <b className="text-emerald-300">{section.requiredCount}</b> টি
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onAddQuestionToSection}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            title="এই বিভাগে প্রশ্ন যুক্ত করুন"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">প্রশ্ন যোগ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            title="বিভাগ সম্পাদনা করুন"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition disabled:opacity-30 disabled:hover:bg-slate-800"
            title="উপরে নিন"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition disabled:opacity-30 disabled:hover:bg-slate-800"
            title="নিচে নিন"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 bg-slate-800 hover:bg-red-600/80 text-red-400 hover:text-white rounded-lg border border-slate-700 transition"
            title="বিভাগ মুছে ফেলুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Editor Drawer */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-3 text-xs bg-slate-950/40 p-3 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                বিভাগের নাম (Section Name):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                নির্দেশনা (Directive/Instruction):
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="যেমন: নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Choice rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                কতটি প্রশ্নের উত্তর দিতে হবে:
              </label>
              <input
                type="number"
                min="1"
                value={requiredCount}
                onChange={(e) =>
                  setRequiredCount(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="যেমন: ৩"
                className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                প্রতিটি প্রশ্নের মান (Marks/Q):
              </label>
              <input
                type="number"
                min="1"
                value={marksPerQuestion}
                onChange={(e) =>
                  setMarksPerQuestion(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="যেমন: ৫"
                className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                <span>সমীকরণ প্রিভিউ:</span>
                <Calculator className="w-3 h-3 text-emerald-400" />
              </label>
              <div className="p-1.5 bg-slate-950 border border-slate-700 rounded text-amber-300 font-mono font-bold text-xs h-[30px] flex items-center">
                {formulaPreview || '(সাধারণ যোগফল)'}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
