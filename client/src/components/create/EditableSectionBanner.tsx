'use client';

import React from 'react';
import { ExamSection } from 'proshno-shared';
import { Trash2, Plus } from 'lucide-react';

interface EditableSectionBannerProps {
  section: ExamSection;
  onUpdate: (patch: Partial<ExamSection>) => void;
  onDelete: () => void;
  onAddQuestionToSection?: () => void;
  isMeasuring?: boolean;
}

export const EditableSectionBanner: React.FC<EditableSectionBannerProps> = ({
  section,
  onUpdate,
  onDelete,
  onAddQuestionToSection,
  isMeasuring = false,
}) => {
  // Display formula if counts exist
  const formula =
    section.requiredCount && section.marksPerQuestion
      ? `${section.marksPerQuestion} × ${section.requiredCount} = ${
          section.marksPerQuestion * section.requiredCount
        }`
      : section.displayMarksFormula || undefined;

  const isArabic =
    /[\u0600-\u06FF]/.test(section.name || '') ||
    /[\u0600-\u06FF]/.test(section.instructions || '');

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        padding: '3px 0',
        margin: '8px 0 2px 0',
        textAlign: 'center',
      }}
      className="group relative select-text transition"
    >
      {/* Floating Section Actions on Hover */}
      {!isMeasuring && (
        <div className={`absolute ${isArabic ? 'left-1' : 'right-1'} -top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 shadow-sm rounded-lg px-1.5 py-0.5 flex items-center gap-1 z-20 text-[10px] print:hidden`}>
          {onAddQuestionToSection && (
            <button
              onClick={onAddQuestionToSection}
              className="flex items-center gap-1 px-1.5 py-0.5 text-emerald-700 hover:bg-emerald-50 rounded font-bold"
              title="এই বিভাগে নতুন প্রশ্ন যুক্ত করুন"
            >
              <Plus className="w-3 h-3" />
              <span>+ প্রশ্ন</span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="বিভাগটি মুছে ফেলুন"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Section Title — Direct inline contentEditable (Clean bold, no background, no borders) */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate({ name: e.currentTarget.innerText.trim() || 'বিভাগ' })}
        style={{
          fontWeight: 700,
          textAlign: 'center',
        }}
        className="font-serif font-bold text-sm sm:text-base text-slate-900 tracking-wide outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text inline-block"
        title="ক্লিক করে বিভাগের নাম সরাসরি এডিট করুন"
      >
        [ {section.name} ]
      </div>

      {/* Sub-instruction & Formula row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          fontSize: '0.9em',
          fontWeight: 600,
          marginTop: '2px',
        }}
        className="flex items-baseline justify-between text-xs font-semibold text-slate-700 mt-0.5 px-2 font-serif"
      >
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            onUpdate({ instructions: e.currentTarget.innerText.trim() || undefined })
          }
          className="italic outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text text-start flex-1"
          title="ক্লিক করে নির্দেশনা এডিট করুন"
        >
          {section.instructions || 'নিচের প্রশ্নগুলোর সঠিক উত্তর দাও:'}
        </span>

        {formula && (
          <span className="font-mono font-bold not-italic shrink-0 ms-3 text-slate-900">
            ({formula})
          </span>
        )}
      </div>
    </div>
  );
};
