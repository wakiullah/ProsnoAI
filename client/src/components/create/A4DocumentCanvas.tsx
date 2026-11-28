'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExamPaperData,
  ExamSection,
  InstitutionHeaderConfig,
  LayoutConfig,
  NumberingFormat,
  QuestionData,
} from 'proshno-shared';
import { EditableHeader } from './EditableHeader';
import { EditableSectionBanner } from './EditableSectionBanner';
import { EditableQuestionItem, QuestionSliceRange } from './EditableQuestionItem';
import { PlusCircle, Sparkles, FileText, Wand2, ZoomIn, ZoomOut, Maximize2, Check, Underline } from 'lucide-react';
import { calculateSmartAutoFit } from '../../services/pageAutoFitService';
import { useMobileKeyboardOpen } from '../../hooks/useMobileKeyboardOpen';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Exact CSS reference pixel ratio (96dpi / 25.4mm per inch)
const MM_TO_PX = 96 / 25.4;
const COLUMN_GAP_PX = 22;

interface A4DocumentCanvasProps {
  paperData: ExamPaperData;
  layoutConfig: LayoutConfig;
  headerConfig: InstitutionHeaderConfig;
  sections: ExamSection[];
  questions: QuestionData[];
  activeSetName?: string;
  onUpdateHeader: (patch: Partial<InstitutionHeaderConfig>) => void;
  onUpdateSection: (sectionId: string, patch: Partial<ExamSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateQuestion: (index: number, updated: QuestionData) => void;
  onDeleteQuestion: (index: number) => void;
  onDuplicateQuestion: (index: number) => void;
  onReorderQuestions: (newQuestions: QuestionData[]) => void;
  onAssignQuestionSection: (questionIndex: number, sectionId?: string) => void;
  onEditNasrulMadroos?: (question: QuestionData) => void;
  onInsertQuestionPrompt: () => void;
  onOpenAiDrawer: () => void;
  onUpdateLayout?: (patch: Partial<LayoutConfig>) => void;
  onRegisterAutoFit?: (fn: (targetPages?: number) => void) => void;
  showToast?: (msg: string) => void;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  selectedQuestionIndex?: number | null;
  onSelectQuestion?: (index: number | null) => void;
}

type CanvasDocItem =
  | {
      type: 'section-banner';
      id: string;
      section: ExamSection;
    }
  | {
      type: 'question';
      id: string;
      question: QuestionData;
      globalIndex: number;
      sliceRange?: QuestionSliceRange;
    }
  | {
      type: 'unassigned-banner';
      id: string;
    };

interface PaginatedPage {
  col1: CanvasDocItem[];
  col2: CanvasDocItem[];
}

// Wrapper for DnD Sortable Question Item
function SortableQuestionRow({
  question,
  questionIndex,
  globalIndex,
  numberingFormat,
  sections,
  onUpdate,
  onDelete,
  onDuplicate,
  onAssignSection,
  onEditNasrulMadroos,
  lineHeight,
  isSelected,
  onSelect,
  sliceRange,
}: {
  question: QuestionData;
  questionIndex: number;
  globalIndex: number;
  numberingFormat: NumberingFormat;
  sections: ExamSection[];
  onUpdate: (updated: QuestionData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAssignSection: (secId?: string) => void;
  onEditNasrulMadroos?: (question: QuestionData) => void;
  lineHeight?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  sliceRange?: QuestionSliceRange;
}) {
  const id = question._id || `q-${globalIndex}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: Boolean(sliceRange?.isContinuation) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
    display: 'flow-root',
  };

  return (
    <div
      ref={sliceRange?.isContinuation ? undefined : setNodeRef}
      data-canvas-q-idx={questionIndex}
      style={style}
    >
      <EditableQuestionItem
        question={question}
        globalIndex={globalIndex}
        numberingFormat={numberingFormat}
        sections={sections}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onAssignSection={onAssignSection}
        onEditNasrulMadroos={onEditNasrulMadroos}
        dragAttributes={sliceRange?.isContinuation ? undefined : attributes}
        dragListeners={sliceRange?.isContinuation ? undefined : listeners}
        lineHeight={lineHeight}
        isSelected={isSelected}
        onSelect={onSelect}
        sliceRange={sliceRange}
      />
    </div>
  );
}

const noop = () => {};

export const A4DocumentCanvas: React.FC<A4DocumentCanvasProps> = ({
  layoutConfig,
  headerConfig,
  sections,
  questions,
  activeSetName,
  onUpdateHeader,
  onUpdateSection,
  onDeleteSection,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onReorderQuestions,
  onAssignQuestionSection,
  onEditNasrulMadroos,
  onInsertQuestionPrompt,
  onOpenAiDrawer,
  onUpdateLayout,
  onRegisterAutoFit,
  showToast,
  zoom,
  onZoomChange,
  selectedQuestionIndex = null,
  onSelectQuestion,
}) => {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const stageSizerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [unscaledHeight, setUnscaledHeight] = useState(0);
  const [fitZoom, setFitZoom] = useState(100);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const isKeyboardOpen = useMobileKeyboardOpen();
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const prevZoomRef = useRef(zoom);
  const focalPointRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const pendingQuestionFocusRef = useRef<{
    unscaledX: number;
    unscaledY: number;
    unscaledW: number;
    unscaledH: number;
  } | null>(null);
  const autoZoomedFromFitRef = useRef(false);
  const zoomAnimFrameRef = useRef<number | null>(null);
  const numberingFormat: NumberingFormat = layoutConfig.numberingFormat || 'bn';
  const isTwoCol = layoutConfig.columns === 2;
  const allowQuestionSplit = layoutConfig.allowQuestionSplit !== false;
  const isArabicPaper =
    layoutConfig.numberingFormat === 'ar' ||
    Boolean(headerConfig.subject?.includes('আরবি')) ||
    Boolean(headerConfig.subject?.includes('العربية')) ||
    Boolean(headerConfig.subject?.includes('القرآن')) ||
    Boolean(headerConfig.subject?.includes('الحديث')) ||
    Boolean(headerConfig.subject?.includes('الفقه')) ||
    headerConfig.subjectCode === '২০১' ||
    headerConfig.subjectCode === '২০২' ||
    headerConfig.subjectCode === '٢٠٢' ||
    headerConfig.subjectCode === '২০৩' ||
    headerConfig.subjectCode === '২০৪';

  const selectedArabicFont = layoutConfig.arabicFont || 'Traditional Arabic';
  const arabicFontFamily = `'${selectedArabicFont}', 'Traditional Arabic', 'Noto Naskh Arabic', 'Lateef', serif`;
  const effectiveLineHeight = layoutConfig.lineHeight ?? 1.5;

  // Real margin padding in mm
  const margins = layoutConfig.margins || {
    topMm: 14,
    bottomMm: 14,
    leftMm: 18,
    rightMm: 18,
  };

  // Paper dimensions (A4 or Legal)
  const isLegal = layoutConfig.paperSize === 'Legal';
  const pageWidthMm = isLegal ? 215.9 : 210;
  const pageHeightMm = isLegal ? 355.6 : 297;

  // Responsive Fit-to-Width zoom calculation for mobile/tablet + unscaled height tracking
  useEffect(() => {
    const computeFit = () => {
      const pagePx = pageWidthMm * MM_TO_PX;
      const vw = window.innerWidth;
      if (vw < 1024) {
        const pad = vw < 640 ? 16 : 36;
        const pct = Math.max(35, Math.min(95, Math.floor(((vw - pad) / pagePx) * 100)));
        setFitZoom(pct);
      } else {
        setFitZoom(100);
      }
    };
    computeFit();
    window.addEventListener('resize', computeFit);
    return () => window.removeEventListener('resize', computeFit);
  }, [pageWidthMm]);

  useEffect(() => {
    const el = zoomContainerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setUnscaledHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track non-empty text selection inside contentEditable fields on the canvas for 1-click Underline
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setHasTextSelection(false);
        return;
      }
      const anchorEl =
        sel.anchorNode instanceof HTMLElement
          ? sel.anchorNode
          : sel.anchorNode?.parentElement;
      const inCanvasEditable = Boolean(
        anchorEl &&
          canvasWrapperRef.current?.contains(anchorEl) &&
          anchorEl.closest('[contenteditable="true"]')
      );
      setHasTextSelection(inCanvasEditable);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleToggleUnderlineSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sel = window.getSelection();
    const anchorEl =
      sel?.anchorNode instanceof HTMLElement
        ? sel.anchorNode
        : sel?.anchorNode?.parentElement;
    const editableRoot = anchorEl?.closest('[contenteditable="true"]') as HTMLElement | null;
    document.execCommand('underline', false);
    if (editableRoot) {
      // Trigger blur & refocus so state commits cleanly
      editableRoot.blur();
    }
    setHasTextSelection(false);
  };

  // Native two-finger Pinch-to-Zoom gesture on mobile/tablet canvas
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper || !onZoomChange) return;

    let initialDist: number | null = null;
    let initialZoom = zoomRef.current;

    const getDist = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDist = getDist(e.touches[0], e.touches[1]);
        initialZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist !== null && initialDist > 0) {
        e.preventDefault();
        const currentDist = getDist(e.touches[0], e.touches[1]);
        const ratio = currentDist / initialDist;
        const nextZoom = Math.max(30, Math.min(160, Math.round(initialZoom * ratio)));
        if (nextZoom !== zoomRef.current) {
          focalPointRef.current = {
            clientX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            clientY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          };
          onZoomChange(nextZoom);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDist = null;
      }
    };

    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
    wrapper.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
      wrapper.removeEventListener('touchend', handleTouchEnd);
      wrapper.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onZoomChange]);

  // Exact CSS calc expressions matching the rendered A4/Legal page to the sub-pixel
  const printableWidthCss = `calc(${pageWidthMm}mm - ${margins.leftMm + margins.rightMm}mm)`;
  const printableHeightCss = `calc(${pageHeightMm}mm - ${margins.topMm + margins.bottomMm}mm)`;
  const colWidthCss = isTwoCol
    ? `calc((${pageWidthMm}mm - ${margins.leftMm + margins.rightMm}mm - ${COLUMN_GAP_PX}px) / 2)`
    : printableWidthCss;
  const fallbackInnerHeightPx =
    (pageHeightMm - margins.topMm - margins.bottomMm) * MM_TO_PX;

  // Font size mapping matching PDF template
  const fontSizeMap = {
    compact: '11.5px',
    standard: '13.5px',
    large: '15.5px',
  };
  const currentFontSize = layoutConfig.customFontSizePt
    ? `${layoutConfig.customFontSizePt}pt`
    : fontSizeMap[layoutConfig.fontSize] || '13.5px';

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const questionIds = useMemo(() => {
    return questions.map((q, idx) => q._id || `q-${idx + 1}`);
  }, [questions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questionIds.indexOf(String(active.id));
      const newIndex = questionIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(questions, oldIndex, newIndex);
        onReorderQuestions(reordered);
      }
    }
  };

  // Group sections
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const unassignedQuestions = useMemo(() => {
    return questions.filter(
      (q) => !q.sectionId || !sections.some((s) => s.id === q.sectionId)
    );
  }, [questions, sections]);

  // Build the complete linear document flow of banners and questions
  const linearItems = useMemo<CanvasDocItem[]>(() => {
    const items: CanvasDocItem[] = [];

    if (sections.length > 0) {
      sortedSections.forEach((sec) => {
        const secQuestions = questions.filter((q) => q.sectionId === sec.id);
        if (secQuestions.length > 0) {
          items.push({
            type: 'section-banner',
            id: `sec-banner-${sec.id}`,
            section: sec,
          });
          secQuestions.forEach((q) => {
            const globalIdx = questions.indexOf(q) + 1;
            items.push({
              type: 'question',
              id: q._id || `q-${globalIdx}`,
              question: q,
              globalIndex: globalIdx,
            });
          });
        }
      });

      if (unassignedQuestions.length > 0) {
        items.push({
          type: 'unassigned-banner',
          id: 'unassigned-banner',
        });
        unassignedQuestions.forEach((q) => {
          const globalIdx = questions.indexOf(q) + 1;
          items.push({
            type: 'question',
            id: q._id || `q-${globalIdx}`,
            question: q,
            globalIndex: globalIdx,
          });
        });
      }
    } else {
      questions.forEach((q, idx) => {
        items.push({
          type: 'question',
          id: q._id || `q-${idx + 1}`,
          question: q,
          globalIndex: idx + 1,
        });
      });
    }

    return items;
  }, [questions, sections, sortedSections, unassignedQuestions]);

  // ───────────────── REAL DOM-MEASURED AUTOMATIC PAGINATION ─────────────────
  const measurePageHeightRef = useRef<HTMLDivElement | null>(null);
  const measureHeaderRef = useRef<HTMLDivElement | null>(null);
  const measureContainerRef = useRef<HTMLDivElement | null>(null);

  const [measured, setMeasured] = useState<{
    innerHeight: number;
    headerHeight: number;
    itemHeights: Record<string, number>;
    partHeights: Record<string, { header: number; items: number[] }>;
  }>({
    innerHeight: fallbackInnerHeightPx,
    headerHeight: 150,
    itemHeights: {},
    partHeights: {},
  });

  const measureLayout = React.useCallback(() => {
    const container = measureContainerRef.current;
    if (!container) return;

    const nextInnerHeight = measurePageHeightRef.current
      ? measurePageHeightRef.current.getBoundingClientRect().height
      : fallbackInnerHeightPx;

    const nextHeaderHeight = measureHeaderRef.current
      ? measureHeaderRef.current.getBoundingClientRect().height
      : 150;

    const nextHeights: Record<string, number> = {};
    const nextPartHeights: Record<string, { header: number; items: number[] }> = {};
    const nodes = container.querySelectorAll<HTMLElement>('[data-measure-id]');
    nodes.forEach((node) => {
      const id = node.dataset.measureId;
      if (id) {
        // Use exact fractional CSS pixel height (immune to integer offsetHeight rounding drift)
        const totalH = node.getBoundingClientRect().height;
        nextHeights[id] = totalH;

        const partNodes = node.querySelectorAll<HTMLElement>('[data-measure-part^="item-"]');
        if (partNodes.length >= 2) {
          const headerEl = node.querySelector<HTMLElement>('[data-measure-part="header"]');
          const itemsArr: number[] = [];
          let sumItems = 0;
          partNodes.forEach((pEl) => {
            const ph = pEl.getBoundingClientRect().height + 6; // include vertical item gap
            itemsArr.push(ph);
            sumItems += ph;
          });
          const headerH = headerEl
            ? headerEl.getBoundingClientRect().height + 10
            : Math.max(24, totalH - sumItems + 10);
          nextPartHeights[id] = { header: headerH, items: itemsArr };
        }
      }
    });

    setMeasured((prev) => {
      const sameInner = Math.abs(prev.innerHeight - nextInnerHeight) < 0.25;
      const sameHeader = Math.abs(prev.headerHeight - nextHeaderHeight) < 0.25;
      if (sameInner && sameHeader) {
        const prevKeys = Object.keys(prev.itemHeights);
        const nextKeys = Object.keys(nextHeights);
        const prevPartKeys = Object.keys(prev.partHeights);
        const nextPartKeys = Object.keys(nextPartHeights);
        if (
          prevKeys.length === nextKeys.length &&
          prevPartKeys.length === nextPartKeys.length &&
          nextKeys.every(
            (k) => Math.abs((prev.itemHeights[k] ?? -1) - nextHeights[k]) < 0.25
          )
        ) {
          return prev;
        }
      }
      return {
        innerHeight: nextInnerHeight,
        headerHeight: nextHeaderHeight,
        itemHeights: nextHeights,
        partHeights: nextPartHeights,
      };
    });
  }, [fallbackInnerHeightPx]);

  // Re-measure synchronously whenever content or typography/layout settings change
  useIsomorphicLayoutEffect(() => {
    measureLayout();
  }, [
    measureLayout,
    linearItems,
    currentFontSize,
    effectiveLineHeight,
    arabicFontFamily,
    colWidthCss,
    printableHeightCss,
    margins.topMm,
    margins.bottomMm,
    margins.leftMm,
    margins.rightMm,
    isTwoCol,
    headerConfig,
    activeSetName,
    isArabicPaper,
    numberingFormat,
  ]);

  // Re-measure once web fonts finish loading (does NOT re-trigger on browser zoom)
  useEffect(() => {
    let cancelled = false;

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) measureLayout();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [measureLayout]);

  // Available column heights (px) on Page 1 vs Page 2+ — strictly governed by stepper margins only
  const page1ColHeightPx = Math.max(180, measured.innerHeight - measured.headerHeight);
  const pageNextColHeightPx = Math.max(240, measured.innerHeight);

  // Automatic real-height column packing (Zero extra bottom reserves, zero manual page breaks)
  const pages: PaginatedPage[] = useMemo(() => {
    if (linearItems.length === 0) {
      return [{ col1: [], col2: [] }];
    }

    const numCols = isTwoCol ? 2 : 1;
    const pageList: PaginatedPage[] = [];
    let currentPage: PaginatedPage = { col1: [], col2: [] };
    let colIndex = 0; // 0 => col1, 1 => col2
    let colUsedPx = 0;

    const getPackCapacity = (pageIdx: number) =>
      pageIdx === 0 ? page1ColHeightPx : pageNextColHeightPx;

    const getFallbackHeight = (item: CanvasDocItem) => {
      if (item.type !== 'question') return 48;
      const subCount = item.question.subQuestions?.length || 0;
      return 64 + subCount * 28;
    };

    const advanceColumnOrPage = () => {
      if (colIndex + 1 < numCols) {
        colIndex += 1;
        colUsedPx = 0;
      } else {
        pageList.push(currentPage);
        currentPage = { col1: [], col2: [] };
        colIndex = 0;
        colUsedPx = 0;
      }
    };

    for (let i = 0; i < linearItems.length; i++) {
      const item = linearItems[i];
      const itemH = measured.itemHeights[item.id] ?? getFallbackHeight(item);
      let cap = getPackCapacity(pageList.length);

      const pushToCurrentCol = (docItem: CanvasDocItem, usedH: number) => {
        if (colIndex === 0) {
          currentPage.col1.push(docItem);
        } else {
          currentPage.col2.push(docItem);
        }
        colUsedPx += usedH;
      };

      // Smart Sub-Item Splitting (Default ON unless disabled globally or per-question keepTogether)
      const parts =
        item.type === 'question' && allowQuestionSplit && !item.question.keepTogether
          ? measured.partHeights[item.id]
          : undefined;

      if (
        item.type === 'question' &&
        parts &&
        parts.items.length >= 2 &&
        colUsedPx + itemH > cap
      ) {
        let cursor = 0;
        const totalParts = parts.items.length;

        while (cursor < totalParts) {
          cap = getPackCapacity(pageList.length);
          const remaining = cap - colUsedPx;
          const isFirstSlice = cursor === 0;
          const baseHeaderH = isFirstSlice ? parts.header : 8;

          // Never orphan a heading: require at least header + first sub-item to fit
          if (colUsedPx > 0 && baseHeaderH + parts.items[cursor] > remaining) {
            advanceColumnOrPage();
            continue;
          }

          let sliceH = baseHeaderH;
          let end = cursor;
          while (end < totalParts) {
            const nextPartH = parts.items[end];
            if (end > cursor && sliceH + nextPartH > remaining) {
              break;
            }
            sliceH += nextPartH;
            end++;
          }

          const slicedItem: CanvasDocItem = {
            ...item,
            id: isFirstSlice ? item.id : `${item.id}__slice_${cursor}`,
            sliceRange: {
              start: cursor,
              end,
              isContinuation: !isFirstSlice,
            },
          };

          pushToCurrentCol(slicedItem, sliceH);
          cursor = end;
          if (cursor < totalParts) {
            advanceColumnOrPage();
          }
        }
        continue;
      }

      // Keep section/unassigned banner attached to its first question when possible
      const isBanner =
        item.type === 'section-banner' || item.type === 'unassigned-banner';
      const nextItem =
        isBanner && i + 1 < linearItems.length ? linearItems[i + 1] : null;
      const nextH = nextItem
        ? measured.itemHeights[nextItem.id] ?? getFallbackHeight(nextItem)
        : 0;
      const neededH = nextItem && itemH + nextH <= cap ? itemH + nextH : itemH;

      if (colUsedPx > 0 && colUsedPx + neededH > cap) {
        advanceColumnOrPage();
      }

      pushToCurrentCol(item, itemH);
    }

    if (
      currentPage.col1.length > 0 ||
      currentPage.col2.length > 0 ||
      pageList.length === 0
    ) {
      pageList.push(currentPage);
    }

    return pageList;
  }, [
    linearItems,
    isTwoCol,
    allowQuestionSplit,
    measured.itemHeights,
    measured.partHeights,
    page1ColHeightPx,
    pageNextColHeightPx,
  ]);

  // Smart 1-Click Page Auto-Fit handler
  const handleAutoFit = (targetPages?: number) => {
    const res = calculateSmartAutoFit({
      items: linearItems,
      measuredHeights: measured.itemHeights,
      measuredInnerHeight: measured.innerHeight,
      measuredHeaderHeight: measured.headerHeight,
      layoutConfig,
      targetPages,
      isTwoCol,
    });

    if (res.alreadyFits) {
      showToast?.(res.summary);
      return;
    }

    if (res.success && res.patch) {
      onUpdateLayout?.(res.patch);
      showToast?.(
        `প্রশ্নপত্রটি সফলভাবে ${res.achievedPages} পৃষ্ঠায় মেলানো হয়েছে! (${res.summary}) (Undo: Ctrl+Z)`
      );
    } else {
      showToast?.(res.summary);
    }
  };

  const handleAutoFitRef = useRef(handleAutoFit);
  handleAutoFitRef.current = handleAutoFit;

  useEffect(() => {
    onRegisterAutoFit?.((tp) => handleAutoFitRef.current?.(tp));
  }, [onRegisterAutoFit]);

  // Shared typography style used by BOTH live A4 pages and offscreen height measurer
  const paperTypographyStyle: React.CSSProperties = {
    fontSize: currentFontSize,
    lineHeight: effectiveLineHeight,
    ['--paper-font-size' as any]: currentFontSize,
    ['--paper-line-height' as any]: String(effectiveLineHeight),
    ['--arabic-font-family' as any]: arabicFontFamily,
    fontFamily: isArabicPaper
      ? arabicFontFamily
      : "'Noto Serif Bengali', 'Amiri', 'Times New Roman', serif",
  };

  const renderColumnItems = (colItems: CanvasDocItem[]) =>
    colItems.map((item) => {
      if (item.type === 'section-banner') {
        return (
          <div key={item.id} style={{ display: 'flow-root' }}>
            <EditableSectionBanner
              section={item.section}
              onUpdate={(patch) => onUpdateSection(item.section.id, patch)}
              onDelete={() => onDeleteSection(item.section.id)}
            />
          </div>
        );
      }

      if (item.type === 'unassigned-banner') {
        return (
          <div
            key={item.id}
            style={{ display: 'flow-root' }}
            className="font-serif text-center text-xs font-bold text-slate-700 py-1 my-2"
          >
            {isArabicPaper ? '[ الأسئلة العامة ]' : '[ সাধারণ প্রশ্নাবলী ]'}
          </div>
        );
      }

      const q = item.question;
      const qIdx = questions.indexOf(q);

      return (
        <SortableQuestionRow
          key={item.id}
          question={q}
          questionIndex={qIdx}
          globalIndex={item.globalIndex}
          numberingFormat={numberingFormat}
          sections={sections}
          onUpdate={(updated) => onUpdateQuestion(qIdx, updated)}
          onDelete={() => onDeleteQuestion(qIdx)}
          onDuplicate={() => onDuplicateQuestion(qIdx)}
          onAssignSection={(secId) => onAssignQuestionSection(qIdx, secId)}
          onEditNasrulMadroos={onEditNasrulMadroos}
          lineHeight={effectiveLineHeight}
          isSelected={selectedQuestionIndex === qIdx}
          sliceRange={item.sliceRange}
          onSelect={
            onSelectQuestion
              ? () => onSelectQuestion(qIdx)
              : undefined
          }
        />
      );
    });

  const isScaledFit = zoom <= fitZoom + 2;
  const isArabicBold = layoutConfig.arabicFontWeight === 'bold';
  const scale = zoom / 100;
  const unscaledWidthPx = Math.ceil(pageWidthMm * MM_TO_PX);
  const scaledWidthPx = Math.ceil(unscaledWidthPx * scale);
  const scaledHeightPx = unscaledHeight > 0 ? Math.ceil(unscaledHeight * scale) : undefined;

  // Canva-style Smooth Animated Auto-Zoom to/from a specific question on Mobile/Tablet
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024 || !onZoomChange) return;

    const zcEl = zoomContainerRef.current;
    const sizer = stageSizerRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!zcEl || !sizer || !wrapper) return;

    const mainScroller = wrapper.parentElement;
    const useWindowScroll =
      !mainScroller || mainScroller.scrollHeight <= mainScroller.clientHeight + 2;

    const getScrollTop = () => (useWindowScroll ? window.scrollY : mainScroller!.scrollTop);
    const setScrollTop = (val: number) => {
      if (useWindowScroll) {
        window.scrollTo({ top: val, behavior: 'instant' as ScrollBehavior });
      } else if (mainScroller) {
        mainScroller.scrollTop = val;
      }
    };

    const runSmoothZoomAnimation = (
      endZoom: number,
      endScrollLeft: number,
      endScrollTop: number
    ) => {
      if (zoomAnimFrameRef.current !== null) {
        cancelAnimationFrame(zoomAnimFrameRef.current);
        zoomAnimFrameRef.current = null;
      }

      const startZoom = zoomRef.current;
      const startScrollLeft = wrapper.scrollLeft;
      const startScrollTop = getScrollTop();
      const durationMs = 280;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        // Cubic ease-out for silky Canva-like deceleration
        const ease = 1 - Math.pow(1 - t, 3);

        const interpZoom = startZoom + (endZoom - startZoom) * ease;
        const interpScale = interpZoom / 100;

        sizer.style.width = `${Math.ceil(unscaledWidthPx * interpScale)}px`;
        if (unscaledHeight > 0) {
          sizer.style.height = `${Math.ceil(unscaledHeight * interpScale)}px`;
        }
        zcEl.style.transform = `scale(${interpScale})`;

        wrapper.scrollLeft = Math.max(
          0,
          Math.round(startScrollLeft + (endScrollLeft - startScrollLeft) * ease)
        );
        setScrollTop(
          Math.max(0, Math.round(startScrollTop + (endScrollTop - startScrollTop) * ease))
        );

        if (t < 1) {
          zoomAnimFrameRef.current = requestAnimationFrame(step);
        } else {
          zoomAnimFrameRef.current = null;
          prevZoomRef.current = endZoom;
          zoomRef.current = endZoom;
          onZoomChange(endZoom);
        }
      };

      zoomAnimFrameRef.current = requestAnimationFrame(step);
    };

    if (selectedQuestionIndex === null) {
      if (autoZoomedFromFitRef.current) {
        autoZoomedFromFitRef.current = false;
        const startZoom = zoomRef.current;
        const endZoom = fitZoom;
        const startScrollTop = getScrollTop();
        const sizerRect = sizer.getBoundingClientRect();
        const sizerDocTop = startScrollTop + sizerRect.top;
        const focalY = window.innerHeight / 2;
        const oldOffsetY = Math.max(0, focalY - sizerRect.top);
        const newOffsetY = oldOffsetY * (endZoom / startZoom);
        const endScrollTop = Math.max(0, Math.round(sizerDocTop + newOffsetY - focalY));

        runSmoothZoomAnimation(endZoom, 0, endScrollTop);
      }
      return;
    }

    const qEl = zcEl.querySelector(
      `[data-canvas-q-idx="${selectedQuestionIndex}"]`
    ) as HTMLElement | null;
    if (!qEl) return;

    const curScale = zoomRef.current / 100;
    const qRect = qEl.getBoundingClientRect();
    const zcRect = zcEl.getBoundingClientRect();

    const unscaledX = (qRect.left - zcRect.left) / curScale;
    const unscaledY = (qRect.top - zcRect.top) / curScale;
    const unscaledW = Math.max(140, qRect.width / curScale);
    const unscaledH = Math.max(28, qRect.height / curScale);

    const vw = wrapper.clientWidth || window.innerWidth;
    const idealZoom = Math.floor(((vw - 24) / unscaledW) * 100);
    const targetZoom = Math.max(fitZoom + 15, Math.min(110, idealZoom));

    const endZoom = zoomRef.current < targetZoom - 3 ? targetZoom : zoomRef.current;
    const endScale = endZoom / 100;

    if (zoomRef.current <= fitZoom + 5 && endZoom > zoomRef.current) {
      autoZoomedFromFitRef.current = true;
    }

    const qCenterX = (unscaledX + unscaledW / 2) * endScale;
    const endScrollLeft = Math.max(0, Math.round(qCenterX - vw / 2));

    const startScrollTop = getScrollTop();
    const sizerRect = sizer.getBoundingClientRect();
    const sizerDocTop = startScrollTop + sizerRect.top;
    const qFocusYInStage = (unscaledY + Math.min(unscaledH / 2, 100)) * endScale;
    const desiredViewportY = Math.round(window.innerHeight * 0.34);
    const endScrollTop = Math.max(0, Math.round(sizerDocTop + qFocusYInStage - desiredViewportY));

    runSmoothZoomAnimation(endZoom, endScrollLeft, endScrollTop);

    return () => {
      if (zoomAnimFrameRef.current !== null) {
        cancelAnimationFrame(zoomAnimFrameRef.current);
        zoomAnimFrameRef.current = null;
      }
    };
  }, [selectedQuestionIndex, fitZoom, onZoomChange, unscaledWidthPx, unscaledHeight]);

  // Preserve vertical page scroll & horizontal focal position when zooming in/out
  useIsomorphicLayoutEffect(() => {
    const prevZoom = prevZoomRef.current;
    if (prevZoom === zoom) return;
    prevZoomRef.current = zoom;

    const wrapper = canvasWrapperRef.current;
    const sizer = stageSizerRef.current;
    if (!wrapper || !sizer || typeof window === 'undefined') return;

    // If zooming directly onto a selected question (Canva Smart Auto-Zoom)
    if (pendingQuestionFocusRef.current) {
      const target = pendingQuestionFocusRef.current;
      pendingQuestionFocusRef.current = null;
      const newScale = zoom / 100;

      // 1. Center horizontally on the target question column
      const qCenterX = (target.unscaledX + target.unscaledW / 2) * newScale;
      wrapper.scrollLeft = Math.max(0, Math.round(qCenterX - wrapper.clientWidth / 2));

      // 2. Position vertically so the target question is comfortably centered above keyboard area
      const sizerRect = sizer.getBoundingClientRect();
      const qFocusYInStage = (target.unscaledY + Math.min(target.unscaledH / 2, 100)) * newScale;
      const currentViewportY = sizerRect.top + qFocusYInStage;
      const desiredViewportY = Math.round(window.innerHeight * 0.34);
      const deltaY = Math.round(currentViewportY - desiredViewportY);

      const mainScroller = wrapper.parentElement;
      const beforeWinY = window.scrollY;
      window.scrollBy(0, deltaY);
      if (window.scrollY === beforeWinY && mainScroller) {
        mainScroller.scrollTop += deltaY;
      }
      return;
    }

    const ratio = zoom / prevZoom;
    const focalY = focalPointRef.current?.clientY ?? window.innerHeight / 2;
    const focalX = focalPointRef.current?.clientX ?? window.innerWidth / 2;
    focalPointRef.current = null;

    // 1. Vertical scroll anchor: keep the current page/line fixed at focalY
    const sizerRect = sizer.getBoundingClientRect();
    const oldOffsetY = focalY - sizerRect.top;
    if (oldOffsetY > 0) {
      const deltaY = Math.round(oldOffsetY * (ratio - 1));
      const mainScroller = wrapper.parentElement;
      const beforeWinY = window.scrollY;
      window.scrollBy(0, deltaY);
      if (window.scrollY === beforeWinY && mainScroller) {
        mainScroller.scrollTop += deltaY;
      }
    }

    // 2. Horizontal scroll anchor: center or preserve focalX so left/right panning works smoothly
    const oldScaledW = unscaledWidthPx * (prevZoom / 100);
    const oldLeftMargin = Math.max(0, (wrapper.clientWidth - oldScaledW) / 2);
    const oldOffsetInPageX =
      prevZoom <= fitZoom + 2
        ? Math.max(0, Math.min(oldScaledW, focalX - oldLeftMargin))
        : wrapper.scrollLeft + focalX;
    const newOffsetInPageX = oldOffsetInPageX * ratio;
    wrapper.scrollLeft = Math.max(0, Math.round(newOffsetInPageX - focalX));
  }, [zoom, fitZoom, unscaledWidthPx]);

  return (
    <div
      ref={canvasWrapperRef}
      onClick={() => onSelectQuestion?.(null)}
      style={{ touchAction: 'pan-x pan-y' }}
      className={`w-full block py-4 sm:py-8 px-1 sm:px-6 pb-28 lg:pb-12 bg-slate-200/90 min-h-screen select-none print:bg-white print:p-0 print:m-0 ${
        isScaledFit ? 'overflow-x-hidden' : 'overflow-x-auto'
      } ${isArabicBold ? 'proshno-arabic-bold' : ''}`}
    >
      {isArabicBold && (
        <style>{`
          .proshno-arabic-bold .font-ar,
          .proshno-arabic-bold .script-ar {
            font-weight: 700 !important;
          }
        `}</style>
      )}

      {/* Floating 1-Click Underline Action Pill when text is selected inside canvas */}
      {hasTextSelection && (
        <button
          type="button"
          onMouseDown={handleToggleUnderlineSelection}
          className="fixed top-15 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-extrabold shadow-2xl border border-emerald-400 hover:bg-emerald-700 active:scale-95 transition animate-in fade-in zoom-in-95 duration-150 print:hidden cursor-pointer"
          title="নির্বাচিত শব্দের নিচে আন্ডারলাইন দিন বা সরান (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5 text-emerald-300" />
          <span>আন্ডারলাইন (<u>U</u>)</span>
        </button>
      )}
      {/* Offscreen 1:1 Scale Staging Area for Sub-Pixel Exact DOM Measurement (Excluded from Print & PDF) */}
      <div
        aria-hidden="true"
        className="proshno-measure-staging print:hidden text-slate-900"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
          boxSizing: 'border-box',
        }}
      >
        {/* Reference printable page height in exact physical mm */}
        <div
          ref={measurePageHeightRef}
          style={{
            height: printableHeightCss,
            width: '1px',
          }}
        />

        {/* Reference Page 1 Header at exact full printable width */}
        <div
          ref={measureHeaderRef}
          style={{
            ...paperTypographyStyle,
            width: printableWidthCss,
            display: 'flow-root',
            boxSizing: 'border-box',
          }}
        >
          <EditableHeader
            headerConfig={headerConfig}
            layoutConfig={layoutConfig}
            activeSetName={activeSetName}
            onUpdateHeader={noop}
          />
        </div>

        {/* Reference single-column flow at exact rendered column width */}
        <div
          ref={measureContainerRef}
          dir={isArabicPaper ? 'rtl' : 'ltr'}
          style={{
            ...paperTypographyStyle,
            width: colWidthCss,
            textAlign: isArabicPaper ? 'right' : 'left',
            boxSizing: 'border-box',
          }}
        >
          {linearItems.map((item) => {
            if (item.type === 'section-banner') {
              return (
                <div
                  key={`m-${item.id}`}
                  data-measure-id={item.id}
                  style={{ display: 'flow-root' }}
                >
                  <EditableSectionBanner
                    section={item.section}
                    onUpdate={noop}
                    onDelete={noop}
                    isMeasuring
                  />
                </div>
              );
            }

            if (item.type === 'unassigned-banner') {
              return (
                <div
                  key={`m-${item.id}`}
                  data-measure-id={item.id}
                  style={{ display: 'flow-root' }}
                  className="font-serif text-center text-xs font-bold text-slate-700 py-1 my-2"
                >
                  {isArabicPaper ? '[ الأسئلة العامة ]' : '[ সাধারণ প্রশ্নাবলী ]'}
                </div>
              );
            }

            return (
              <div
                key={`m-${item.id}`}
                data-measure-id={item.id}
                style={{ display: 'flow-root' }}
              >
                <EditableQuestionItem
                  question={item.question}
                  globalIndex={item.globalIndex}
                  numberingFormat={numberingFormat}
                  sections={sections}
                  onUpdate={noop}
                  onDelete={noop}
                  onDuplicate={noop}
                  isMeasuring
                  lineHeight={effectiveLineHeight}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom & Page Size Indicator Pill */}
      <div className="mx-auto w-fit mb-3 sm:mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-white/85 backdrop-blur px-3 py-1 rounded-full border border-slate-300 shadow-2xs print:hidden max-w-[95vw]">
        <span className="hidden xs:inline sm:inline">
          {isLegal ? 'Legal (216×356mm)' : 'A4 (210×297mm)'}
        </span>
        <span className="hidden xs:inline sm:inline text-slate-300">|</span>
        <span>পৃষ্ঠা: {pages.length}</span>
        {pages.length > 1 && (
          <>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => handleAutoFit(pages.length - 1)}
              className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-[10px] font-bold shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer"
              title={`প্রশ্নপত্রটি স্বয়ংক্রিয়ভাবে ${pages.length - 1} পৃষ্ঠায় ফিট করুন`}
            >
              <Wand2 className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{pages.length - 1} পাতায় মেলান</span>
            </button>
          </>
        )}
        <span className="text-slate-300">|</span>
        <span>জুম: {zoom}%</span>
      </div>

      {/* Floating Keyboard "Done" Pill when Mobile Keyboard is Open */}
      {isKeyboardOpen && (
        <button
          type="button"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            onSelectQuestion?.(null);
          }}
          className="lg:hidden fixed top-15 right-3 z-40 flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-lg border border-emerald-500 active:scale-95 transition print:hidden"
        >
          <Check className="w-3.5 h-3.5" />
          <span>সম্পন্ন</span>
        </button>
      )}

      {/* Floating Mobile/Tablet Zoom & Fit Pill (hidden while typing on keyboard) */}
      {onZoomChange && !isKeyboardOpen && (
        <div className="lg:hidden fixed bottom-20 right-3 z-30 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white px-2 py-1 rounded-full shadow-xl border border-slate-700/80 text-[11px] font-bold print:hidden">
          <button
            type="button"
            onClick={() => onZoomChange(fitZoom)}
            className={`px-2 py-1 rounded-full transition flex items-center gap-1 ${
              Math.abs(zoom - fitZoom) <= 2
                ? 'bg-emerald-500 text-white'
                : 'hover:bg-slate-700 text-slate-200'
            }`}
            title="স্ক্রিন অনুযায়ী ফিট করুন"
          >
            <Maximize2 className="w-3 h-3" />
            <span>ফিট</span>
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(30, zoom - 10))}
            className="p-1.5 rounded-full hover:bg-slate-700 active:scale-90 transition"
            aria-label="জুম কমান"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] min-w-[30px] text-center text-emerald-300">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(150, zoom + 10))}
            className="p-1.5 rounded-full hover:bg-slate-700 active:scale-90 transition"
            aria-label="জুম বাড়ান"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* True Layout Sizer + Zoom transform container (enables full Left/Right & Top/Bottom panning) */}
      <div
        ref={stageSizerRef}
        style={{
          width: `${scaledWidthPx}px`,
          height: scaledHeightPx ? `${scaledHeightPx}px` : undefined,
          margin: '0 auto',
          position: 'relative',
        }}
        className="print:w-auto! print:h-auto! print:m-0!"
      >
        <div
          ref={zoomContainerRef}
          style={{
            width: `${unscaledWidthPx}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="shrink-0 flex flex-col items-center zoom-container"
        >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questionIds}
            strategy={verticalListSortingStrategy}
          >
            {pages.map((page, pIdx) => {
              const isFirstPage = pIdx === 0;

              return (
                <React.Fragment key={`page-${pIdx}`}>
                  {/* Visual Page Break / Gap between pages in UI */}
                  {pIdx > 0 && (
                    <div
                      style={{ width: `${pageWidthMm}mm` }}
                      className="my-6 py-2 flex items-center justify-center gap-3 text-xs font-sans text-slate-500 font-bold select-none print:hidden"
                    >
                      <div className="h-px bg-slate-300 flex-1 border-t border-dashed" />
                      <span className="bg-white/95 backdrop-blur px-3.5 py-1 rounded-full border border-slate-300 shadow-2xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          পৃষ্ঠা {pIdx} সমাপ্ত ── পরবর্তী পৃষ্ঠা {pIdx + 1}
                        </span>
                      </span>
                      <div className="h-px bg-slate-300 flex-1 border-t border-dashed" />
                    </div>
                  )}

                  {/* Discrete Physical Sheet (A4 or Legal) */}
                  <div
                    id={
                      isFirstPage
                        ? 'proshno-a4-paper'
                        : `proshno-a4-paper-page-${pIdx + 1}`
                    }
                    className="proshno-a4-page bg-white text-slate-900 border border-slate-300 rounded-xs relative selection:bg-amber-100/80 mb-6 print:mb-0 print:border-none print:shadow-none flex flex-col"
                    style={{
                      ...paperTypographyStyle,
                      width: `${pageWidthMm}mm`,
                      height: `${pageHeightMm}mm`,
                      minHeight: `${pageHeightMm}mm`,
                      maxHeight: `${pageHeightMm}mm`,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      paddingTop: `${margins.topMm}mm`,
                      paddingBottom: `${margins.bottomMm}mm`,
                      paddingLeft: `${margins.leftMm}mm`,
                      paddingRight: `${margins.rightMm}mm`,
                      boxShadow:
                        '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* PAGE 1: AUTHENTIC BOARD EXAM HEADER (Pages 2+ have NO header — only clean page margins) */}
                    {isFirstPage ? (
                      <div style={{ display: 'flow-root', flexShrink: 0 }}>
                        <EditableHeader
                          headerConfig={headerConfig}
                          layoutConfig={layoutConfig}
                          activeSetName={activeSetName}
                          onUpdateHeader={onUpdateHeader}
                        />
                      </div>
                    ) : null}

                    {/* EMPTY STATE (ONLY ON PAGE 1 IF NO QUESTIONS) */}
                    {questions.length === 0 ? (
                      <div className="my-20 text-center space-y-4 py-16 border-2 border-dashed border-slate-200 rounded-2xl select-none">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-800">
                            প্রশ্নপত্রটি এখনও সম্পূর্ণ খালি
                          </h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            উপরের রিবনের <strong>"ইনসার্ট (Insert)"</strong> ট্যাব থেকে পছন্দমতো প্রশ্ন যোগ করুন
                            অথবা <strong>"AI সহকারী"</strong> দিয়ে মুহূর্তেই পাঠ্যবই থেকে প্রশ্ন নিয়ে আসুন।
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={onInsertQuestionPrompt}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>+ প্রশ্ন যোগ করুন</span>
                          </button>
                          <button
                            onClick={onOpenAiDrawer}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>AI দিয়ে প্রশ্ন তৈরি</span>
                          </button>
                        </div>
                      </div>
                    ) : isTwoCol ? (
                      /* TWO-COLUMN AUTO-PAGINATED GRID (Col 1 flows into Col 2, then automatically into Page 2+) */
                      <div
                        dir={isArabicPaper ? 'rtl' : 'ltr'}
                        className="proshno-two-col-grid relative flex-1 min-h-0"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                          columnGap: `${COLUMN_GAP_PX}px`,
                          alignItems: 'start',
                          textAlign: isArabicPaper ? 'right' : 'left',
                        }}
                      >
                        {/* Center vertical column rule */}
                        <div
                          aria-hidden="true"
                          className="proshno-col-rule"
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '1px',
                            backgroundColor: '#cbd5e1',
                            pointerEvents: 'none',
                          }}
                        />
                        <div className="proshno-col min-w-0">
                          {renderColumnItems(page.col1)}
                        </div>
                        <div className="proshno-col min-w-0">
                          {renderColumnItems(page.col2)}
                        </div>
                      </div>
                    ) : (
                      /* SINGLE-COLUMN AUTO-PAGINATED FLOW */
                      <div
                        dir={isArabicPaper ? 'rtl' : 'ltr'}
                        className="proshno-single-col flex-1 min-h-0"
                        style={{
                          textAlign: isArabicPaper ? 'right' : 'left',
                        }}
                      >
                        {renderColumnItems(page.col1)}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </SortableContext>
        </DndContext>
        </div>
      </div>
    </div>
  );
};
