'use client';

import React, { useRef } from 'react';
import { InstitutionHeaderConfig, LayoutConfig } from 'proshno-shared';

interface EditableHeaderProps {
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
  activeSetName?: string;
  onUpdateHeader: (patch: Partial<InstitutionHeaderConfig>) => void;
}

export const EditableHeader: React.FC<EditableHeaderProps> = ({
  headerConfig,
  layoutConfig,
  activeSetName,
  onUpdateHeader,
}) => {
  const isMadrasah =
    headerConfig.headerPreset === 'ALIA' ||
    headerConfig.headerPreset === 'QAWMI' ||
    headerConfig.educationStream === 'ALIA' ||
    headerConfig.educationStream === 'QAWMI' ||
    Boolean(headerConfig.bismillahText);

  // Helper to save inline contentEditable changes
  const handleBlur = (field: keyof InstitutionHeaderConfig, e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText.trim();
    if (field === 'totalMarks') {
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      onUpdateHeader({ totalMarks: isNaN(num) ? 100 : num });
    } else {
      onUpdateHeader({ [field]: text } as any);
    }
  };

  const hasBengali = (str?: string) => Boolean(str && /[\u0980-\u09FF]/.test(str));

  const isArabicSubject =
    headerConfig.subject?.includes('আরবি') ||
    headerConfig.subject?.includes('العربية') ||
    headerConfig.subject?.includes('Arabic') ||
    layoutConfig.numberingFormat === 'ar';

  // 100% Arabic defaults when paper is Arabic to prevent Bengali text leakage
  const institutionDisplay = isArabicSubject && (!headerConfig.institutionName || hasBengali(headerConfig.institutionName))
    ? 'بهيربهيري عالم مدرسة - تاكورغاو'
    : (headerConfig.institutionName || 'প্রতিষ্ঠানের নাম লিখুন');

  const examTitleDisplay = isArabicSubject && (!headerConfig.examTitle || hasBengali(headerConfig.examTitle))
    ? 'الإمتحان التَّأهيلي - ٢٠٢٦'
    : (headerConfig.examTitle || 'অর্ধ-বার্ষিক পরীক্ষা - ২০২৬');

  const gradeDisplay = isArabicSubject && (!headerConfig.grade || hasBengali(headerConfig.grade))
    ? 'الصف العاشر من الداخل'
    : headerConfig.grade;

  const subjectDisplay = isArabicSubject && (!headerConfig.subject || hasBengali(headerConfig.subject))
    ? 'اللغة العربية الإتصالية'
    : (headerConfig.subject || 'বাংলা ১ম পত্র');

  const timeAllowedDisplay = isArabicSubject && (!headerConfig.timeAllowed || hasBengali(headerConfig.timeAllowed))
    ? 'ثلاث ساعات'
    : (headerConfig.timeAllowed || '২ ঘণ্টা ৩০ মিনিট');

  const totalMarksDisplay = isArabicSubject
    ? '١٠٠'
    : (headerConfig.totalMarks || 100);

  const instructionsDisplay = isArabicSubject && (!headerConfig.generalInstructions || headerConfig.generalInstructions.some(hasBengali))
    ? ['الملاحظة: إجابة كل سؤال لازمة باللغة العربية']
    : (headerConfig.generalInstructions || ['সকল প্রশ্নের মান সমান।', 'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক।']);

  // Header Size Presets & Typography Scale
  const headerSize = headerConfig.headerSize || (isArabicSubject ? 'compact' : 'standard');
  const selectedArabicFont = layoutConfig.arabicFont || 'Traditional Arabic';
  const arabicFontFamily = `'${selectedArabicFont}', 'Traditional Arabic', 'Noto Naskh Arabic', 'Lateef', serif`;

  const headerMetrics = {
    compact: {
      containerPaddingBottom: '6px',
      containerMarginBottom: '8px',
      institutionFontSize: '24px',
      institutionLineHeight: '1.25',
      examTitleFontSize: '17px',
      examTitleLineHeight: '1.3',
      gradeFontSize: '14.5px',
      gradeLineHeight: '1.3',
      metaRowFontSize: '13px',
      metaRowMarginTop: '5px',
      metaRowPaddingTop: '3px',
      instructionsFontSize: '11.5px',
    },
    standard: {
      containerPaddingBottom: '8px',
      containerMarginBottom: '12px',
      institutionFontSize: '28px',
      institutionLineHeight: '1.25',
      examTitleFontSize: '20px',
      examTitleLineHeight: '1.3',
      gradeFontSize: '16.5px',
      gradeLineHeight: '1.3',
      metaRowFontSize: '14.5px',
      metaRowMarginTop: '6px',
      metaRowPaddingTop: '4px',
      instructionsFontSize: '12.5px',
    },
    large: {
      containerPaddingBottom: '10px',
      containerMarginBottom: '16px',
      institutionFontSize: '33px',
      institutionLineHeight: '1.25',
      examTitleFontSize: '23px',
      examTitleLineHeight: '1.3',
      gradeFontSize: '18.5px',
      gradeLineHeight: '1.3',
      metaRowFontSize: '16px',
      metaRowMarginTop: '8px',
      metaRowPaddingTop: '5px',
      instructionsFontSize: '13.5px',
    },
  }[headerSize];

  return (
    <header
      className={`proshno-exam-header text-center select-text ${isArabicSubject ? 'font-ar' : ''}`}
      dir={isArabicSubject ? 'rtl' : 'ltr'}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        borderBottom: '2px solid #0f172a',
        paddingBottom: headerMetrics.containerPaddingBottom,
        marginBottom: headerMetrics.containerMarginBottom,
        fontFamily: isArabicSubject ? arabicFontFamily : undefined,
      }}
    >
      {/* 1. INSTITUTION NAME */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleBlur('institutionName', e)}
        style={{
          textAlign: 'center',
          fontWeight: 800,
          fontSize: headerMetrics.institutionFontSize,
          lineHeight: headerMetrics.institutionLineHeight,
          fontFamily: isArabicSubject ? arabicFontFamily : undefined,
        }}
        className="font-serif proshno-institution-name text-slate-900 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-2 transition-colors cursor-text"
        title="ক্লিক করে প্রতিষ্ঠানের নাম সরাসরি এডিট করুন"
      >
        {institutionDisplay}
      </div>

      {/* 3. EXAM TITLE */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleBlur('examTitle', e)}
        style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: headerMetrics.examTitleFontSize,
          lineHeight: headerMetrics.examTitleLineHeight,
          fontFamily: isArabicSubject ? arabicFontFamily : undefined,
          marginTop: '2px',
        }}
        className="font-serif proshno-exam-title text-slate-800 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-2 transition-colors cursor-text inline-block"
        title="ক্লিক করে পরীক্ষার নাম সরাসরি এডিট করুন"
      >
        {examTitleDisplay}
      </div>

      {/* 4. GRADE (If Arabic, centered board format) */}
      {isArabicSubject && gradeDisplay && (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('grade', e)}
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: headerMetrics.gradeFontSize,
            lineHeight: headerMetrics.gradeLineHeight,
            fontFamily: isArabicSubject ? arabicFontFamily : undefined,
            marginTop: '3px',
          }}
          className="font-serif proshno-grade text-slate-800 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-2 transition-colors cursor-text"
          title="ক্লিক করে শ্রেণি এডিট করুন"
        >
          {gradeDisplay}
        </div>
      )}

      {/* 5. SUBJECT & GRADE ROW (For Standard / Bengali Papers) */}
      {!isArabicSubject && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '5px',
            fontSize: headerMetrics.gradeFontSize,
            fontWeight: 600,
          }}
          className="font-serif proshno-subject-grade-row text-slate-800"
        >
          <span className="flex items-center gap-1">
            <span>বিষয়:</span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('subject', e)}
              className="font-bold outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text"
              title="ক্লিক করে বিষয় এডিট করুন"
            >
              {subjectDisplay}
            </span>
          </span>

          {headerConfig.subjectCode && (
            <span className="text-slate-600 font-mono text-xs">
              (বিষয় কোড: {headerConfig.subjectCode})
            </span>
          )}

          <span className="text-slate-400">|</span>

          <span className="flex items-center gap-1">
            <span>শ্রেণি:</span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('grade', e)}
              className="font-bold outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text"
              title="ক্লিক করে শ্রেণি এডিট করুন"
            >
              {headerConfig.grade || 'দাখিল ৯ম শ্রেণি'}
            </span>
          </span>
        </div>
      )}

      {/* 6. TIME, SUBJECT & MARKS META ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: 'none',
          paddingTop: headerMetrics.metaRowPaddingTop,
          marginTop: headerMetrics.metaRowMarginTop,
          fontSize: headerMetrics.metaRowFontSize,
          fontWeight: 700,
          width: '100%',
          fontFamily: isArabicSubject ? arabicFontFamily : undefined,
        }}
        className="flex items-center justify-between font-serif proshno-meta-row text-slate-900"
      >
        <div className="flex items-center gap-1">
          <span>{isArabicSubject ? 'الوقت :' : 'সময়:'}</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('timeAllowed', e)}
            className="outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text font-bold"
            title="ক্লিক করে সময় পরিবর্তন করুন"
          >
            {timeAllowedDisplay}
          </span>
        </div>

        {/* Center: Subject (for Arabic board paper) or Active Set */}
        {isArabicSubject ? (
          <div className="flex items-center gap-1">
            <span>الموضوع :</span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('subject', e)}
              style={{ fontWeight: 700 }}
              className="font-bold outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text"
              title="ক্লিক করে বিষয় পরিবর্তন করুন"
            >
              {subjectDisplay}
            </span>
          </div>
        ) : activeSetName ? (
          <div className="px-2.5 py-0.5 border border-slate-700 bg-slate-50 rounded text-xs font-bold tracking-wider">
            {activeSetName}
          </div>
        ) : null}

        <div className="flex items-center gap-1">
          <span>{isArabicSubject ? 'الدرجات الكاملة :' : 'পূর্ণমান:'}</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('totalMarks', e)}
            className="font-mono font-bold outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text"
            title="ক্লিক করে পূর্ণমান পরিবর্তন করুন"
          >
            {totalMarksDisplay}
          </span>
        </div>
      </div>

      {/* 7. GENERAL INSTRUCTIONS (الملاحظة) */}
      {instructionsDisplay && instructionsDisplay.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            width: '100%',
            marginTop: '4px',
            fontSize: headerMetrics.instructionsFontSize,
            lineHeight: '1.3',
            fontFamily: isArabicSubject ? arabicFontFamily : undefined,
          }}
          className="font-serif proshno-general-instructions text-slate-700"
        >
          {instructionsDisplay.map((ins, i) => (
            <span
              key={i}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const updated = [...instructionsDisplay];
                updated[i] = e.currentTarget.innerText.trim();
                onUpdateHeader({ generalInstructions: updated });
              }}
              className="outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-1 transition-colors cursor-text inline-block"
              title="ক্লিক করে নির্দেশনা এডিট করুন"
            >
              {ins}
            </span>
          ))}
        </div>
      )}
    </header>
  );
};
