'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CqSubQuestion,
  ExamSection,
  McqOption,
  NumberingFormat,
  QuestionData,
  TahqeeqWordEntry,
  formatMarksBadge,
  formatQuestionNumber,
  formatSubQuestionPart,
  stripArabicHarakat,
  convertToArabicDigits,
} from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { QuestionSpacingHandle } from './QuestionSpacingHandle';
import {
  GripVertical,
  Trash2,
  Copy,
  Wand2,
  BookOpen,
} from 'lucide-react';

interface EditableQuestionItemProps {
  question: QuestionData;
  globalIndex: number;
  numberingFormat: NumberingFormat;
  sections?: ExamSection[];
  onUpdate: (updated: QuestionData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAssignSection?: (sectionId?: string) => void;
  onEditNasrulMadroos?: (question: QuestionData) => void;
  dragAttributes?: any;
  dragListeners?: any;
  isMeasuring?: boolean;
  lineHeight?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

const AR_SUB_LETTERS = ['الف', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

const getSubPartLabel = (rawPart: any, idx: number, isRtl: boolean) => {
  if (!isRtl) return rawPart || String(idx + 1);
  const str = String(rawPart || '').trim();
  if (!str || /^[\d\u09E6-\u09EF\u0660-\u0669\u06F0-\u06F9]+$/.test(str)) {
    return AR_SUB_LETTERS[idx] || str;
  }
  if (str === 'أ' || str === 'ا') {
    return 'الف';
  }
  return str;
};

function serializeEditableHtml(el: HTMLElement): string {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const elem = node as HTMLElement;
    const tag = elem.tagName.toLowerCase();
    if (tag === 'br') return '\n';
    const inner = Array.from(elem.childNodes).map(walk).join('');
    const isUnderline =
      tag === 'u' ||
      elem.style?.textDecoration?.includes('underline') ||
      elem.style?.textDecorationLine?.includes('underline');
    if (isUnderline && inner.trim()) {
      return `<u>${inner}</u>`;
    }
    if (tag === 'div' || tag === 'p') {
      return `${inner}\n`;
    }
    return inner;
  };

  return Array.from(el.childNodes)
    .map(walk)
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const EditableQuestionItem: React.FC<EditableQuestionItemProps> = ({
  question,
  globalIndex,
  numberingFormat,
  sections,
  onUpdate,
  onDelete,
  onDuplicate,
  onAssignSection,
  onEditNasrulMadroos,
  dragAttributes,
  dragListeners,
  isMeasuring = false,
  lineHeight,
  isSelected = false,
  onSelect,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [liveSpacingTop, setLiveSpacingTop] = useState<number | null>(null);
  const [liveSpacingBottom, setLiveSpacingBottom] = useState<number | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const lastTapTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isSelected) {
      setIsEditingText(false);
    }
  }, [isSelected]);

  const activateEditOnTarget = (rawTarget: EventTarget | null) => {
    const el =
      rawTarget instanceof HTMLElement
        ? (rawTarget.closest('[data-editable-field="true"]') as HTMLElement | null)
        : null;
    setIsEditingText(true);
    if (el) {
      requestAnimationFrame(() => {
        el.focus();
      });
    }
  };

  const hasArabic = /[\u0600-\u06FF]/.test(
    (question.stemOrPassage || '') +
      (question.options || []).map((o) => o.text).join(' ')
  );

  // Quick stem update on blur (preserving inline <u>...</u> underline tags)
  const handleStemBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const text = serializeEditableHtml(e.currentTarget);
    if (text !== question.stemOrPassage) {
      onUpdate({ ...question, stemOrPassage: text });
    }
  };

