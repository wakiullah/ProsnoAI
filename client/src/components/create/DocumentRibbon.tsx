'use client';

import React, { useState, useEffect } from 'react';
import {
  EducationStream,
  HeaderPreset,
  InstitutionHeaderConfig,
  LayoutConfig,
  NumberingFormat,
  QuestionTypology,
} from 'proshno-shared';
import {
  FileText,
  Sparkles,
  Sliders,
  Columns,
  Hash,
  Wand2,
  Download,
  Printer,
  PlusCircle,
  FolderPlus,
  BookOpen,
  LayoutTemplate,
  Shuffle,
  Grid,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Layers,
  Settings,
  HelpCircle,
  RotateCcw,
  Key,
  Minus,
  Plus,
  Type,
  MoveVertical,
  Undo2,
  Redo2,
  ListOrdered,
  Underline,
} from 'lucide-react';

export type RibbonTab = 'home' | 'insert' | 'header' | 'ai' | 'sets' | 'export';

interface DocumentRibbonProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  layoutConfig: LayoutConfig;
  onUpdateLayout: (patch: Partial<LayoutConfig>) => void;
  headerConfig: InstitutionHeaderConfig;
  onUpdateHeader: (patch: Partial<InstitutionHeaderConfig>) => void;
  onInsertQuestion: (typology: QuestionTypology) => void;
  onInsertSection: () => void;
  onOpenAiDrawer: () => void;
  onOpenSetShuffler: () => void;
  onDownloadPdf: (type: 'question-paper' | 'answer-key' | 'omr-sheet') => void;
  onOpenSetupWizard: () => void;
  onOpenKeyModal: () => void;
  hasApiKey: boolean;
  totalMarks: number;
  questionCount: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  activeSetName: string;
  availableSets: string[];
  onSelectSet: (set: string) => void;
  onLoadArabicPdfPreset?: () => void;
  onOpenNasrulMadroosModal?: () => void;
  nasrulMadroosCount?: number;
  onOpenNasrulGhayrMadroosModal?: () => void;
  nasrulGhayrMadroosCount?: number;
  onOpenNazmSectionModal?: () => void;
  nazmSectionCount?: number;
  onOpenVocabSectionModal?: () => void;
  vocabSectionCount?: number;
  onOpenKitabahSectionModal?: () => void;
  kitabahSectionCount?: number;
  onOpenSarfNahwModal?: () => void;
  sarfNahwCount?: number;
  onOpenIkhtibarModal?: () => void;
  ikhtibarCount?: number;
  onOpenTarjamaInshaModal?: () => void;
  tarjamaInshaCount?: number;
  onOpenBanglaMcqModal?: () => void;
  banglaMcqCount?: number;
  onOpenBanglaCqModal?: () => void;
  banglaCqCount?: number;
  onOpenBangla2ndSscWrittenModal?: () => void;
  bangla2ndSscWrittenCount?: number;
  onOpenBangla2ndHscGrammarModal?: () => void;
  bangla2ndHscGrammarCount?: number;
  onOpenBangla2ndHscNirmitiModal?: () => void;
  bangla2ndHscNirmitiCount?: number;
  onOpenSettingsModal?: () => void;
  onAutoRenumber?: () => void;
  onStripAllHarakat?: () => void;
  onAutoFitPage?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  undoCount?: number;
  redoCount?: number;
}

interface StepperNumberInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
  onCommit: (val: number) => void;
}

