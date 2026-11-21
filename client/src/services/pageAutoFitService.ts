import { LayoutConfig } from 'proshno-shared';

export interface AutoFitCandidateItem {
  id: string;
  type?: string;
  question?: any;
}

export interface AutoFitInput {
  items: AutoFitCandidateItem[];
  measuredHeights: Record<string, number>;
  measuredInnerHeight: number;
  measuredHeaderHeight: number;
  layoutConfig: LayoutConfig;
  targetPages?: number;
  isTwoCol: boolean;
}

export interface AutoFitResult {
  success: boolean;
  alreadyFits?: boolean;
  currentPages: number;
  targetPages: number;
  achievedPages: number;
  patch?: Partial<LayoutConfig>;
  summary: string;
}

const MM_TO_PX = 3.779527559;

/**
 * Pure packing simulation matching A4DocumentCanvas pagination logic exactly
 */
function simulatePacking(
  items: AutoFitCandidateItem[],
  itemHeights: Record<string, number>,
  innerHeightPx: number,
  headerHeightPx: number,
  isTwoCol: boolean
): number {
  if (items.length === 0) return 1;

  const numCols = isTwoCol ? 2 : 1;
  const page1Cap = Math.max(180, innerHeightPx - headerHeightPx);
  const pageNextCap = Math.max(240, innerHeightPx);

  let pageCount = 1;
  let colIndex = 0;
  let colUsedPx = 0;

  const getFallbackHeight = (item: AutoFitCandidateItem) => {
    if (item.type !== 'question') return 48;
    const subCount = item.question?.subQuestions?.length || 0;
    return 64 + subCount * 28;
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemH = itemHeights[item.id] ?? getFallbackHeight(item);
    const cap = pageCount === 1 ? page1Cap : pageNextCap;

    const isBanner =
      item.type === 'section-banner' || item.type === 'unassigned-banner';
    const nextItem = isBanner && i + 1 < items.length ? items[i + 1] : null;
    const nextH = nextItem
      ? itemHeights[nextItem.id] ?? getFallbackHeight(nextItem)
      : 0;
    const neededH = nextItem && itemH + nextH <= cap ? itemH + nextH : itemH;

    if (colUsedPx > 0 && colUsedPx + neededH > cap) {
      if (colIndex + 1 < numCols) {
        colIndex += 1;
        colUsedPx = 0;
      } else {
        pageCount += 1;
        colIndex = 0;
        colUsedPx = 0;
      }
    }

    colUsedPx += itemH;
  }

  return pageCount;
}

/**
 * Smart Auto-Fit calculation: searches for the minimal non-destructive adjustment
 * of font-size, line-height, and margins to fit the exam paper into targetPages.
 */