  // Quick question number update
  const handleNumberBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.innerText.trim();
    if (text !== (question.customNumber || '')) {
      onUpdate({ ...question, customNumber: text });
    }
  };

  // Quick marks update
  const handleMarksBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.innerText.trim();
    if (text !== (question.customMarksText || '')) {
      onUpdate({ ...question, customMarksText: text });
    }
  };

  // Quick MCQ option text update
  const handleOptionBlur = (idx: number, e: React.FocusEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.innerText.trim();
    const updatedOptions = [...(question.options || [])];
    if (updatedOptions[idx] && updatedOptions[idx].text !== text) {
      updatedOptions[idx] = { ...updatedOptions[idx], text };
      onUpdate({ ...question, options: updatedOptions });
    }
  };

  // Quick MCQ correct answer toggle
  const handleSelectCorrectOption = (idx: number) => {
    const updatedOptions = (question.options || []).map((opt, i) => ({
      ...opt,
      isCorrect: i === idx,
    }));
    onUpdate({ ...question, options: updatedOptions });
  };

  // Strip Harakat
  const handleStripHarakat = () => {
    const strippedStem = stripArabicHarakat(question.stemOrPassage || '');
    const strippedOptions = (question.options || []).map((o) => ({
      ...o,
      text: stripArabicHarakat(o.text),
    }));
    onUpdate({
      ...question,
      stemOrPassage: strippedStem,
      options: strippedOptions,
    });
  };

  // CQ sub-question blur (preserving inline <u>...</u> underline tags)
  const handleCqPartBlur = (sIdx: number, e: React.FocusEvent<HTMLSpanElement>) => {
    const text = serializeEditableHtml(e.currentTarget);
    const updated = [...(question.subQuestions || [])];
    if (updated[sIdx] && updated[sIdx].questionText !== text) {
      updated[sIdx] = { ...updated[sIdx], questionText: text };
      onUpdate({ ...question, subQuestions: updated });
    }
  };

  // Tahqeeq cell blur
  const handleTahqeeqCellBlur = (
    rIdx: number,
    col: keyof TahqeeqWordEntry,
    e: React.FocusEvent<HTMLTableCellElement>
  ) => {
    const text = e.currentTarget.innerText.trim();
    const updated = [...(question.tahqeeqWords || [])];
    if (updated[rIdx]) {
      updated[rIdx] = { ...updated[rIdx], [col]: text };
      onUpdate({ ...question, tahqeeqWords: updated });
    }
  };

  const isRTL = numberingFormat === 'ar' || hasArabic;
  const isUnnumbered =
    question.typology === 'PASSAGE_ONLY' ||
    ((question.typology === 'GROUP_TITLE' || (question.typology as string) === 'SECTION_TITLE') && (!question.customNumber || question.customNumber.trim() === ''));

  const defaultNumber = isUnnumbered ? '' : formatQuestionNumber(globalIndex, numberingFormat);
  const rawQNumberDisplay = question.customNumber !== undefined 
    ? question.customNumber 
    : defaultNumber;
  const qNumberDisplay = isRTL && rawQNumberDisplay
    ? convertToArabicDigits(rawQNumberDisplay)
    : rawQNumberDisplay;

  // Sub-items belonging to a grouped choice question (such as Q4 choice items)
  // must not show individual [4] marks badge when the parent already has the total marks formula
  const isGroupSubItem = Boolean(
    question.groupId &&
      (question.groupRole?.startsWith('ghayr_') ||
       question.groupRole?.startsWith('ikhtibar_item') ||
       ['verb_shift', 'antonyms', 'tahqeeq', 'rearrange', 'number_swap'].includes(question.groupRole || '')) &&
      question.groupRole !== 'ghayr_q3' &&
      question.groupRole !== 'ghayr_q4_title' &&
      question.groupRole !== 'ikhtibar_q3_title'
  );

  const defaultMarksDisplay =
    isGroupSubItem ||
    question.typology === 'CQ' ||
    (!isRTL && (question.typology === 'SIMPLE_MCQ' || question.typology === 'MULTIPLE_COMPLETION_MCQ'))
      ? ''
      : (numberingFormat === 'ar' ? formatMarksBadge(question.marks, 'ar') : `[${question.marks}]`);
  const rawMarksDisplay = question.customMarksText !== undefined
    ? question.customMarksText
    : (question.marks ? defaultMarksDisplay : '');
  const marksDisplay = isRTL && rawMarksDisplay
    ? convertToArabicDigits(rawMarksDisplay)
    : rawMarksDisplay;

  // Helper to parse PARAGRAPH_WRITING stem (Arabic 1st Paper Q11 format)
  const parsedParagraph = useMemo(() => {
    if (question.typology !== 'PARAGRAPH_WRITING') return null;
    const raw = question.stemOrPassage || '';
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

    // Find index of (أو) or أو
    const orIdx = lines.findIndex(
      (l) => l === '(أو)' || l === 'أو' || l.startsWith('(أو)') || l.startsWith('أو-') || l.startsWith('(أو')
    );

    const t1Block = orIdx !== -1 ? lines.slice(0, orIdx) : lines;
    const t2Block = orIdx !== -1 ? lines.slice(orIdx + 1) : [];

    const t1Topic = t1Block[0] || 'اكتب فقرة بالعربية عن "الاسلام" على أساس الأجوبة من الأسئلة التالية :';
    const t1Questions = t1Block.slice(1);

    const hasOrOption = orIdx !== -1 && t2Block.length > 0;
    const orText = orIdx !== -1 ? lines[orIdx] : '(أو)';
    const t2Topic = t2Block[0] || '';
    const t2Questions = t2Block.slice(1);

    return {
      t1Topic,
      t1Questions,
      hasOrOption,
      orText,
      t2Topic,
      t2Questions,
    };
  }, [question.typology, question.stemOrPassage]);

  const handleParagraphPartBlur = (
    field: 't1Topic' | 'orText' | 't2Topic',
    e: React.FocusEvent<HTMLElement>
  ) => {
    if (!parsedParagraph) return;
    const val = e.currentTarget.innerText.trim();
    const updated = { ...parsedParagraph, [field]: val };
    const parts = [
      updated.t1Topic,
      ...updated.t1Questions,
      ...(updated.hasOrOption && updated.t2Topic
        ? [updated.orText || '(أو)', updated.t2Topic, ...updated.t2Questions]
        : []),
    ];
    onUpdate({ ...question, stemOrPassage: parts.join('\n') });
  };

  const handleParagraphQuestionBlur = (
    group: 't1' | 't2',
    idx: number,
    e: React.FocusEvent<HTMLElement>
  ) => {
    if (!parsedParagraph) return;
    const val = e.currentTarget.innerText.trim();
    const updated = { ...parsedParagraph };
    if (group === 't1') {
      const qList = [...updated.t1Questions];
      qList[idx] = val;
      updated.t1Questions = qList;
    } else {
      const qList = [...updated.t2Questions];
      qList[idx] = val;
      updated.t2Questions = qList;
    }
    const parts = [
      updated.t1Topic,
      ...updated.t1Questions,
      ...(updated.hasOrOption && updated.t2Topic
        ? [updated.orText || '(أو)', updated.t2Topic, ...updated.t2Questions]
        : []),
    ];
    onUpdate({ ...question, stemOrPassage: parts.join('\n') });
  };

  // Helper to parse multi-line stem into bold title/instruction + normal-font body
  // (e.g. Arabic 2nd Paper Q3 items: word lists, cloze passages, tashkeel texts)
  const parsedMultiLine = useMemo(() => {
    if (
      question.typology === 'GROUP_TITLE' ||
      question.typology === 'SECTION_TITLE' ||
      question.typology === 'PARAGRAPH_WRITING'
    ) {
      return null;
    }
    const raw = question.stemOrPassage || '';
    if (!raw.includes('\n')) return null;

    const firstBreakIdx = raw.indexOf('\n');
    const titleLine = raw.slice(0, firstBreakIdx).trim();
    const bodyText = raw.slice(firstBreakIdx + 1).trim();

    if (!titleLine) return null;

    return {
      titleLine,
      bodyText,
    };
  }, [question.typology, question.stemOrPassage]);

  const handleMultiLineTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!parsedMultiLine) return;
    const newTitle = serializeEditableHtml(e.currentTarget);
    if (newTitle !== parsedMultiLine.titleLine) {
      const full = `${newTitle}\n${parsedMultiLine.bodyText}`;
      onUpdate({ ...question, stemOrPassage: full });
    }
  };

  const handleMultiLineBodyBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!parsedMultiLine) return;
    const newBody = serializeEditableHtml(e.currentTarget);
    if (newBody !== parsedMultiLine.bodyText) {
      const full = `${parsedMultiLine.titleLine}\n${newBody}`;
      onUpdate({ ...question, stemOrPassage: full });
    }
  };

  const renderWordCluesTable = () => {
    if (!question.wordClues || question.wordClues.length === 0) return null;
    return (
      <div className="my-2 flex items-center justify-center">
        <table
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            borderCollapse: 'collapse',
            border: '1.5px solid #1e293b',
            backgroundColor: '#f8fafc',
            margin: '0 auto',
          }}
          className="proshno-word-clues-table border-collapse border border-slate-800 bg-slate-50 text-[0.92em] font-serif font-bold text-slate-900 shadow-2xs rounded-xs overflow-hidden"
        >
          <tbody>
            <tr>
              {question.wordClues.map((clue, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    border: '1px solid #334155',
                    padding: '3px 14px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                  className="border border-slate-700 px-3.5 py-0.5 text-center whitespace-nowrap"
                >
                  <span
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updated = [...(question.wordClues || [])];
                      updated[cIdx] = e.currentTarget.innerText.trim();
                      onUpdate({ ...question, wordClues: updated });
                    }}
                    className="outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 px-1 rounded transition-colors cursor-text inline-block"
                    title="ক্লিক করে বক্সের শব্দ পরিবর্তন করুন"
                  >
                    {clue}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const correctOption = (question.options || []).find((o) => o.isCorrect);
  const isBanglaMcq =
    !isRTL &&
    (question.typology === 'SIMPLE_MCQ' || question.typology === 'MULTIPLE_COMPLETION_MCQ');
  const isProseStimulus =
    question.typology === 'CQ' ||
    question.typology === 'PASSAGE_GROUP' ||
    isBanglaMcq;
  const isParagraphStem =
    isProseStimulus ||
    question.typology === 'PARAGRAPH_WRITING' ||
    (question.stemOrPassage?.length || 0) > 180;

  // Proportional dynamic spacing based on effective line-height:
  // When line-height is tight (1.15-1.2): margins shrink proportionally
  // When line-height is spacious (1.6-1.8): margins expand proportionally
  const lh = lineHeight ?? 1.5;
  const titleMarginTop = Math.max(2, Math.round((lh - 1) * 14 + 2));
  const titleMarginBottom = Math.max(1, Math.round((lh - 1) * 5 + 1));
  const headerMarginTop = Math.max(1, Math.round((lh - 1) * 6 + 1));
  const headerMarginBottom = Math.max(1, Math.round((lh - 1) * 3 + 1));

  // Custom micro-spacing adjustment from user (px nudges: top & bottom)
  const customSpacingTop = liveSpacingTop ?? (question.spacingTop ?? 0);
  const customSpacingBottom = liveSpacingBottom ?? (question.spacingBottom ?? 0);

  return (
    <div
      style={{
        breakInside: 'avoid',
        paddingTop: `${Math.max(0, customSpacingTop)}px`,
        paddingBottom: `${Math.max(0, customSpacingBottom)}px`,
        marginTop: customSpacingTop < 0 ? `${customSpacingTop}px` : undefined,
        marginBottom: customSpacingBottom < 0 ? `${customSpacingBottom}px` : undefined,
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (isMeasuring) return;
        e.stopPropagation();

        const now = Date.now();
        const isFastSecondTap = now - lastTapTimeRef.current < 340;
        lastTapTimeRef.current = now;

        if (!isSelected) {
          onSelect?.();
          if (isFastSecondTap) {
            activateEditOnTarget(e.target);
          }
        } else if (!isEditingText) {
          // 2nd click while already selected -> enter text edit mode on the clicked field
          activateEditOnTarget(e.target);
        }
      }}
      onDoubleClick={(e) => {
        if (isMeasuring) return;
        e.stopPropagation();
        if (!isSelected) {
          onSelect?.();
        }
        activateEditOnTarget(e.target);
      }}
      className={`exam-question-item group relative pt-1 pb-1.5 mt-2 mb-1 transition-all select-text hover:bg-slate-50/30 rounded-sm ${
        isRTL ? 'text-right font-ar' : 'text-left'
      } ${
        isSelected
          ? isEditingText
            ? 'ring-2 ring-teal-600 bg-amber-50/20'
            : 'ring-2 ring-emerald-500/85 bg-emerald-50/25'
          : ''
      }`}
    >
      {/* Top Drag-to-Resize Spacing Handle (Only active when question is selected) */}
      {!isMeasuring && isSelected && (
        <QuestionSpacingHandle
          edge="top"
          value={question.spacingTop ?? 0}
          onLiveChange={setLiveSpacingTop}
          onCommit={(val) => onUpdate({ ...question, spacingTop: val })}
        />
      )}

      {/* ───────────────── SLEEK HOVER TOOLBAR (Completely ABOVE the question, Never covering text) ───────────────── */}
      {!isMeasuring && (
        <div className={`absolute ${isRTL ? 'left-1' : 'right-1'} -top-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto bg-white border border-slate-300 shadow-md rounded-lg px-2 py-0.5 flex items-center gap-1.5 z-30 text-[11px] font-sans print:hidden`}>
          {/* Drag Handle */}
          <div
            {...dragAttributes}
            {...dragListeners}
            className="p-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-800"
            title="ড্র্যাগ করে প্রশ্নটি অন্য স্থানে নিন"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Quick Correct Answer Picker for MCQ */}
          {question.options && question.options.length > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 rounded text-emerald-900 font-bold">
              <span className="text-[10px] text-emerald-600 font-normal">সঠিক:</span>
              {question.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelectCorrectOption(oIdx)}
                  className={`w-4 h-4 rounded text-[10px] flex items-center justify-center transition ${
                    opt.isCorrect
                      ? 'bg-emerald-600 text-white font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:bg-emerald-100'
                  }`}
                  title={`অপশন (${opt.label}) সঠিক উত্তর নির্বাচন করুন`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Direct Smart Modal Editor shortcut on Passage or Section Groups */}
          {(question.typology === 'PASSAGE_ONLY' || Boolean(question.groupId)) &&
            onEditNasrulMadroos && (
              <button
                onClick={() => onEditNasrulMadroos(question)}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px] transition"
                title="এই সেকশনের প্রশ্নাবলি একসাথে মডালে এডিট করুন"
              >
                <BookOpen className="w-3 h-3 text-emerald-700" />
                <span>মডালে এডিট</span>
              </button>
            )}

          {/* Harakat Cleaner */}
          {hasArabic && (
            <button
              onClick={handleStripHarakat}
              className="p-1 hover:bg-amber-50 text-amber-700 rounded transition"
              title="আরবি হরকত মুছে শুধু মূল হরফ রাখুন"
            >
              <Wand2 className="w-3 h-3" />
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={onDuplicate}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition"
            title="প্রশ্নটি ডুপ্লিকেট করুন"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
            title="প্রশ্নটি মুছে ফেলুন"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* Section Assignment */}
          {sections && sections.length > 0 && onAssignSection && (
            <select
              value={question.sectionId || ''}
              onChange={(e) => onAssignSection(e.target.value || undefined)}
              className="text-[10px] py-0.5 px-1 border border-slate-200 rounded bg-slate-50 font-medium text-slate-700 cursor-pointer max-w-[76px] truncate"
              title="বিভাগ নির্ধারণ করুন"
            >
              <option value="">বিভাগহীন</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ───────────────── SPACER ITEM (Clean resizable gap) ───────────────── */}
      {question.typology === 'SPACER' ? (
        <div
          style={{
            height: `${Math.max(8, customSpacingTop + customSpacingBottom + 20)}px`,
          }}
          className="w-full flex items-center justify-center border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 rounded transition group/sp select-none print:border-none print:bg-transparent"
        >
          <span className="text-[10px] text-slate-400 font-mono group-hover/sp:text-slate-600 print:hidden">
            --- ফাঁকা স্থান (Spacer: {Math.max(8, customSpacingTop + customSpacingBottom + 20)}px) ---
          </span>
        </div>
      ) : question.typology === 'GROUP_TITLE' || (question.typology as string) === 'SECTION_TITLE' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '6px',
            padding: '1px 0',
            marginTop: `${titleMarginTop}px`,
            marginBottom: `${titleMarginBottom}px`,
            fontWeight: 700,
          }}
          className="q-header q-heading-bold flex items-start justify-between gap-1.5 py-0.5 font-serif font-bold text-slate-900"
        >
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', flex: 1, minWidth: 0, justifyContent: !qNumberDisplay ? 'center' : 'flex-start' }}
            className={`flex items-start gap-1 flex-1 min-w-0 ${!qNumberDisplay ? 'justify-center text-center' : ''}`}
          >
            {qNumberDisplay ? (
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleNumberBlur}
                style={{ fontWeight: 700, flexShrink: 0 }}
                className="q-number font-bold text-slate-900 shrink-0 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-0.5 cursor-text"
                title="ক্লিক করে প্রশ্ন নম্বর (যেমন: ২. বা ٢.) এডিট করুন"
              >
                {qNumberDisplay}
              </span>
            ) : null}
            <span
              contentEditable={isEditingText}
                    data-editable-field="true"
              suppressContentEditableWarning
              onBlur={handleStemBlur}
              style={{ fontWeight: 700, textAlign: !qNumberDisplay ? 'center' : (isRTL ? 'right' : 'left'), flex: 1 }}
              className={`q-stem ${!qNumberDisplay ? 'text-center font-bold' : 'flex-1 font-bold'} outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text`}
              title="ক্লিক করে শিরোনাম বা নির্দেশনা সরাসরি এডিট করুন"
            >
              <MultiScriptText text={question.stemOrPassage || (isRTL ? 'القسم الأول : النص المدروس' : 'বিভাগ শিরোনাম')} />
            </span>
          </div>
          {marksDisplay && (
            <span
              contentEditable={isEditingText}
                    data-editable-field="true"
              suppressContentEditableWarning
              onBlur={handleMarksBlur}
              style={{ fontWeight: 700, fontFamily: 'monospace', flexShrink: 0, whiteSpace: 'nowrap', marginInlineStart: '6px' }}
              className="q-marks font-mono text-[0.9em] font-bold text-slate-800 shrink-0 ms-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-0.5 cursor-text whitespace-nowrap"
              title="ক্লিক করে মান বণ্টন সূত্র (যেমন: ৪×৪= ১৬ বা الدرجات - ৩০) এডিট করুন"
            >
              {marksDisplay}
            </span>
          )}
        </div>
      ) : question.typology === 'PASSAGE_ONLY' ? (
        <div className="my-1">
          {/* Passage Direction / Heading (Unnumbered Stimulus) */}
          <div
            style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px', textAlign: isRTL ? 'right' : 'left' }}
            className="q-heading-bold font-serif font-bold text-[0.98em] text-slate-900 mb-1 flex items-start gap-1"
          >
            {qNumberDisplay ? (
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleNumberBlur}
                style={{ fontWeight: 700 }}
                className="q-number outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-0.5 cursor-text font-bold"
              >
                {qNumberDisplay}
              </span>
            ) : null}
            <span
              contentEditable={isEditingText}
                    data-editable-field="true"
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.innerText.trim();
                onUpdate({ ...question, topic: text });
              }}
              style={{ fontWeight: 700, flex: 1, textAlign: isRTL ? 'right' : 'left' }}
              className="q-stem outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text flex-1 font-bold"
              title="ক্লিক করে অনুচ্ছেদের শিরোনাম বা নির্দেশনা এডিট করুন"
            >
              <MultiScriptText
                text={
                  question.topic ||
                  'اقرأ النص التالي ثم أجب عن الأسئلة الملحقة به :'
                }
              />
            </span>
          </div>

          {/* Passage Reading Paragraph (Clean normal text paragraph, no box/background) */}
          <div
            contentEditable={isEditingText}
                    data-editable-field="true"
            suppressContentEditableWarning
            onBlur={handleStemBlur}
            style={{
              padding: '2px 0',
              backgroundColor: 'transparent',
              border: 'none',
              lineHeight: 'inherit',
              whiteSpace: 'pre-line',
              textAlign: 'justify',
            }}
            className="passage-box py-0.5 px-0 bg-transparent border-0 text-[0.96em] font-serif text-slate-900 outline-none hover:bg-amber-50/40 focus:bg-amber-100/30 transition cursor-text whitespace-pre-line text-justify"
            title="ক্লিক করে নসসুল মাদরুসের এবারত সরাসরি এডিট করুন"
          >
            <MultiScriptText text={question.stemOrPassage || 'نص القراءة...'} />
          </div>
        </div>
      ) : question.typology === 'PARAGRAPH_WRITING' && parsedParagraph ? (
        /* ───────────────── PARAGRAPH_WRITING (Q11: Topic + Marks on top, Questions Normal font full width) ───────────────── */
        <div className="paragraph-writing-item my-1">
          {/* Main Topic Header: Q Number + Topic Prompt + Marks beside it */}
          <div
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}
            className="q-header flex items-start justify-between gap-1.5 font-serif text-[1em] text-slate-900"
          >
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', flex: 1, minWidth: 0 }}
              className="flex items-start gap-1 flex-1 min-w-0"
            >
              {qNumberDisplay ? (
                <span
                  contentEditable={isEditingText}
                    data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={handleNumberBlur}
                  style={{ fontWeight: 700, flexShrink: 0 }}
                  className="q-number font-bold text-slate-900 shrink-0 select-text outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-0.5 cursor-text"
                  title="ক্লিক করে প্রশ্ন নম্বর (যেমন: ১১. বা ١١.) এডিট করুন"
                >
                  {qNumberDisplay}
                </span>
              ) : null}

              {/* Topic 1 Title — Bold */}
              <div
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={(e) => handleParagraphPartBlur('t1Topic', e)}
                style={{ fontWeight: 700, flex: 1, textAlign: isRTL ? 'right' : 'left' }}
                className="q-stem font-bold flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text"
                title="ক্লিক করে মূল অনুচ্ছেদ নির্দেশনা এডিট করুন"
              >
                <MultiScriptText text={parsedParagraph.t1Topic} />
              </div>
            </div>

            {/* Marks Badge (positioned directly beside the topic prompt) */}
            {marksDisplay ? (
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleMarksBlur}
                style={{ fontWeight: 700, fontFamily: 'monospace', flexShrink: 0, whiteSpace: 'nowrap', marginInlineStart: '6px' }}
                className="q-marks shrink-0 text-[0.9em] font-bold text-slate-800 font-mono outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-0.5 cursor-text select-text whitespace-nowrap"
                title="ক্লিক করে প্রশ্নের মান বণ্টন সূত্র এডিট করুন"
              >
                {marksDisplay}
              </span>
            ) : null}
          </div>

          {/* Topic 1 Sub-Questions (NOT BOLD! Full width of column!) */}
          {parsedParagraph.t1Questions.length > 0 && (
            <div className={`pt-1 space-y-0.5 text-[0.94em] font-serif font-normal text-slate-800 ${isRTL ? 'pr-2' : 'pl-4'}`}>
              {parsedParagraph.t1Questions.map((qText, qIdx) => (
                <div
                  key={qIdx}
                  contentEditable={isEditingText}
                    data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={(e) => handleParagraphQuestionBlur('t1', qIdx, e)}
                  style={{ fontWeight: 400, textAlign: isRTL ? 'right' : 'left', width: '100%', lineHeight: 'inherit' }}
                  className="font-normal text-slate-800 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text"
                  title="ক্লিক করে প্রশ্ন এডিট করুন"
                >
                  <MultiScriptText text={qText} />
                </div>
              ))}
            </div>
          )}

          {/* Alternative (أو) Divider & Topic 2 */}
          {parsedParagraph.hasOrOption && (
            <div className="mt-2 space-y-1">
              <div
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={(e) => handleParagraphPartBlur('orText', e)}
                style={{ textAlign: 'center', fontWeight: 700, margin: '6px 0 3px 0' }}
                className="text-center font-bold text-slate-900 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                title="ক্লিক করে অথবা (أو) এডিট করুন"
              >
                {parsedParagraph.orText || '(أو)'}
              </div>

              {/* Topic 2 Title — Bold, Full width! */}
              <div
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={(e) => handleParagraphPartBlur('t2Topic', e)}
                style={{ fontWeight: 700, textAlign: isRTL ? 'right' : 'left', width: '100%' }}
                className="font-bold text-slate-900 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text"
                title="ক্লিক করে বিকল্প অনুচ্ছেদ নির্দেশনা এডিট করুন"
              >
                <MultiScriptText text={parsedParagraph.t2Topic} />
              </div>

              {/* Topic 2 Sub-Questions (NOT BOLD! Full width of column!) */}
              {parsedParagraph.t2Questions.length > 0 && (
                <div className={`pt-1 space-y-0.5 text-[0.94em] font-serif font-normal text-slate-800 ${isRTL ? 'pr-2' : 'pl-4'}`}>
                  {parsedParagraph.t2Questions.map((qText, qIdx) => (
                    <div
                      key={qIdx}
                      contentEditable={isEditingText}
                    data-editable-field="true"
                      suppressContentEditableWarning
                      onBlur={(e) => handleParagraphQuestionBlur('t2', qIdx, e)}
                      style={{ fontWeight: 400, textAlign: isRTL ? 'right' : 'left', width: '100%', lineHeight: 'inherit' }}
                      className="font-normal text-slate-800 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 cursor-text"
                      title="ক্লিক করে প্রশ্ন এডিট করুন"
                    >
                      <MultiScriptText text={qText} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : question.groupRole === 'bangla2nd_hsc_pair' &&
        question.subQuestions &&
        question.subQuestions.length > 0 ? (
        /* ───────────────── BANGLA 2ND PAPER (HSC / ALIM Q1–Q11: १। (ক) ... ০৫ / অথবা, / (খ) ...) ───────────────── */
        <div className="my-1 font-serif text-[1em] text-slate-900 space-y-1">
          {(() => {
            const subKa = question.subQuestions[0];
            const subKha = question.subQuestions[1];
            const ROMANS = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)'];

            const renderSubBody = (sub: typeof subKa, sIdx: number) => {
              if (!sub || !sub.questionText?.trim()) return null;
              if (sub.bloomLevel === 'application') {
                const lines = sub.questionText
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean);
                if (lines.length === 0) return null;
                return (
                  <div className="pl-7 space-y-0.5 pt-0.5 text-[0.96em]">
                    {lines.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-baseline gap-2">
                        <span className="italic font-serif min-w-[28px] text-right shrink-0">
                          {ROMANS[lIdx] || `(${lIdx + 1})`}
                        </span>
                        <span className="flex-1">
                          <MultiScriptText text={line} />
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div
                  contentEditable={isEditingText}
                  data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={(e) => handleCqPartBlur(sIdx, e)}
                  className="pl-7 pt-0.5 text-[0.96em] whitespace-pre-line text-justify outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                >
                  <MultiScriptText text={sub.questionText} />
                </div>
              );
            };

            return (
              <>
                {/* Top Row: ১। (ক) [Prompt] ... [Marks ০৫/১০] */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    {qNumberDisplay ? (
                      <span
                        contentEditable={isEditingText}
                        data-editable-field="true"
                        suppressContentEditableWarning
                        onBlur={handleNumberBlur}
                        className="q-number font-normal text-slate-900 shrink-0 min-w-[22px] outline-none"
                      >
                        {qNumberDisplay}
                      </span>
                    ) : null}
                    <span className="shrink-0">(ক)</span>
                    <span
                      contentEditable={isEditingText}
                      data-editable-field="true"
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const text = e.currentTarget.innerText.trim();
                        const updated = [...(question.subQuestions || [])];
                        if (updated[0]) {
                          updated[0] = { ...updated[0], bloomTitle: text };
                          onUpdate({ ...question, subQuestions: updated });
                        }
                      }}
                      className="flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                    >
                      <MultiScriptText
                        text={subKa?.bloomTitle || 'প্রশ্নের অংশ (ক) লিখুন...'}
                      />
                    </span>
                  </div>
                  {marksDisplay ? (
                    <span
                      contentEditable={isEditingText}
                      data-editable-field="true"
                      suppressContentEditableWarning
                      onBlur={handleMarksBlur}
                      className="q-marks shrink-0 text-[0.95em] text-slate-900 ps-2 outline-none"
                    >
                      {marksDisplay}
                    </span>
                  ) : null}
                </div>

                {renderSubBody(subKa, 0)}

                {subKha && (
                  <>
                    <div className="text-center py-0.5 text-[0.96em] text-slate-900">
                      অথবা,
                    </div>
                    <div className="flex items-start gap-1.5 pl-6">
                      <span className="shrink-0">(খ)</span>
                      <span
                        contentEditable={isEditingText}
                        data-editable-field="true"
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const text = e.currentTarget.innerText.trim();
                          const updated = [...(question.subQuestions || [])];
                          if (updated[1]) {
                            updated[1] = { ...updated[1], bloomTitle: text };
                            onUpdate({ ...question, subQuestions: updated });
                          }
                        }}
                        className="flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                      >
                        <MultiScriptText
                          text={subKha.bloomTitle || 'প্রশ্নের অংশ (খ) লিখুন...'}
                        />
                      </span>
                    </div>
                    {renderSubBody(subKha, 1)}
                  </>
                )}
              </>
            );
          })()}
        </div>
      ) : question.groupRole === 'bangla2nd_ssc_sarangsho' &&
        question.subQuestions &&
        question.subQuestions.length > 0 ? (
        /* ───────────────── BANGLA 2ND PAPER (CLASS 6–10 Q3: ৩। (ক) সারাংশ লেখ : ১০ ... অথবা, (খ) সারমর্ম লেখ :) ───────────────── */
        <div className="my-1 font-serif text-[1em] text-slate-900 space-y-1">
          {(() => {
            const subKa = question.subQuestions[0];
            const subKha = question.subQuestions[1];
            return (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    {qNumberDisplay ? (
                      <span
                        contentEditable={isEditingText}
                        data-editable-field="true"
                        suppressContentEditableWarning
                        onBlur={handleNumberBlur}
                        className="q-number shrink-0 min-w-[20px] outline-none"
                      >
                        {qNumberDisplay}
                      </span>
                    ) : null}
                    <span className="shrink-0">(ক)</span>
                    <span className="flex-1">
                      <MultiScriptText text={subKa?.bloomTitle || 'সারাংশ লেখ :'} />
                    </span>
                  </div>
                  {marksDisplay ? (
                    <span
                      contentEditable={isEditingText}
                      data-editable-field="true"
                      suppressContentEditableWarning
                      onBlur={handleMarksBlur}
                      className="q-marks shrink-0 text-[0.95em] text-slate-900 ps-2 outline-none"
                    >
                      {marksDisplay}
                    </span>
                  ) : null}
                </div>

                {subKa?.questionText && (
                  <div
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => handleCqPartBlur(0, e)}
                    className="pl-7 text-[0.96em] whitespace-pre-line text-justify outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                  >
                    <MultiScriptText text={subKa.questionText} />
                  </div>
                )}

                {subKha && (
                  <>
                    <div className="flex items-start gap-1.5 pt-1">
                      <span className="shrink-0">অথবা, (খ)</span>
                      <span className="flex-1">
                        <MultiScriptText text={subKha.bloomTitle || 'সারমর্ম লেখ :'} />
                      </span>
                    </div>
                    {subKha.questionText && (
                      <div
                        contentEditable={isEditingText}
                        data-editable-field="true"
                        suppressContentEditableWarning
                        onBlur={(e) => handleCqPartBlur(1, e)}
                        className="pl-7 text-[0.96em] whitespace-pre-line outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                      >
                        <MultiScriptText text={subKha.questionText} />
                      </div>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      ) : (question.groupRole === 'bangla2nd_ssc_athaba' ||
          question.groupRole === 'bangla2nd_ssc_choices' ||
          question.groupRole === 'bangla2nd_hsc_essay') &&
        question.subQuestions &&
        question.subQuestions.length > 0 ? (
        /* ───────────────── BANGLA 2ND PAPER (CHOICE QUESTIONS Q1, Q2, Q4, Q5, Q6 & HSC Q12) ───────────────── */
        <div className="my-1 font-serif text-[1em] text-slate-900 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              {qNumberDisplay ? (
                <span
                  contentEditable={isEditingText}
                  data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={handleNumberBlur}
                  className="q-number shrink-0 min-w-[20px] outline-none"
                >
                  {qNumberDisplay}
                </span>
              ) : null}
              <div
                contentEditable={isEditingText}
                data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleStemBlur}
                className="flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
              >
                <MultiScriptText text={question.stemOrPassage} />
              </div>
            </div>
            {marksDisplay ? (
              <span
                contentEditable={isEditingText}
                data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleMarksBlur}
                className="q-marks shrink-0 text-[0.95em] text-slate-900 ps-2 outline-none"
              >
                {marksDisplay}
              </span>
            ) : null}
          </div>

          <div className="space-y-1 pt-0.5 text-[0.96em]">
            {question.subQuestions.map((sub, sIdx) => {
              const labelText = sub.bloomTitle || `(${sub.part})`;
              const hasAthaba = labelText.startsWith('অথবা');
              return (
                <div
                  key={sIdx}
                  className={`flex items-start gap-1.5 ${hasAthaba ? 'pl-0' : 'pl-5'}`}
                >
                  <span className="shrink-0">{labelText}</span>
                  <span
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => handleCqPartBlur(sIdx, e)}
                    className="flex-1 whitespace-pre-line text-justify outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded cursor-text"
                  >
                    <MultiScriptText
                      text={sub.questionText || `বিকল্প ${labelText} লিখুন...`}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* ───────────────── BOARD STANDARD QUESTION HEADER & STEM ───────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '6px',
              marginTop: `${headerMarginTop}px`,
              marginBottom: `${headerMarginBottom}px`,
            }}
            className="q-header flex items-start justify-between gap-1.5 font-serif text-[1em] text-slate-900"
          >
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', flex: 1, minWidth: 0 }}
              className="flex items-start gap-1 flex-1 min-w-0"
            >
              {qNumberDisplay ? (
                <span
                  contentEditable={isEditingText}
                    data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={handleNumberBlur}
                  style={{ fontWeight: 700, flexShrink: 0 }}
                  className="q-number font-bold text-slate-900 shrink-0 select-text outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-0.5 transition-colors cursor-text"
                  title="ক্লিক করে প্রশ্ন নম্বর বা বর্ণ (১., أ., বা আলিফ-বা) এডিট করুন"
                >
                  {qNumberDisplay}
                </span>
              ) : null}

              {/* Question Stem Text — Direct ContentEditable */}
              {parsedMultiLine ? (
                <div
                  contentEditable={isEditingText}
                    data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={handleMultiLineTitleBlur}
                  style={{
                    fontWeight: 700,
                    flex: 1,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  className="q-stem font-bold flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text"
                  title="ক্লিক করে প্রশ্নের শিরোনাম বা নির্দেশনা এডিট করুন"
                >
                  <MultiScriptText text={parsedMultiLine.titleLine} />
                </div>
              ) : (
                <div
                  contentEditable={isEditingText}
                    data-editable-field="true"
                  suppressContentEditableWarning
                  onBlur={handleStemBlur}
                  style={{
                    fontWeight: isProseStimulus ? 400 : 700,
                    flex: 1,
                    whiteSpace: 'pre-line',
                    textAlign: isParagraphStem ? 'justify' : (isRTL ? 'right' : 'left'),
                  }}
                  className={`${isProseStimulus ? 'q-stem-paragraph' : 'q-stem font-bold'} ${isParagraphStem ? 'text-justify' : ''} flex-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text whitespace-pre-line`}
                  title="ক্লিক করে প্রশ্নের টেক্সট সরাসরি এডিট করুন"
                >
                  <MultiScriptText text={question.stemOrPassage || 'প্রশ্নের টেক্সট লিখুন...'} />
                </div>
              )}
            </div>

            {/* Marks Badge (e.g. [১], [١٠], or ২×৪= ٨) — Direct ContentEditable */}
            {marksDisplay ? (
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={handleMarksBlur}
                style={{ fontWeight: 700, fontFamily: 'monospace', flexShrink: 0, whiteSpace: 'nowrap', marginInlineStart: '6px' }}
                className="q-marks shrink-0 text-[0.9em] font-bold text-slate-800 font-mono outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded px-0.5 transition-colors cursor-text select-text whitespace-nowrap"
                title="ক্লিক করে প্রশ্নের মান (যেমন: ২×৪= ٨ বা [১০]) সরাসরি এডিট করুন"
              >
                {marksDisplay}
              </span>
            ) : null}
          </div>

          {/* If question has word clues (box of words) and parsedMultiLine, render word box between title and body */}
          {parsedMultiLine && question.wordClues && question.wordClues.length > 0 && renderWordCluesTable()}

          {/* If parsedMultiLine has body text, render it with NORMAL FONT WEIGHT (400) */}
          {parsedMultiLine && parsedMultiLine.bodyText && (
            <div
              contentEditable={isEditingText}
                    data-editable-field="true"
              suppressContentEditableWarning
              onBlur={handleMultiLineBodyBlur}
              style={{
                fontWeight: 400,
                textAlign: parsedMultiLine.bodyText.length > 100 ? 'justify' : (isRTL ? 'right' : 'left'),
                whiteSpace: 'pre-line',
                lineHeight: 'inherit',
                marginTop: '4px',
                marginBottom: '3px',
              }}
              className={`font-normal text-slate-800 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text whitespace-pre-line ${
                parsedMultiLine.bodyText.length > 100 ? 'text-justify' : ''
              } ${isRTL ? 'pr-2' : 'pl-3'}`}
              title="ক্লিক করে প্রশ্নের বিবরণ বা শব্দ তালিকা বা এবারত এডিট করুন"
            >
              <MultiScriptText text={parsedMultiLine.bodyText} />
            </div>
          )}
        </>
      )}

      {/* ───────────────── MULTIPLE COMPLETION STATEMENTS (i, ii, iii) ───────────────── */}
      {question.statements && question.statements.length > 0 && (
        <div className={`${isRTL ? 'pr-4' : 'pl-6'} py-0.5 space-y-0.5 text-[0.92em] font-serif text-slate-800`}>
          {question.statements.map((stmt, sIdx) => (
            <div key={sIdx} className="flex items-baseline gap-1.5">
              <span className="font-mono text-slate-500 font-bold">
                {sIdx === 0 ? 'i.' : sIdx === 1 ? 'ii.' : 'iii.'}
              </span>
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updated = [...(question.statements || [])];
                  updated[sIdx] = e.currentTarget.innerText.trim();
                  onUpdate({ ...question, statements: updated });
                }}
                className="outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text flex-1"
              >
                <MultiScriptText text={stmt} />
              </span>
            </div>
          ))}
          {!isRTL && question.typology === 'MULTIPLE_COMPLETION_MCQ' && (
            <div className="pt-0.5 font-normal text-slate-900">নিচের কোনটি সঠিক?</div>
          )}
        </div>
      )}

      {/* ───────────────── MCQ 4-OPTIONS GRID (Authentic Exam Layout) ───────────────── */}
      {(question.typology === 'SIMPLE_MCQ' ||
        question.typology === 'MULTIPLE_COMPLETION_MCQ' ||
        question.typology === 'PASSAGE_GROUP') &&
        question.options &&
        question.options.length > 0 && (() => {
          const maxOptLen = Math.max(...question.options.map((o) => (o.text || '').length));
          const useFourCols = !isRTL && maxOptLen <= 12;
          return (
        <div className={`grid ${useFourCols ? 'grid-cols-4 gap-x-2' : 'grid-cols-2 gap-x-4'} gap-y-1 ${isRTL ? 'pr-4' : 'pl-5'} pt-1 text-[0.92em] font-serif`}>
          {question.options.map((opt, optIdx) => (
            <div
              key={optIdx}
              className={`flex items-baseline gap-1 ${
                opt.isCorrect ? 'text-slate-900 font-semibold' : 'text-slate-800'
              }`}
            >
              {/* Option Label (ক, খ, গ, ঘ) - Click to toggle correct */}
              <span
                role="button"
                onClick={() => handleSelectCorrectOption(optIdx)}
                style={{ fontWeight: 700 }}
                className={`font-bold hover:text-emerald-700 cursor-pointer select-none transition ${
                  opt.isCorrect ? 'text-emerald-800 font-extrabold' : 'text-slate-700'
                }`}
                title="সঠিক উত্তর হিসেবে চিহ্নিত করতে ক্লিক করুন"
              >
                {!isRTL ? `${['ক', 'খ', 'গ', 'ঘ'][optIdx] || opt.label})` : `(${opt.label})`}
              </span>

              {/* Option Text — Direct ContentEditable */}
              <span
                contentEditable={isEditingText}
                    data-editable-field="true"
                suppressContentEditableWarning
                onBlur={(e) => handleOptionBlur(optIdx, e)}
                className="outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text flex-1"
                title="ক্লিক করে অপশন এডিট করুন"
              >
                <MultiScriptText text={opt.text} />
              </span>

              {opt.isCorrect && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 inline-block mb-0.5 ml-0.5 select-none" />
              )}
            </div>
          ))}
        </div>
          );
        })()}

      {/* ───────────────── WORD CLUES BOX (صندوق الكلمات - শূন্যস্থান পূরণের শব্দ বাক্স) ───────────────── */}
      {!parsedMultiLine && renderWordCluesTable()}

      {/* ───────────────── SUB-QUESTIONS (Arabic Comprehension & CQ Parts) ───────────────── */}
      {!question.groupRole?.startsWith('bangla2nd_') &&
        question.subQuestions &&
        question.subQuestions.length > 0 && (
        <div className={`pt-1.5 space-y-1 text-[0.92em] font-serif ${isRTL ? 'pr-2' : 'pl-4'}`}>
          {question.subQuestions.map((sub, sIdx) => {
            const isParagraphSub =
              question.typology === 'TARJAMA_TASHREEH' || (sub.questionText?.length || 0) > 140;
            const displayPart = getSubPartLabel(sub.part, sIdx, isRTL);
            return (
              <div
                key={sIdx}
                className="flex items-start gap-1 text-slate-800 w-full"
              >
                <div className="flex items-start gap-1 flex-1 min-w-0 w-full">
                  <span
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const text = e.currentTarget.innerText.trim().replace(/[()]/g, '');
                      const updated = [...(question.subQuestions || [])];
                      if (updated[sIdx]) {
                        updated[sIdx] = { ...updated[sIdx], part: text as any };
                        onUpdate({ ...question, subQuestions: updated });
                      }
                    }}
                    style={{ fontWeight: 700, flexShrink: 0 }}
                    className="font-bold text-slate-900 select-text outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-0.5 cursor-text shrink-0"
                    title="ক্লিক করে সাব-প্রশ্ন বর্ণ (الف, ب, ক, খ) এডিট করুন"
                  >
                    {question.typology === 'CQ' && !isRTL ? `${displayPart}.` : `(${displayPart})`}
                  </span>
                  <span
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => handleCqPartBlur(sIdx, e)}
                    style={{ textAlign: isParagraphSub ? 'justify' : (isRTL ? 'right' : 'left'), width: '100%' }}
                    className={`outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 rounded ps-0 pe-1 transition-colors cursor-text flex-1 ${
                      isParagraphSub ? 'text-justify' : ''
                    }`}
                    title="ক্লিক করে প্রশ্ন এডিট করুন"
                  >
                    <MultiScriptText text={sub.questionText} />
                  </span>
                  {question.typology === 'CQ' && sub.marks ? (
                    <span className="font-mono text-[0.92em] font-bold text-slate-700 shrink-0 ps-1 select-none">
                      {['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'][sub.marks] || sub.marks}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────── TAHQEEQ & SIGHA TABLE (মাদ্রাসা শব্দ বিশ্লেষণ ছক) ───────────────── */}
      {question.typology === 'TAHQEEQ_SIGHA' && question.tahqeeqWords && question.tahqeeqWords.length > 0 && (
        <div className={`${isRTL ? 'pr-3' : 'pl-5'} pt-1.5`}>
          <table className="w-full border-collapse border border-slate-400 text-xs font-serif text-center my-1">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-900 text-[11px]">
                <th className="border border-slate-400 px-1.5 py-0.5">اللفظ (শব্দ)</th>
                <th className="border border-slate-400 px-1.5 py-0.5">الصيغة (সিগাহ)</th>
                <th className="border border-slate-400 px-1.5 py-0.5">البحث (বাহাস)</th>
                <th className="border border-slate-400 px-1.5 py-0.5">الباب (বাব)</th>
                <th className="border border-slate-400 px-1.5 py-0.5">المادة (মাদ্দা)</th>
                <th className="border border-slate-400 px-1.5 py-0.5">المعنى (অর্থ)</th>
              </tr>
            </thead>
            <tbody>
              {question.tahqeeqWords.map((row, rIdx) => (
                <tr key={rIdx}>
                  {(['lafz', 'sigha', 'bahas', 'baab', 'maddah', 'meaning'] as const).map(
                    (col) => (
                      <td
                        key={col}
                        contentEditable={isEditingText}
                    data-editable-field="true"
                        suppressContentEditableWarning
                        onBlur={(e) => handleTahqeeqCellBlur(rIdx, col, e)}
                        className={`border border-slate-400 px-1.5 py-0.5 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 cursor-text ${
                          col === 'lafz' ? 'font-bold text-slate-900' : ''
                        }`}
                        dir={col === 'lafz' || col === 'sigha' ? 'rtl' : 'ltr'}
                      >
                        {row[col] || '—'}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── MATCHING TABLE ───────────────── */}
      {question.typology === 'MATCHING' &&
        question.matchingColumns &&
        question.matchingColumns.colA &&
        question.matchingColumns.colA.length > 0 && (
        <div className={`${isRTL ? 'pr-3' : 'pl-5'} pt-1.5`}>
          <table className="w-full border-collapse border border-slate-400 text-xs font-serif my-1">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                <th className={`border border-slate-400 px-2 py-0.5 ${isRTL ? 'text-right' : 'text-left'} w-1/2`}>
                  {isRTL ? 'العمود (أ)' : "কলাম 'ক'"}
                </th>
                <th className={`border border-slate-400 px-2 py-0.5 ${isRTL ? 'text-right' : 'text-left'} w-1/2`}>
                  {isRTL ? 'العمود (ب)' : "কলাম 'খ'"}
                </th>
              </tr>
            </thead>
            <tbody>
              {question.matchingColumns.colA.map((item, mIdx) => (
                <tr key={mIdx}>
                  <td
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedColA = [...(question.matchingColumns?.colA || [])];
                      updatedColA[mIdx] = e.currentTarget.innerText.trim();
                      onUpdate({
                        ...question,
                        matchingColumns: {
                          colA: updatedColA,
                          colB: question.matchingColumns?.colB || [],
                        },
                      });
                    }}
                    className="border border-slate-400 px-2 py-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 cursor-text"
                  >
                    ({mIdx + 1}) <MultiScriptText text={item} />
                  </td>
                  <td
                    contentEditable={isEditingText}
                    data-editable-field="true"
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedColB = [...(question.matchingColumns?.colB || [])];
                      updatedColB[mIdx] = e.currentTarget.innerText.trim();
                      onUpdate({
                        ...question,
                        matchingColumns: {
                          colA: question.matchingColumns?.colA || [],
                          colB: updatedColB,
                        },
                      });
                    }}
                    className="border border-slate-400 px-2 py-1 outline-none hover:bg-amber-50/70 focus:bg-amber-100/50 cursor-text"
                  >
                    ({String.fromCharCode(97 + mIdx)}){' '}
                    <MultiScriptText text={question.matchingColumns?.colB[mIdx] || ''} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Drag-to-Resize Spacing Handle (Only active when question is selected) */}
      {!isMeasuring && isSelected && (
        <QuestionSpacingHandle
          edge="bottom"
          value={question.spacingBottom ?? 0}
          onLiveChange={setLiveSpacingBottom}
          onCommit={(val) => onUpdate({ ...question, spacingBottom: val })}
        />
      )}
    </div>
  );
};