const StepperNumberInput: React.FC<StepperNumberInputProps> = ({
  value,
  min,
  max,
  step = 1,
  suffix,
  className,
  onCommit,
}) => {
  const [localVal, setLocalVal] = useState<string>(String(value));

  useEffect(() => {
    setLocalVal(String(value));
  }, [value]);

  const commit = (valStr: string) => {
    let parsed = parseFloat(valStr);
    if (isNaN(parsed)) {
      setLocalVal(String(value));
      return;
    }
    parsed = Math.max(min, Math.min(max, parsed));
    setLocalVal(String(parsed));
    onCommit(parsed);
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => commit(localVal)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(localVal);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={
          className ||
          'w-8 text-center font-bold text-xs bg-transparent outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        }
      />
      {suffix && <span className="text-[10px] font-semibold text-slate-400">{suffix}</span>}
    </div>
  );
};

export const DocumentRibbon: React.FC<DocumentRibbonProps> = ({
  activeTab,
  onTabChange,
  layoutConfig,
  onUpdateLayout,
  headerConfig,
  onUpdateHeader,
  onInsertQuestion,
  onInsertSection,
  onOpenAiDrawer,
  onOpenSetShuffler,
  onDownloadPdf,
  onOpenSetupWizard,
  onOpenKeyModal,
  onOpenSettingsModal,
  hasApiKey,
  totalMarks,
  questionCount,
  zoom,
  onZoomChange,
  activeSetName,
  availableSets,
  onSelectSet,
  onLoadArabicPdfPreset,
  onOpenNasrulMadroosModal,
  nasrulMadroosCount = 0,
  onOpenNasrulGhayrMadroosModal,
  nasrulGhayrMadroosCount = 0,
  onOpenNazmSectionModal,
  nazmSectionCount = 0,
  onOpenVocabSectionModal,
  vocabSectionCount = 0,
  onOpenKitabahSectionModal,
  kitabahSectionCount = 0,
  onOpenSarfNahwModal,
  sarfNahwCount = 0,
  onOpenIkhtibarModal,
  ikhtibarCount = 0,
  onOpenTarjamaInshaModal,
  tarjamaInshaCount = 0,
  onOpenBanglaMcqModal,
  banglaMcqCount = 0,
  onOpenBanglaCqModal,
  banglaCqCount = 0,
  onOpenBangla2ndSscWrittenModal,
  bangla2ndSscWrittenCount = 0,
  onOpenBangla2ndHscGrammarModal,
  bangla2ndHscGrammarCount = 0,
  onOpenBangla2ndHscNirmitiModal,
  bangla2ndHscNirmitiCount = 0,
  onAutoRenumber,
  onStripAllHarakat,
  onAutoFitPage,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const isArabicPaper =
    headerConfig.subject?.includes('আরবি') ||
    headerConfig.subject?.includes('العربية') ||
    headerConfig.subject?.includes('Arabic') ||
    layoutConfig.numberingFormat === 'ar';

  const isArabic2ndPaper =
    isArabicPaper &&
    Boolean(
      headerConfig.subject?.includes('আরবি ২য়') ||
      headerConfig.subject?.includes('আরবি দ্বিতীয়') ||
      headerConfig.subject?.includes('قواعد اللغة العربية') ||
      headerConfig.subject?.includes('কাওয়াইদুল') ||
      headerConfig.subjectCode === '১৩৪'
    );

  const isBangla2ndPaper =
    !isArabicPaper &&
    Boolean(
      headerConfig.subject?.includes('বাংলা ২য়') ||
        headerConfig.subject?.includes('বাংলা ২য়') ||
        headerConfig.subject?.includes('বাংলা দ্বিতীয়') ||
        headerConfig.subject?.includes('বাংলা দ্বিতীয়') ||
        (headerConfig.subjectCode === '১০২' && headerConfig.subject?.includes('বাংলা')) ||
        (headerConfig.subjectCode === '১৩৬' && headerConfig.subject?.includes('বাংলা'))
    );

  const isBangla1stPaper =
    !isArabicPaper &&
    !isBangla2ndPaper &&
    Boolean(
      headerConfig.subject?.includes('বাংলা ১ম') ||
      headerConfig.subject?.includes('বাংলা প্রথম') ||
      headerConfig.subject?.includes('সাহিত্যপাঠ') ||
      headerConfig.subjectCode === '১০১' ||
      headerConfig.subjectCode === '১৩৫'
    );

  const isHscOrAlim =
    Boolean(
      headerConfig.grade?.includes('একাদশ') ||
        headerConfig.grade?.includes('দ্বাদশ') ||
        headerConfig.grade?.includes('এইচএসসি') ||
        headerConfig.grade?.toLowerCase().includes('hsc') ||
        headerConfig.grade?.includes('আলিম') ||
        headerConfig.grade?.toLowerCase().includes('alim')
    );

  return (
    <div className="hidden lg:block bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30 select-none print:hidden">
      {/* ───────────────── TOP BAR (Document Title & System Status) ───────────────── */}
      <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSetupWizard}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition group"
            title="নতুন প্রশ্নপত্র বা শিক্ষা ধারা পরিবর্তন করতে উইজার্ড খুলুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 group-hover:-rotate-45 transition-transform" />
            <span>নতুন প্রশ্নপত্র উইজার্ড</span>
          </button>

          {/* Quick Arabic Board Exam Template Button */}
          {isArabicPaper && onLoadArabicPdfPreset && (
            <button
              onClick={onLoadArabicPdfPreset}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 shadow-2xs transition group"
              title="দাখিল ১০ম শ্রেণির আরবি ১ম পত্রের সম্পূর্ণ ১০০ নম্বরের বোর্ড মডেল প্রশ্নপত্র (PDF নমুনা) লোড করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>বোর্ড প্রশ্নপত্র (PDF নমুনা)</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="truncate max-w-[280px] sm:max-w-md">
                {headerConfig.subject || 'আরবি ১ম পত্র'} — {headerConfig.grade || 'দাখিল ৯ম'}
              </span>
              <span className="text-[10px] px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold font-mono">
                {headerConfig.headerPreset || 'ALIA'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-sm">
              {headerConfig.institutionName} · {headerConfig.examTitle}
            </p>
          </div>
        </div>

        {/* Right: Undo/Redo, Marks, Sets & Quick Print Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Undo / Redo (Last 15 History Steps) */}
          {(onUndo || onRedo) && (
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onUndo}
                disabled={undoCount === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed transition"
                title={`পূর্বাবস্থায় ফেরান (Ctrl+Z) — ${undoCount}/15 ধাপ`}
              >
                <Undo2 className="w-3.5 h-3.5 text-slate-700" />
                {undoCount > 0 && (
                  <span className="text-[10px] font-mono text-slate-500">{undoCount}</span>
                )}
              </button>
              <div className="h-3.5 w-px bg-slate-200" />
              <button
                type="button"
                onClick={onRedo}
                disabled={redoCount === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed transition"
                title={`পুনরায় করুন (Ctrl+Y / Ctrl+Shift+Z) — ${redoCount}/15 ধাপ`}
              >
                <Redo2 className="w-3.5 h-3.5 text-slate-700" />
                {redoCount > 0 && (
                  <span className="text-[10px] font-mono text-slate-500">{redoCount}</span>
                )}
              </button>
            </div>
          )}

          {/* AI Key Button */}
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
              hasApiKey
                ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse'
            }`}
            title="AI Engine & API Key Settings"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasApiKey ? 'AI কি সক্রিয়' : 'AI Key বসান'}</span>
          </button>

          {/* Active Set Toggle (if multiple sets exist) */}
          {availableSets.length > 1 && (
            <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg p-0.5 text-xs font-bold">
              <span className="text-[11px] text-purple-700 pl-1.5 hidden sm:inline">সেট:</span>
              {availableSets.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSet(s)}
                  className={`px-2 py-0.5 rounded text-xs transition ${
                    activeSetName === s
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Settings Modal Button */}
          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
              title="লেআউট, মার্জিন ও হেডার সেটিংস (Paper Settings)"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">সেটিংস</span>
            </button>
          )}

          {/* Quick PDF button */}
          <button
            onClick={() => onDownloadPdf('question-paper')}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* ───────────────── MS WORD STYLE RIBBON TABS ───────────────── */}
      <div className="px-4 flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar bg-white">
        {[
          { id: 'home', label: 'হোম (Home)', icon: Sliders },
          { id: 'insert', label: 'ইনসার্ট (Insert প্রশ্ন)', icon: PlusCircle },
          { id: 'header', label: 'হেডার ও প্রতিষ্ঠান (Header)', icon: BookOpen },
          { id: 'ai', label: 'AI সহকারী (AI Tools)', icon: Sparkles, badge: 'স্মার্ট' },
          { id: 'sets', label: 'সেট ও ওএমআর (Sets)', icon: Shuffle },
          { id: 'export', label: 'ডাউনলোড ও প্রিন্ট (Export)', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as RibbonTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────── CONTEXTUAL RIBBON TOOLBAR ───────────────── */}
      <div className="px-4 py-1.5 bg-slate-50/90 min-h-[46px] flex items-center overflow-x-auto no-scrollbar gap-2.5 text-xs">
        {/* ── TAB 1: HOME (Font Size, Numbering, Zoom) ── */}
        {activeTab === 'home' && (() => {
          const currentPt = layoutConfig.customFontSizePt || (
            layoutConfig.fontSize === 'compact' ? 9.5 :
            layoutConfig.fontSize === 'large' ? 12.5 : 11
          );
          const currentMarginMm = layoutConfig.margins?.topMm || 14;
          const currentLineHeight = layoutConfig.lineHeight ?? 1.5;

          return (
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0">
              {/* 1. FONT SIZE STEPPER (Min 7pt to Max 28pt) */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-emerald-600" /> ফন্ট:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newPt = Math.max(7, Number((currentPt - 0.5).toFixed(1)));
                      onUpdateLayout({
                        customFontSizePt: newPt,
                        fontSize: newPt <= 9.5 ? 'compact' : newPt >= 12.5 ? 'large' : 'standard',
                      });
                    }}
                    disabled={currentPt <= 7}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="ফন্ট সাইজ কমান (সর্বনিম্ন ৭pt)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <StepperNumberInput
                    value={currentPt}
                    min={7}
                    max={28}
                    step={0.5}
                    suffix="pt"
                    className="w-8 text-center font-bold text-xs bg-transparent outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onCommit={(val) => {
                      onUpdateLayout({
                        customFontSizePt: val,
                        fontSize: val <= 9.5 ? 'compact' : val >= 12.5 ? 'large' : 'standard',
                      });
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newPt = Math.min(28, Number((currentPt + 0.5).toFixed(1)));
                      onUpdateLayout({
                        customFontSizePt: newPt,
                        fontSize: newPt <= 9.5 ? 'compact' : newPt >= 12.5 ? 'large' : 'standard',
                      });
                    }}
                    disabled={currentPt >= 28}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="ফন্ট সাইজ বাড়ান (সর্বোচ্চ ২৮pt)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 2. ARABIC FONT SELECTOR */}
              {isArabicPaper && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 pl-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> আরবি:
                  </span>
                  {(
                    [
                      { id: 'Traditional Arabic', label: 'Traditional' },
                      { id: 'Noto Naskh Arabic', label: 'Noto Naskh' },
                      { id: 'Lateef', label: 'Lateef' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateLayout({ arabicFont: f.id })}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                        (layoutConfig.arabicFont || 'Traditional Arabic') === f.id
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      style={{ fontFamily: f.id }}
                      title={`আরবি ফন্ট: ${f.id}`}
                    >
                      {f.label}
                    </button>
                  ))}

                  <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

                  {/* Global Arabic Bold vs Light/Normal Weight Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLayout({
                        arabicFontWeight:
                          layoutConfig.arabicFontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      layoutConfig.arabicFontWeight === 'bold'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="আরবি লেখার পুরুত্ব: হালকা (Normal) বা বোল্ড (Bold) টগল করুন"
                  >
                    {layoutConfig.arabicFontWeight === 'bold' ? 'বোল্ড এরাব' : 'হালকা এরাব'}
                  </button>

                  {/* Global Strip All Harakat Button */}
                  {onStripAllHarakat && (
                    <button
                      type="button"
                      onClick={onStripAllHarakat}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition"
                      title="এক ক্লিকে সকল প্রশ্নের হরকত/তাশকিল সরান (Undo: Ctrl+Z)"
                    >
                      হরকত সরান
                    </button>
                  )}

                  {/* Quick 1-Click Underline Button */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const sel = window.getSelection();
                      const anchorEl =
                        sel?.anchorNode instanceof HTMLElement
                          ? sel.anchorNode
                          : sel?.anchorNode?.parentElement;
                      const editableRoot = anchorEl?.closest(
                        '[contenteditable="true"]'
                      ) as HTMLElement | null;
                      document.execCommand('underline', false);
                      if (editableRoot) editableRoot.blur();
                    }}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 flex items-center gap-0.5 transition"
                    title="ক্যানভাসে যেকোনো শব্দ সিলেক্ট করে ক্লিক করলে আন্ডারলাইন (<u>) যুক্ত বা বাতিল হবে"
                  >
                    <Underline className="w-3 h-3" />
                    <span>আন্ডারলাইন</span>
                  </button>
                </div>
              )}

              {/* 3. HEADER SIZE SELECTOR */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 pl-1">হেডার:</span>
                {(['compact', 'standard', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onUpdateHeader({ headerSize: size })}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold capitalize transition ${
                      (headerConfig.headerSize || (isArabicPaper ? 'compact' : 'standard')) === size
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title={size === 'compact' ? 'ছোট হেডার' : size === 'standard' ? 'আদর্শ হেডার' : 'বড় হেডার'}
                  >
                    {size === 'compact' ? 'ছোট' : size === 'standard' ? 'আদর্শ' : 'বড়'}
                  </button>
                ))}
              </div>

              {/* 4. MARGIN STEPPER (Min 4mm to Max 30mm) */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Columns className="w-3.5 h-3.5 text-emerald-600" /> মার্জিন:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newMm = Math.max(4, currentMarginMm - 1);
                      onUpdateLayout({
                        margins: {
                          topMm: newMm,
                          bottomMm: newMm,
                          leftMm: Math.round(newMm * 1.15),
                          rightMm: Math.round(newMm * 1.15),
                        },
                      });
                    }}
                    disabled={currentMarginMm <= 4}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="মার্জিন কমান (সর্বনিম্ন ৪ মিমি)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <StepperNumberInput
                    value={currentMarginMm}
                    min={4}
                    max={30}
                    step={1}
                    suffix="mm"
                    className="w-7 text-center font-bold text-xs bg-transparent outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onCommit={(val) => {
                      onUpdateLayout({
                        margins: {
                          topMm: val,
                          bottomMm: val,
                          leftMm: Math.round(val * 1.15),
                          rightMm: Math.round(val * 1.15),
                        },
                      });
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newMm = Math.min(30, currentMarginMm + 1);
                      onUpdateLayout({
                        margins: {
                          topMm: newMm,
                          bottomMm: newMm,
                          leftMm: Math.round(newMm * 1.15),
                          rightMm: Math.round(newMm * 1.15),
                        },
                      });
                    }}
                    disabled={currentMarginMm >= 30}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="মার্জিন বাড়ান (সর্বোচ্চ ৩০ মিমি)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 5. LINE HEIGHT STEPPER (Min 1.1 to Max 2.6) */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <MoveVertical className="w-3.5 h-3.5 text-emerald-600" /> লাইন:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newLh = Math.max(1.1, Number((currentLineHeight - 0.1).toFixed(1)));
                      onUpdateLayout({ lineHeight: newLh });
                    }}
                    disabled={currentLineHeight <= 1.1}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="লাইন হাইট কমান (সর্বনিম্ন ১.১)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <StepperNumberInput
                    value={currentLineHeight}
                    min={1.1}
                    max={2.6}
                    step={0.1}
                    className="w-7 text-center font-bold text-xs bg-transparent outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onCommit={(val) => {
                      onUpdateLayout({ lineHeight: val });
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newLh = Math.min(2.6, Number((currentLineHeight + 0.1).toFixed(1)));
                      onUpdateLayout({ lineHeight: newLh });
                    }}
                    disabled={currentLineHeight >= 2.6}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="লাইন হাইট বাড়ান (সর্বোচ্চ ২.৬)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 6. NUMBERING FORMAT */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
                <span className="text-[11px] font-bold text-slate-500 pl-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> নম্বর:
                </span>
                {(
                  [
                    { id: 'bn', label: 'বাংলা (১,২)' },
                    { id: 'ar', label: 'আরবি (١,٢)' },
                    { id: 'en', label: 'ইংরেজি (1,2)' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => onUpdateLayout({ numberingFormat: fmt.id })}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      layoutConfig.numberingFormat === fmt.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}

                {/* 1-Click Auto-Renumber */}
                {onAutoRenumber && (
                  <>
                    <div className="h-4 w-px bg-slate-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={onAutoRenumber}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 transition shadow-2xs"
                      title="সকল মূল প্রশ্নের নম্বর ক্রমানুসারে (১, ২, ৩... বা ١, ٢, ٣...) ১-ক্লিকে ঠিক করুন। সাব-প্রশ্ন (ক, খ বা أ, ب) অক্ষত থাকবে। (Undo: Ctrl+Z)"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                      <span>নম্বর সাজান</span>
                    </button>
                  </>
                )}
              </div>

              {/* 7. SMART AUTO-FIT PAGE BUTTON */}
              {onAutoFitPage && (
                <button
                  type="button"
                  onClick={onAutoFitPage}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
                  title="অতিরিক্ত পৃষ্ঠা বাদ দিয়ে পুরো প্রশ্নপত্র কাঙ্ক্ষিত পাতায় স্বয়ংক্রিয়ভাবে ফিট করুন"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>পাতা মেলান (Auto-Fit)</span>
                </button>
              )}

              {/* 8. ZOOM CONTROLS */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs shrink-0">
                <button
                  onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-slate-700 min-w-[38px] text-center text-xs">
                  {zoom}%
                </span>
                <button
                  onClick={() => onZoomChange(Math.min(150, zoom + 10))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const availH = Math.max(400, window.innerHeight - 210);
                      const targetPageH = layoutConfig.paperSize === 'Legal' ? 1344 : 1123;
                      const fitPct = Math.max(50, Math.min(100, Math.floor((availH / targetPageH) * 100)));
                      onZoomChange(fitPct);
                    }
                  }}
                  className="text-[10px] text-blue-700 hover:underline font-bold px-1"
                  title="সম্পূর্ণ পেজ স্ক্রিনে ফিট করুন (A4 / Legal)"
                >
                  ফিট
                </button>
                <button
                  onClick={() => onZoomChange(100)}
                  className="text-[10px] text-emerald-700 hover:underline font-bold px-1"
                  title="১০০% জুম রিসেট"
                >
                  ১০০%
                </button>
              </div>

              {/* 8. FULL PAPER SETTINGS MODAL */}
              {onOpenSettingsModal && (
                <button
                  type="button"
                  onClick={onOpenSettingsModal}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition shrink-0"
                  title="লেআউট, মার্জিন, কলাম ও হেডার সেটিংস"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  <span>⚙️ পেপার সেটিংস</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* ── TAB 2: INSERT (Add Question Types & Exam Sections) ── */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2 flex-wrap">
            {isArabic2ndPaper ? (
              <>
                <span className="text-[11px] font-bold text-slate-500 font-serif">قواعد اللغة (প্রশ্ন যোগ করুন):</span>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SECTION_TITLE' as any)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="عنوان القسم الرئيسي (বিভাগ টাইটেল: (أ) القواعد واختبار القواعد)"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ عنوان القسم (বিভাগ টাইটেল)</span>
                </button>

                {/* ── ১ ও ২ নং প্রশ্ন: সরফ ও নাহু (الصرف والنحو - ৩০ নম্বর) ── */}
                <button
                  type="button"
                  onClick={onOpenSarfNahwModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title={
                    (sarfNahwCount || 0) > 0
                      ? 'পেপারে থাকা সরফ ও নাহু প্রশ্ন এডিট করুন অথবা নতুন যোগ করুন'
                      : 'الصرف والنحو (ইলমুস সরফ ও ইলমুন নাহু প্রশ্নাবলি - ৩০ নম্বর)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                  <span>
                    {(sarfNahwCount || 0) > 0
                      ? 'الصرف والنحو (এডিট / নতুন)'
                      : '+ الصرف والنحو (সরফ ও নাহু - ৩০)'}
                  </span>
                  {(sarfNahwCount || 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/40 border border-emerald-300/50 rounded-md font-sans">
                      {sarfNahwCount}টি
                    </span>
                  )}
                </button>

                {/* ── ৩ নং প্রশ্ন: اختبار القواعد (কাওয়ায়েদ পরীক্ষা - ২০ নম্বর) ── */}
                <button
                  type="button"
                  onClick={onOpenIkhtibarModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title={
                    (ikhtibarCount || 0) > 0
                      ? 'পেপারে থাকা কাওয়ায়েদ পরীক্ষা এডিট করুন অথবা নতুন যোগ করুন'
                      : 'اختبار القواعد (প্রয়োগমূলক ব্যাকরণ পরীক্ষা: সহিহ-মোতাল, মুজাররাদ-মাযীদ, জমার প্রকার, মুবতাদা-খবর, শূন্যস্থান ইত্যাদি - ২০ নম্বর)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-200" />
                  <span>
                    {(ikhtibarCount || 0) > 0
                      ? 'اختبار القواعد (এডিট / নতুন)'
                      : '+ اختبار القواعد (কাওয়ায়েদ - ২০)'}
                  </span>
                  {(ikhtibarCount || 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/40 border border-teal-300/50 rounded-md font-sans">
                      {ikhtibarCount}টি
                    </span>
                  )}
                </button>

                {/* ── ৪-৭ নং প্রশ্ন: الترجمة والإنشاء (অনুবাদ ও রচনা - ৪৫ নম্বর) ── */}
                <button
                  type="button"
                  onClick={onOpenTarjamaInshaModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title={
                    (tarjamaInshaCount || 0) > 0
                      ? 'পেপারে থাকা অনুবাদ ও রচনা অংশ এডিট করুন অথবা নতুন যোগ করুন'
                      : 'الترجمة والإنشاء (অনুবাদ, দরখাস্ত/চিঠি ও প্রবন্ধ রচনা - ৪৫ নম্বর)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {(tarjamaInshaCount || 0) > 0
                      ? 'الترجمة والإنشاء (এডিট / নতুন)'
                      : '+ الترجمة والإنشاء (অনুবাদ ও রচনা - ৪৫)'}
                  </span>
                  {(tarjamaInshaCount || 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/40 border border-blue-300/50 rounded-md font-sans">
                      {tarjamaInshaCount}টি
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('GROUP_TITLE')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-purple-300 text-purple-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="عنوان وتوجيه (কাস্টম নির্দেশনা বা টাইটেল)"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>+ توجيه (কাস্টম টাইটেল)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('TARJAMA_TASHREEH')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-sky-50 border border-sky-300 text-sky-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="ترجمة إلى البنغالية (বঙ্গানুবাদ)"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  <span>+ ترجمة (অনুবাদ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('DESCRIPTIVE')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="سؤال عام (সাধারণ বর্ণনামূলক প্রশ্ন)"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>+ سؤال عام (সাধারণ প্রশ্ন)</span>
                </button>
              </>
            ) : isArabicPaper ? (
              <>
                <span className="text-[11px] font-bold text-slate-500 font-serif">إضافة الأسئلة (প্রশ্ন যোগ করুন):</span>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SECTION_TITLE' as any)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="عنوان القسم الرئيسي (বিভাগ টাইটেল: (ألف) النص المدروس / النظم - নম্বর ছাড়া বড় শিরোনাম)"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ عنوان القسم (বিভাগ টাইটেল)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenNasrulMadroosModal || (() => onInsertQuestion('PASSAGE_GROUP'))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title={
                    nasrulMadroosCount > 0
                      ? 'পেপারে থাকা নসসুল মাদরুস এডিট করুন অথবা নতুন নস যোগ করুন'
                      : 'نص مدروس مع الأسئلة (অনুচ্ছেদ ও প্রশ্নাবলি তৈরি পপআপ)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                  <span>
                    {nasrulMadroosCount > 0
                      ? 'نص مدروس (এডিট / নতুন)'
                      : '+ نص مدروس مع الأسئلة'}
                  </span>
                  {nasrulMadroosCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/40 border border-emerald-300/50 rounded-md font-sans">
                      {nasrulMadroosCount}টি
                    </span>
                  )}
                </button>

                {/* ── নসসে গায়রে মাদরুস (النص غير المدروس - ২০ নম্বর) ── */}
                <button
                  type="button"
                  onClick={onOpenNasrulGhayrMadroosModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title={
                    nasrulGhayrMadroosCount > 0
                      ? 'পেপারে থাকা নসসে গায়রে মাদরুস এডিট করুন অথবা নতুন আনসিন নস যোগ করুন'
                      : 'نص غير مدروس مع الأسئلة (আনসিন নস ও ২০ নম্বরের ব্যাকরণিক প্রশ্নাবলি তৈরি পপআপ)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-200" />
                  <span>
                    {nasrulGhayrMadroosCount > 0
                      ? 'نص غير مدروس (এডিট / নতুন)'
                      : '+ نصوص (নসসে গায়রে মাদরুস)'}
                  </span>
                  {nasrulGhayrMadroosCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/40 border border-teal-300/50 rounded-md font-sans">
                      {nasrulGhayrMadroosCount}টি
                    </span>
                  )}
                </button>

                {/* ── ৩. কবিতা অংশ (ج) قسم النظم : ২০ নম্বর ── */}
                <button
                  type="button"
                  onClick={onOpenNazmSectionModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-800 hover:bg-fuchsia-900 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="قسم النظم (কবিতা অংশ: সারসংক্ষেপ/কবি পরিচিতি, কবিতাভিত্তিক প্রশ্ন ও শ্লোক ব্যাখ্যা - ২০ নম্বর)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-fuchsia-200" />
                  <span>
                    {nazmSectionCount > 0
                      ? 'قسم النظم (এডিট / নতুন)'
                      : '+ قسم النظم (কবিতা - ২০)'}
                  </span>
                  {nazmSectionCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-fuchsia-500/40 border border-fuchsia-300/50 rounded-md font-sans">
                      {nazmSectionCount}টি
                    </span>
                  )}
                </button>

                {/* ── ৪. শব্দভাণ্ডার ও শূন্যস্থান (د) اختبار المفردات : ২০ নম্বর ── */}
                <button
                  type="button"
                  onClick={onOpenVocabSectionModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="اختبار المفردات (শূন্যস্থান অংশ: ক্লু বক্স সহ ও ছাড়া শূন্যস্থান পূরণ - ২০ নম্বর)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                  <span>
                    {vocabSectionCount > 0
                      ? 'اختبار المفردات (এডিট / নতুন)'
                      : '+ اختبار المفردات (শূন্যস্থান - ২০)'}
                  </span>
                  {vocabSectionCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/40 border border-amber-300/50 rounded-md font-sans">
                      {vocabSectionCount}টি
                    </span>
                  )}
                </button>

                {/* ── ৫. লিখন দক্ষতা (هـ) اختبار الكتابة : ২০ নম্বর ── */}
                <button
                  type="button"
                  onClick={onOpenKitabahSectionModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="اختبار الكتابة (লিখন অংশ: হিবার/সংলাপ ও অথবা সহ অনুচ্ছেদ রচনা - ২০ নম্বর)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {kitabahSectionCount > 0
                      ? 'اختبار الكتابة (এডিট / নতুন)'
                      : '+ اختبار الكتابة (হিবার ও অনুচ্ছেদ - ২০)'}
                  </span>
                  {kitabahSectionCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/40 border border-blue-300/50 rounded-md font-sans">
                      {kitabahSectionCount}টি
                    </span>
                  )}
                </button>

                {/* ১-ক্লিক সম্পূর্ণ আরবি ১ম পত্র প্রিসেট */}
                {onLoadArabicPdfPreset && (
                  <button
                    type="button"
                    onClick={onLoadArabicPdfPreset}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl font-bold transition shadow-2xs"
                    title="বোর্ড স্ট্যান্ডার্ড সম্পূর্ণ দাখিল আরবি ১ম পত্র (১০০ নম্বর) মডেল পেপার ১-ক্লিকে লোড করুন"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>মডেল প্রশ্নপত্র (১০০ নম্বর)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onInsertQuestion('GROUP_TITLE')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-purple-300 text-purple-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="عنوان وتوجيه (কাস্টম নির্দেশনা বা টাইটেল)"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>+ توجيه (কাস্টম টাইটেল)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('TARJAMA_TASHREEH')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-sky-50 border border-sky-300 text-sky-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="ترجمة إلى البنغالية (বঙ্গানুবাদ)"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  <span>+ ترجمة (বঙ্গানুবাদ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SPACER')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-xl font-bold transition shadow-2xs font-serif"
                  title="যেকোনো স্থানে কাস্টম ফাঁকা জায়গা (Spacer) যোগ করুন"
                >
                  <MoveVertical className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ ফাঁকা স্পেসার</span>
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                <button
                  type="button"
                  onClick={onInsertSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-2xs font-serif"
                  title="إضافة قسم جديد (নতুন বিভাগ: ألف، ب، ج، د)"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ قسم جديد (নতুন বিভাগ)</span>
                </button>
              </>
            ) : isBangla1stPaper ? (
              <>
                <span className="text-[11px] font-bold text-slate-500">বাংলা ১ম পত্র (প্রশ্ন যোগ করুন):</span>

                {onOpenBanglaMcqModal && (
                  <button
                    type="button"
                    onClick={onOpenBanglaMcqModal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition shadow-xs"
                    title="বাংলা ১ম পত্র — ৩০টি বহুনির্বাচনি অভীক্ষা (সাধারণ, বহুপদী ও উদ্দীপকভিত্তিক) তৈরি বা এডিট করুন"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {banglaMcqCount > 0
                        ? 'বহুনির্বাচনি অভীক্ষা (এডিট / নতুন)'
                        : '+ বহুনির্বাচনি অভীক্ষা (MCQ - ৩০)'}
                    </span>
                    {banglaMcqCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                        {banglaMcqCount}
                      </span>
                    )}
                  </button>
                )}

                {onOpenBanglaCqModal && (
                  <button
                    type="button"
                    onClick={onOpenBanglaCqModal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition shadow-xs"
                    title="বাংলা ১ম পত্র — সৃজনশীল প্রশ্ন (৭০ নম্বর: গদ্য, কবিতা, উপন্যাস ও নাটক / আলিম বিভাগ) তৈরি বা এডিট করুন"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {banglaCqCount > 0
                        ? 'সৃজনশীল প্রশ্ন (এডিট / নতুন)'
                        : '+ সৃজনশীল প্রশ্ন (CQ - ৭০)'}
                    </span>
                    {banglaCqCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                        {banglaCqCount}
                      </span>
                    )}
                  </button>
                )}

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SPACER')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-xl font-bold transition shadow-2xs"
                  title="যেকোনো স্থানে কাস্টম ফাঁকা জায়গা (Spacer) যোগ করুন"
                >
                  <MoveVertical className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ ফাঁকা স্পেসার</span>
                </button>

                <button
                  type="button"
                  onClick={onInsertSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-2xs"
                  title="ক-বিভাগ বা খ-বিভাগ যুক্ত করুন"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ নতুন বিভাগ (Section)</span>
                </button>
              </>
            ) : isBangla2ndPaper ? (
              <>
                <span className="text-[11px] font-bold text-slate-500">
                  {isHscOrAlim ? 'বাংলা ২য় পত্র (HSC/আলিম):' : 'বাংলা ২য় পত্র (৬ষ্ঠ–১০ম/দাখিল):'}
                </span>

                {isHscOrAlim ? (
                  <>
                    {onOpenBangla2ndHscGrammarModal && (
                      <button
                        type="button"
                        onClick={onOpenBangla2ndHscGrammarModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition shadow-xs"
                        title="বাংলা ২য় পত্র (HSC ও আলিম) — ব্যাকরণ অংশ (১–৬ নং প্রশ্ন: ৩০ নম্বর)"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {bangla2ndHscGrammarCount > 0
                            ? 'ব্যাকরণ অংশ ১–৬ নং (এডিট / নতুন)'
                            : '+ ব্যাকরণ অংশ (১–৬ নং : ৩০ নম্বর)'}
                        </span>
                        {bangla2ndHscGrammarCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                            {bangla2ndHscGrammarCount}
                          </span>
                        )}
                      </button>
                    )}

                    {onOpenBangla2ndHscNirmitiModal && (
                      <button
                        type="button"
                        onClick={onOpenBangla2ndHscNirmitiModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition shadow-xs"
                        title="বাংলা ২য় পত্র (HSC ও আলিম) — নির্মিতি অংশ (৭–১২ নং প্রশ্ন: ৭০ নম্বর)"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {bangla2ndHscNirmitiCount > 0
                            ? 'নির্মিতি অংশ ৭–১২ নং (এডিট / নতুন)'
                            : '+ নির্মিতি অংশ (৭–১২ নং : ৭০ নম্বর)'}
                        </span>
                        {bangla2ndHscNirmitiCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                            {bangla2ndHscNirmitiCount}
                          </span>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {onOpenBanglaMcqModal && (
                      <button
                        type="button"
                        onClick={onOpenBanglaMcqModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition shadow-xs"
                        title="বাংলা ২য় পত্র — ৩০টি বহুনির্বাচনি অভীক্ষা (সাধারণ, বহুপদী ও উদ্দীপকভিত্তিক) তৈরি বা এডিট করুন"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {banglaMcqCount > 0
                            ? 'বহুনির্বাচনি অভীক্ষা (এডিট / নতুন)'
                            : '+ বহুনির্বাচনি অভীক্ষা (MCQ - ৩০)'}
                        </span>
                        {banglaMcqCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                            {banglaMcqCount}
                          </span>
                        )}
                      </button>
                    )}

                    {onOpenBangla2ndSscWrittenModal && (
                      <button
                        type="button"
                        onClick={onOpenBangla2ndSscWrittenModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition shadow-xs"
                        title="বাংলা ২য় পত্র — রচনামূলক প্রশ্ন (নির্মিতি - ৭০ নম্বর: অনুচ্ছেদ, পত্র, সারাংশ/সারমর্ম, ভাব-সম্প্রসারণ, প্রতিবেদন ও প্রবন্ধ)"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {bangla2ndSscWrittenCount > 0
                            ? 'রচনামূলক প্রশ্ন (এডিট / নতুন)'
                            : '+ রচনামূলক প্রশ্ন (নির্মিতি - ৭০)'}
                        </span>
                        {bangla2ndSscWrittenCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                            {bangla2ndSscWrittenCount}
                          </span>
                        )}
                      </button>
                    )}
                  </>
                )}

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SPACER')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-xl font-bold transition shadow-2xs"
                  title="যেকোনো স্থানে কাস্টম ফাঁকা জায়গা (Spacer) যোগ করুন"
                >
                  <MoveVertical className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ ফাঁকা স্পেসার</span>
                </button>

                <button
                  type="button"
                  onClick={onInsertSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-2xs"
                  title="ক-বিভাগ বা খ-বিভাগ যুক্ত করুন"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ নতুন বিভাগ (Section)</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-slate-500">প্রশ্ন যোগ করুন:</span>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SIMPLE_MCQ')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold transition shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>+ বহুনির্বাচনী (MCQ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('CQ')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold transition shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>+ সৃজনশীল (CQ Bloom's)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('FILL_BLANKS')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-bold transition shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>+ শূন্যস্থান পূরণ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('MATCHING')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-bold transition shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>+ মিলকরণ ছক</span>
                </button>

                {headerConfig.educationStream !== 'GENERAL' && (
                  <>
                    <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                    <button
                      type="button"
                      onClick={() => onInsertQuestion('TAHQEEQ_SIGHA')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300 text-emerald-950 rounded-xl font-bold transition shadow-2xs"
                      title="মাদ্রাসা শব্দ বিশ্লেষণ ছক (সিগাহ, বাহাস, বাব, মাদ্দা, অর্থ)"
                    >
                      <span className="font-serif font-bold text-emerald-700">تحقيق</span>
                      <span>+ তাহকীক ও সিগাহ ছক</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onInsertQuestion('TARKIB_IRAB')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300 text-emerald-950 rounded-xl font-bold transition shadow-2xs"
                      title="আরবি তারকীব ও হরকত বিশ্লেষণ প্রশ্ন"
                    >
                      <span className="font-serif font-bold text-emerald-700">إعراب</span>
                      <span>+ তারকীব ও এরাব</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => onInsertQuestion('DESCRIPTIVE')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl font-bold transition shadow-2xs"
                >
                  <span>+ বর্ণনামূলক / সংক্ষিপ্ত</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInsertQuestion('SPACER')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-xl font-bold transition shadow-2xs"
                  title="যেকোনো স্থানে কাস্টম ফাঁকা জায়গা (Spacer) যোগ করুন"
                >
                  <MoveVertical className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ ফাঁকা স্পেসার</span>
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                {/* Section / Group Insert */}
                <button
                  type="button"
                  onClick={onInsertSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-2xs"
                  title="ক-বিভাগ বা খ-বিভাগ যুক্ত করুন"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ নতুন বিভাগ (Section)</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: HEADER (Institution & Exam Title Configuration) ── */}
        {activeTab === 'header' && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500">হেডার কুইক এডিট:</span>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 font-semibold">প্রতিষ্ঠান:</span>
              <input
                type="text"
                value={headerConfig.institutionName}
                onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                className="text-xs font-bold text-slate-800 border-none outline-none bg-transparent w-44 sm:w-60"
                placeholder="প্রতিষ্ঠানের নাম"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 font-semibold">পরীক্ষা:</span>
              <input
                type="text"
                value={headerConfig.examTitle}
                onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                className="text-xs font-bold text-slate-800 border-none outline-none bg-transparent w-36 sm:w-48"
                placeholder="পরীক্ষার নাম"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 font-semibold">সময়:</span>
              <input
                type="text"
                value={headerConfig.timeAllowed}
                onChange={(e) => onUpdateHeader({ timeAllowed: e.target.value })}
                className="text-xs font-bold text-slate-800 border-none outline-none bg-transparent w-24"
                placeholder="সময়"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 font-semibold">পূর্ণমান:</span>
              <input
                type="number"
                value={headerConfig.totalMarks}
                onChange={(e) => onUpdateHeader({ totalMarks: Number(e.target.value) || 100 })}
                className="text-xs font-bold text-slate-800 border-none outline-none bg-transparent w-14"
              />
            </div>

            {/* Header Size Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 pl-1.5">হেডার সাইজ:</span>
              {(['compact', 'standard', 'large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateHeader({ headerSize: size })}
                  className={`px-2 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    (headerConfig.headerSize || (isArabicPaper ? 'compact' : 'standard')) === size
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={size === 'compact' ? 'ছোট হেডার (কম্প্যাক্ট)' : size === 'standard' ? 'আদর্শ হেডার' : 'বড় হেডার'}
                >
                  {size === 'compact' ? 'ছোট (Compact)' : size === 'standard' ? 'আদর্শ (Standard)' : 'বড় (Large)'}
                </button>
              ))}
            </div>

            {/* Full Paper Settings Modal */}
            {onOpenSettingsModal && (
              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 shadow-2xs transition"
                title="বিস্তারিত হেডার, প্রিসেট ও লেআউট সেটিংস"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-700" />
                <span>⚙️ বিস্তারিত সেটিংস</span>
              </button>
            )}

            <span className="text-[10px] text-slate-400 font-medium">
              💡 টিপস: আপনি সরাসরি পেপারেও ক্লিক করে নাম ও তথ্য এডিট করতে পারেন।
            </span>
          </div>
        )}

        {/* ── TAB 4: AI TOOLS (Drawer Trigger & Quick Prompt) ── */}
        {activeTab === 'ai' && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenAiDrawer}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI প্রশ্ন জেনারেটর ড্রয়ার খুলুন</span>
            </button>

            <span className="text-slate-400">|</span>

            <span className="text-[11px] text-slate-600 font-medium">
              পাঠ্যবইয়ের অধ্যায় বা PDF থেকে সরাসরি মাদ্রাসা ও আরবি প্রশ্ন তৈরি করে পেপারে ইনসার্ট করুন।
            </span>
          </div>
        )}

        {/* ── TAB 5: SETS (Set Shuffler & Active Set) ── */}
        {activeTab === 'sets' && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenSetShuffler}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>সেট তৈরি ও শাফল করুন (ক/খ/গ/ঘ বা A/B/C/D)</span>
            </button>

            <span className="text-slate-400">|</span>

            {availableSets.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <span>সক্রিয় সেট:</span>
                <div className="flex gap-1">
                  {availableSets.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSelectSet(s)}
                      className={`px-2.5 py-0.5 rounded-lg font-bold transition ${
                        activeSetName === s
                          ? 'bg-purple-700 text-white shadow-2xs'
                          : 'bg-white border border-purple-200 text-purple-800 hover:bg-purple-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => onSelectSet('')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition ${
                      !activeSetName
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    সেট ছাড়া
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-medium">
                বর্তমানে কোনো সেট নেই (সাধারণ একক প্রশ্নপত্র)
              </span>
            )}
          </div>
        )}

        {/* ── TAB 6: EXPORT & PRINT ── */}
        {activeTab === 'export' && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onDownloadPdf('question-paper')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>মূল প্রশ্নপত্র PDF ডাউনলোড</span>
            </button>

            <button
              onClick={() => onDownloadPdf('answer-key')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>শিক্ষক উত্তরমালা (Answer Key) PDF</span>
            </button>

            <button
              onClick={() => onDownloadPdf('omr-sheet')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>OMR বাবল শিট PDF</span>
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-bold transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>সরাসরি প্রিন্ট</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