export function calculateSmartAutoFit(input: AutoFitInput): AutoFitResult {
  const {
    items,
    measuredHeights,
    measuredInnerHeight,
    measuredHeaderHeight,
    layoutConfig,
    targetPages,
    isTwoCol,
  } = input;

  const currentPt =
    layoutConfig.customFontSizePt ||
    (layoutConfig.fontSize === 'compact'
      ? 9.5
      : layoutConfig.fontSize === 'large'
      ? 12.5
      : 11);
  const currentLh = layoutConfig.lineHeight ?? 1.5;
  const currentMarginTop = layoutConfig.margins?.topMm || 14;
  const paperHeightMm = layoutConfig.paperSize === 'Legal' ? 356 : 297;

  // 1. Calculate current real page count
  const currentPages = simulatePacking(
    items,
    measuredHeights,
    measuredInnerHeight,
    measuredHeaderHeight,
    isTwoCol
  );

  if (currentPages <= 1) {
    return {
      success: true,
      alreadyFits: true,
      currentPages: 1,
      targetPages: 1,
      achievedPages: 1,
      summary: 'প্রশ্নপত্রটি ইতোমধ্যে ১ পৃষ্ঠার মধ্যে সম্পূর্ণ ফিট রয়েছে!',
    };
  }

  const target =
    targetPages && targetPages >= 1
      ? targetPages
      : Math.max(1, currentPages - 1);

  // 2. Candidate value ladders (ordered from least noticeable to most noticeable)
  const lhCandidates: number[] = [];
  for (let lh = currentLh; lh >= 1.18; lh -= 0.05) {
    lhCandidates.push(Number(lh.toFixed(2)));
  }
  if (!lhCandidates.includes(1.20)) lhCandidates.push(1.20);

  const ptCandidates: number[] = [];
  for (let pt = currentPt; pt >= 8.5; pt -= 0.3) {
    ptCandidates.push(Number(pt.toFixed(1)));
  }
  if (!ptCandidates.includes(8.5)) ptCandidates.push(8.5);

  const marginCandidates = [
    currentMarginTop,
    Math.max(10, currentMarginTop - 2),
    Math.max(9, currentMarginTop - 4),
  ];

  let bestMatch: {
    pt: number;
    lh: number;
    margin: number;
    pages: number;
    penalty: number;
  } | null = null;

  // 3. Search for the optimal combination
  for (const margin of marginCandidates) {
    const marginDelta = currentMarginTop - margin;
    const newInnerHeight = (paperHeightMm - margin - margin) * MM_TO_PX;

    for (const pt of ptCandidates) {
      for (const lh of lhCandidates) {
        // Skip identical settings
        if (
          pt === currentPt &&
          lh === currentLh &&
          margin === currentMarginTop
        ) {
          continue;
        }

        const fontRatio = pt / currentPt;
        const lhRatio = lh / currentLh;
        const scaleFactor = fontRatio * 0.55 + lhRatio * 0.45;

        // Estimate item heights under candidate settings
        const scaledHeights: Record<string, number> = {};
        for (const item of items) {
          const origH = measuredHeights[item.id] ?? 48;
          const textH = Math.max(0, origH - 14);
          scaledHeights[item.id] = Math.max(
            16,
            Math.round(14 + textH * scaleFactor)
          );
        }

        const scaledHeaderH = Math.max(
          100,
          Math.round(measuredHeaderHeight * (0.85 + 0.15 * fontRatio))
        );

        const simPages = simulatePacking(
          items,
          scaledHeights,
          newInnerHeight,
          scaledHeaderH,
          isTwoCol
        );

        // Lower penalty = preserved original formatting as much as possible
        const penalty =
          (currentLh - lh) * 60 +
          (currentPt - pt) * 25 +
          marginDelta * 3;

        if (simPages <= target) {
          if (!bestMatch || penalty < bestMatch.penalty) {
            bestMatch = { pt, lh, margin, pages: simPages, penalty };
          }
        }
      }
    }
  }

  // 4. Return result
  if (bestMatch) {
    return {
      success: true,
      currentPages,
      targetPages: target,
      achievedPages: bestMatch.pages,
      patch: {
        customFontSizePt: bestMatch.pt,
        fontSize:
          bestMatch.pt <= 9.5
            ? 'compact'
            : bestMatch.pt >= 12.5
            ? 'large'
            : 'standard',
        lineHeight: bestMatch.lh,
        margins: {
          ...layoutConfig.margins,
          topMm: bestMatch.margin,
          bottomMm: bestMatch.margin,
        },
      },
      summary: `ফন্ট: ${bestMatch.pt}pt, লাইন-হাইট: ${bestMatch.lh}, মার্জিন: ${bestMatch.margin}mm`,
    };
  }

  return {
    success: false,
    currentPages,
    targetPages: target,
    achievedPages: currentPages,
    summary: `প্রশ্নপত্রটি অনেক বড় হওয়ায় ${target} পৃষ্ঠায় মেলানো সম্ভব হয়নি। আপনি কিছু প্রশ্ন কমাতে পারেন বা পেপারের কাগজ Legal করতে পারেন।`,
  };
}
