'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Sliders,
  FileText,
  Sparkles,
  Shuffle,
  Settings,
  FolderPlus,
  BookOpen,
  ListOrdered,
  Wand2,
  Printer,
  Grid,
  CheckCircle2,
  Key,
  RotateCcw,
  Minus,
  Plus,
  Underline,
} from 'lucide-react';
import {
  HeaderPreset,
  InstitutionHeaderConfig,
  LayoutConfig,
  NumberingFormat,
  QuestionTypology,
} from 'proshno-shared';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useMobileKeyboardOpen } from '../../hooks/useMobileKeyboardOpen';

type MobileSheetTab = 'insert' | 'layout' | 'header' | 'sets' | 'tools' | null;

interface MobileBottomDockProps {
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
  onOpenSettingsModal: () => void;
  onAutoRenumber: () => void;
  onStripAllHarakat?: () => void;
  onAutoFitPage: () => void;
  activeSetName: string;
  availableSets: string[];
  onSelectSet: (set: string) => void;
  onLoadArabicPdfPreset?: () => void;
  // Arabic 1st Paper Modals
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
  // Arabic 2nd Paper Modals
  onOpenSarfNahwModal?: () => void;
  sarfNahwCount?: number;
  onOpenIkhtibarModal?: () => void;
  ikhtibarCount?: number;
  onOpenTarjamaInshaModal?: () => void;
  tarjamaInshaCount?: number;
  // Bangla 1st & 2nd Paper Modals
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
  onOpenAqaidFiqhWrittenModal?: () => void;
  aqaidFiqhWrittenCount?: number;
  onOpenAlimFiqhModal?: () => void;
  alimFiqhCount?: number;
  onOpenAlimAr2QawaidModal?: () => void;
  alimAr2QawaidCount?: number;
  onOpenAlimAr2TarjamaModal?: () => void;
  alimAr2TarjamaCount?: number;
  onOpenDakhilQuranWrittenModal?: () => void;
  dakhilQuranWrittenCount?: number;
  onOpenAlimQuranModal?: () => void;
  alimQuranCount?: number;
  openInsertTrigger?: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
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
  onAutoRenumber,
  onStripAllHarakat,
  onAutoFitPage,
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
  onOpenAqaidFiqhWrittenModal,
  aqaidFiqhWrittenCount = 0,
  onOpenAlimFiqhModal,
  alimFiqhCount = 0,
  onOpenAlimAr2QawaidModal,
  alimAr2QawaidCount = 0,
  onOpenAlimAr2TarjamaModal,
  alimAr2TarjamaCount = 0,
  onOpenDakhilQuranWrittenModal,
  dakhilQuranWrittenCount = 0,
  onOpenAlimQuranModal,
  alimQuranCount = 0,
  openInsertTrigger = 0,
}) => {
  const [activeSheet, setActiveSheet] = useState<MobileSheetTab>(null);
  const isKeyboardOpen = useMobileKeyboardOpen();

  useEffect(() => {
    if (openInsertTrigger > 0) {
      setActiveSheet('insert');
    }
  }, [openInsertTrigger]);

  const isArabic2nd =
    (headerConfig.subject || '').includes('আরবি ২য়') ||
    (headerConfig.subject || '').includes('আরবি দ্বিতীয়') ||
    (headerConfig.subject || '').includes('قواعد اللغة العربية') ||
    (headerConfig.subject || '').includes('কাওয়াইদুল') ||
    (headerConfig.subjectCode || '') === '১৩৪';

  const isArabic1st =
    !isArabic2nd &&
    ((headerConfig.subject || '').includes('আরবি') ||
      (headerConfig.subject || '').includes('العربية') ||
      (headerConfig.subjectCode || '') === '১৩৩');

  const isArabicPaper = isArabic1st || isArabic2nd;

  const isBangla2nd =
    !isArabicPaper &&
    ((headerConfig.subject || '').includes('বাংলা ২য়') ||
      (headerConfig.subject || '').includes('বাংলা ২য়') ||
      (headerConfig.subject || '').includes('বাংলা দ্বিতীয়') ||
      (headerConfig.subject || '').includes('বাংলা দ্বিতীয়') ||
      ((headerConfig.subjectCode || '') === '১০২' && (headerConfig.subject || '').includes('বাংলা')) ||
      ((headerConfig.subjectCode || '') === '১৩৬' && (headerConfig.subject || '').includes('বাংলা')));

  const isAlimQuran = Boolean(
    (headerConfig.subjectCode || '') === '২০১' ||
      (headerConfig.subject || '').includes('القرآن المجيد') ||
      (headerConfig.subject || '').includes('القران المجيد') ||
      (((headerConfig.subject || '').includes('কুরআন') ||
        (headerConfig.subject || '').includes('কোরআন') ||
        (headerConfig.subject || '').includes('তাজবীদ')) &&
        ((headerConfig.grade || '').includes('আলিম') ||
          (headerConfig.grade || '').toLowerCase().includes('alim') ||
          (headerConfig.grade || '').includes('العالم')))
  );

  const isDakhilQuran =
    !isAlimQuran &&
    Boolean(
      (headerConfig.subject || '').includes('কুরআন') ||
        (headerConfig.subject || '').includes('কোরআন') ||
        (headerConfig.subject || '').includes('তাজবীদ') ||
        (headerConfig.subject || '').includes('তাজভিদ')
    );

  const isBangla1st =
    !isArabicPaper &&
    !isBangla2nd &&
    !isDakhilQuran &&
    !isAlimQuran &&
    ((headerConfig.subject || '').includes('বাংলা ১ম') ||
      (headerConfig.subject || '').includes('বাংলা প্রথম') ||
      (headerConfig.subject || '').includes('সাহিত্যপাঠ') ||
      (headerConfig.subjectCode || '') === '১০১' ||
      (headerConfig.subjectCode || '') === '১৩৫');

  const isHscOrAlim =
    (headerConfig.grade || '').includes('একাদশ') ||
    (headerConfig.grade || '').includes('দ্বাদশ') ||
    (headerConfig.grade || '').includes('এইচএসসি') ||
    (headerConfig.grade || '').toLowerCase().includes('hsc') ||
    (headerConfig.grade || '').includes('আলিম') ||
    (headerConfig.grade || '').toLowerCase().includes('alim');

  const isAlimArabic2nd =
    (headerConfig.subjectCode || '') === '২০৬' ||
    (headerConfig.subject || '').includes('الورقة الثانية') ||
    (headerConfig.subject || '').includes('الأدب العربي') ||
    (isArabic2nd &&
      (isHscOrAlim ||
        (headerConfig.grade || '').includes('العالم') ||
        (headerConfig.grade || '').includes('عالم')));

  const isAlimFiqh2nd =
    (headerConfig.subjectCode || '') === '২০৪' ||
    (headerConfig.subject || '').includes('الفقه الثاني') ||
    (headerConfig.subject || '').includes('أصول الفقه') ||
    ((headerConfig.subject || '').includes('ফিকহ') &&
      ((headerConfig.subject || '').includes('২য়') ||
        (headerConfig.subject || '').includes('২য়') ||
        (headerConfig.subject || '').includes('দ্বিতীয়') ||
        (headerConfig.subject || '').includes('দ্বিতীয়')));

  const isAlimFiqh1st =
    !isAlimFiqh2nd &&
    ((headerConfig.subjectCode || '') === '২০৩' ||
      (headerConfig.subject || '').includes('الفقه الأول') ||
      ((headerConfig.subject || '').includes('ফিকহ') &&
        ((headerConfig.subject || '').includes('১ম') || (headerConfig.subject || '').includes('প্রথম'))));

  const isAlimFiqh = isAlimFiqh1st || isAlimFiqh2nd;

  const isDakhilAqaidFiqh =
    !isArabicPaper &&
    !isAlimFiqh &&
    ((headerConfig.subject || '').includes('আকাইদ') ||
      ((headerConfig.subject || '').includes('ফিকহ') && !(headerConfig.subject || '').includes('হাদিস')));

  const fontSizePt =
    layoutConfig.customFontSizePt ||
    (layoutConfig.fontSize === 'compact' ? 9.5 : layoutConfig.fontSize === 'large' ? 12.5 : 11);
  const lineHeight = layoutConfig.lineHeight ?? 1.5;
  const marginTop = layoutConfig.margins?.topMm ?? 14;

  const dockItems: {
    id: MobileSheetTab | 'ai';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: boolean;
  }[] = [
    { id: 'insert', label: 'প্রশ্ন যোগ', icon: PlusCircle, accent: true },
    { id: 'layout', label: 'লেআউট', icon: Sliders },
    { id: 'header', label: 'হেডার', icon: FileText },
    { id: 'ai', label: 'AI সহকারী', icon: Sparkles },
    { id: 'sets', label: 'সেট ও OMR', icon: Shuffle },
    { id: 'tools', label: 'টুলস', icon: Settings },
  ];

  const sheetTitles: Record<Exclude<MobileSheetTab, null>, string> = {
    insert: 'প্রশ্ন ও সেকশন যোগ করুন',
    layout: 'লেআউট, ফন্ট ও মার্জিন',
    header: 'প্রতিষ্ঠান ও পরীক্ষার হেডার',
    sets: 'সেট, শাফল ও এক্সপোর্ট',
    tools: 'সহায়ক টুলস ও সেটিংস',
  };

  return (
    <>
      {/* Fixed Bottom Canva-Style Dock (auto-hidden when mobile keyboard is open) */}
      {!isKeyboardOpen && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1.5 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] select-none print:hidden">
        <div className="flex items-center justify-around gap-1 overflow-x-auto">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSheet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'ai') {
                    setActiveSheet(null);
                    onOpenAiDrawer();
                  } else {
                    setActiveSheet((prev) => (prev === item.id ? null : (item.id as MobileSheetTab)));
                  }
                }}
                className={`flex flex-col items-center justify-center min-w-[54px] px-2 py-1 rounded-xl transition active:scale-95 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : item.accent
                    ? 'text-emerald-700 hover:bg-emerald-50/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${
                    item.id === 'ai' ? 'text-purple-600' : isActive || item.accent ? 'text-emerald-600' : 'text-slate-600'
                  }`}
                />
                <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        </nav>
      )}

      {/* Slide-Up Bottom Sheet */}
      <MobileBottomSheet
        isOpen={activeSheet !== null}
        title={activeSheet ? sheetTitles[activeSheet] : ''}
        onClose={() => setActiveSheet(null)}
      >
        {/* ─── SHEET 1: INSERT QUESTIONS ─── */}
        {activeSheet === 'insert' && (
          <div className="space-y-4">
            {/* Alim Arabic 2nd Paper Special Sections (Code 206) */}
            {isAlimArabic2nd && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  আলিম আরবি ২য় পত্র (কোড: ২০৬)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenAlimAr2QawaidModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenAlimAr2QawaidModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>+ (أ) القواعد (১–১০ নং : ৩৫ নম্বর)</span>
                      </span>
                      {alimAr2QawaidCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                          {alimAr2QawaidCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenIkhtibarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenIkhtibarModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        <span>+ (ب) اختبار القواعد (১১ নং : ১৫ নম্বর)</span>
                      </span>
                      {ikhtibarCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                          {ikhtibarCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenAlimAr2TarjamaModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenAlimAr2TarjamaModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <span>+ (ج) الترجمة والإنشاء (১২–১৬ নং : ৫০ নম্বর)</span>
                      </span>
                      {alimAr2TarjamaCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px]">
                          {alimAr2TarjamaCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Arabic 2nd Paper Special Sections (Dakhil) */}
            {isArabic2nd && !isAlimArabic2nd && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  আরবি ২য় পত্র (বোর্ড কাঠামো)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenSarfNahwModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenSarfNahwModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>+ الصرف والنحو (সরফ ও নাহু - ৩০)</span>
                      </span>
                      {sarfNahwCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                          {sarfNahwCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenIkhtibarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenIkhtibarModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        <span>+ اختبار القواعد (কাওয়ায়েদ - ২০)</span>
                      </span>
                      {ikhtibarCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                          {ikhtibarCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenTarjamaInshaModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenTarjamaInshaModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <span>+ الترجمة والإنشاء (অনুবাদ ও রচনা - ৪৫)</span>
                      </span>
                      {tarjamaInshaCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px]">
                          {tarjamaInshaCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Arabic 1st Paper Special Sections */}
            {isArabic1st && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  আরবি ১ম পত্র (বোর্ড কাঠামো)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {onOpenNasrulMadroosModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenNasrulMadroosModal();
                      }}
                      className="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-left"
                    >
                      + নসসুল মাদরুস {nasrulMadroosCount > 0 ? `(${nasrulMadroosCount})` : ''}
                    </button>
                  )}
                  {onOpenNasrulGhayrMadroosModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenNasrulGhayrMadroosModal();
                      }}
                      className="px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold text-left"
                    >
                      + গায়রে মাদরুস {nasrulGhayrMadroosCount > 0 ? `(${nasrulGhayrMadroosCount})` : ''}
                    </button>
                  )}
                  {onOpenNazmSectionModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenNazmSectionModal();
                      }}
                      className="px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold text-left"
                    >
                      + নজম {nazmSectionCount > 0 ? `(${nazmSectionCount})` : ''}
                    </button>
                  )}
                  {onOpenVocabSectionModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenVocabSectionModal();
                      }}
                      className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-left"
                    >
                      + মফরাদাত {vocabSectionCount > 0 ? `(${vocabSectionCount})` : ''}
                    </button>
                  )}
                  {onOpenKitabahSectionModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenKitabahSectionModal();
                      }}
                      className="col-span-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold text-left"
                    >
                      + কিতাবাহ ও ইনশা {kitabahSectionCount > 0 ? `(${kitabahSectionCount})` : ''}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bangla 1st Paper Special Sections */}
            {isBangla1st && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-indigo-800 uppercase">
                  বাংলা ১ম পত্র (বোর্ড কাঠামো)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenBanglaMcqModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenBanglaMcqModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        <span>+ বহুনির্বাচনি অভীক্ষা (MCQ - ৩০ নম্বর)</span>
                      </span>
                      {banglaMcqCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                          {banglaMcqCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenBanglaCqModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenBanglaCqModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>+ সৃজনশীল প্রশ্ন (CQ - ৭০ নম্বর)</span>
                      </span>
                      {banglaCqCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                          {banglaCqCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bangla 2nd Paper Special Sections */}
            {isBangla2nd && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-indigo-800 uppercase">
                  {isHscOrAlim
                    ? 'বাংলা ২য় পত্র (HSC ও আলিম বোর্ড কাঠামো)'
                    : 'বাংলা ২য় পত্র (৬ষ্ঠ–১০ম ও দাখিল বোর্ড কাঠামো)'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {isHscOrAlim ? (
                    <>
                      {onOpenBangla2ndHscGrammarModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSheet(null);
                            onOpenBangla2ndHscGrammarModal();
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-700" />
                            <span>+ ব্যাকরণ অংশ (১–৬ নং প্রশ্ন : ৩০ নম্বর)</span>
                          </span>
                          {bangla2ndHscGrammarCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                              {bangla2ndHscGrammarCount}
                            </span>
                          )}
                        </button>
                      )}
                      {onOpenBangla2ndHscNirmitiModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSheet(null);
                            onOpenBangla2ndHscNirmitiModal();
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-700" />
                            <span>+ নির্মিতি অংশ (৭–১২ নং প্রশ্ন : ৭০ নম্বর)</span>
                          </span>
                          {bangla2ndHscNirmitiCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
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
                          onClick={() => {
                            setActiveSheet(null);
                            onOpenBanglaMcqModal();
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-700" />
                            <span>+ বহুনির্বাচনি অভীক্ষা (MCQ - ৩০ নম্বর)</span>
                          </span>
                          {banglaMcqCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                              {banglaMcqCount}
                            </span>
                          )}
                        </button>
                      )}
                      {onOpenBangla2ndSscWrittenModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSheet(null);
                            onOpenBangla2ndSscWrittenModal();
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-700" />
                            <span>+ রচনামূলক প্রশ্ন (নির্মিতি - ৭০ নম্বর)</span>
                          </span>
                          {bangla2ndSscWrittenCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                              {bangla2ndSscWrittenCount}
                            </span>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Dakhil Aqaid & Fiqh Special Sections */}
            {isDakhilAqaidFiqh && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  আকাইদ ও ফিকহ (৬ষ্ঠ–১০ম / দাখিল বোর্ড কাঠামো)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenBanglaMcqModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenBanglaMcqModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        <span>+ বহুনির্বাচনি অভীক্ষা (MCQ - ৪০ নম্বর)</span>
                      </span>
                      {banglaMcqCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                          {banglaMcqCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenAqaidFiqhWrittenModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenAqaidFiqhWrittenModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>+ রচনামূলক প্রশ্ন (খ–চ বিভাগ : ৬০ নম্বর)</span>
                      </span>
                      {aqaidFiqhWrittenCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                          {aqaidFiqhWrittenCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Alim Fiqh 1st & 2nd Paper Special Section */}
            {isAlimFiqh && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  {isAlimFiqh2nd
                    ? 'আল ফিকহ ২য় পত্র (আলিম — কোড: ২০৪)'
                    : 'আল ফিকহ ১ম পত্র (আলিম — কোড: ২০৩)'}
                </p>
                {onOpenAlimFiqhModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      onOpenAlimFiqhModal();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isAlimFiqh2nd
                          ? '+ আল ফিকহ ২য় পত্র (উসূলুল ফিকহ ও ফারায়িয - ১০০)'
                          : '+ আল ফিকহ ১ম পত্র প্রশ্নাবলি (১০০ নম্বর)'}
                      </span>
                    </span>
                    {alimFiqhCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                        {alimFiqhCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Dakhil Quran & Tajweed Special Sections */}
            {isDakhilQuran && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  আল কুরআন মাজিদ ও তাজবীদ (দাখিল — কোড: ১০১)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenBanglaMcqModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenBanglaMcqModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        <span>+ বহুনির্বাচনি অভীক্ষা (MCQ - ৪০ নম্বর)</span>
                      </span>
                      {banglaMcqCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px]">
                          {banglaMcqCount}
                        </span>
                      )}
                    </button>
                  )}
                  {onOpenDakhilQuranWrittenModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onOpenDakhilQuranWrittenModal();
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>+ রচনামূলক প্রশ্ন (খ–ঘ বিভাগ : ৬০ নম্বর)</span>
                      </span>
                      {dakhilQuranWrittenCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                          {dakhilQuranWrittenCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Alim Quran Majid Special Section */}
            {isAlimQuran && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  القرآن المجيد — আলিম আল কুরআন মাজিদ (কোড: ২০১)
                </p>
                {onOpenAlimQuranModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      onOpenAlimQuranModal();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold active:scale-98"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>+ القرآن المجيد — مجموعة (أ) ও (ب) (১০০ নম্বর)</span>
                    </span>
                    {alimQuranCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px]">
                        {alimQuranCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Standard Question Typologies (Hidden when dedicated subject modals apply) */}
            {!isBangla1st && !isBangla2nd && !isDakhilAqaidFiqh && !isAlimFiqh && !isDakhilQuran && !isAlimQuran ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase">সাধারণ প্রশ্ন ও বিভাগ</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onInsertSection();
                      setActiveSheet(null);
                    }}
                    className="col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold"
                  >
                    <FolderPlus className="w-4 h-4 text-emerald-600" />
                    <span>+ নতুন বিভাগ/সেকশন (ক বিভাগ)</span>
                  </button>

                  {[
                    { id: 'SIMPLE_MCQ' as QuestionTypology, label: '+ সাধারণ MCQ' },
                    { id: 'CQ' as QuestionTypology, label: '+ সৃজনশীল (CQ)' },
                    { id: 'DESCRIPTIVE' as QuestionTypology, label: '+ বর্ণনামূলক' },
                    { id: 'FILL_BLANKS' as QuestionTypology, label: '+ শূন্যস্থান' },
                    { id: 'MATCHING' as QuestionTypology, label: '+ মিলকরণ ছক' },
                    { id: 'PASSAGE_GROUP' as QuestionTypology, label: '+ অনুচ্ছেদ গ্রুপ' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onInsertQuestion(q.id);
                        setActiveSheet(null);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 text-xs font-bold text-left shadow-2xs active:scale-95 transition"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onInsertQuestion('SPACER');
                    setActiveSheet(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center"
                >
                  + ফাঁকা স্পেসার
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInsertSection();
                    setActiveSheet(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold text-center"
                >
                  + নতুন বিভাগ
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── SHEET 2: LAYOUT CONTROLS ─── */}
        {activeSheet === 'layout' && (
          <div className="space-y-4">
            {/* Columns + Numbering */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">কলাম সংখ্যা</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[1, 2].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onUpdateLayout({ columns: col as 1 | 2 })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        layoutConfig.columns === col
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {col} কলাম
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">নম্বর ফরম্যাট</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'bn', label: 'বাংলা' },
                    { id: 'ar', label: 'আরবি' },
                    { id: 'en', label: 'EN' },
                  ].map((num) => (
                    <button
                      key={num.id}
                      type="button"
                      onClick={() => onUpdateLayout({ numberingFormat: num.id as NumberingFormat })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        layoutConfig.numberingFormat === num.id
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {num.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font Size + Line Height + Margins */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">ফন্ট (pt)</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const nextPt = Math.max(7, +(fontSizePt - 0.5).toFixed(1));
                      onUpdateLayout({
                        customFontSizePt: nextPt,
                        fontSize: nextPt <= 9.5 ? 'compact' : nextPt >= 12.5 ? 'large' : 'standard',
                      });
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-800">{fontSizePt}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextPt = Math.min(18, +(fontSizePt + 0.5).toFixed(1));
                      onUpdateLayout({
                        customFontSizePt: nextPt,
                        fontSize: nextPt <= 9.5 ? 'compact' : nextPt >= 12.5 ? 'large' : 'standard',
                      });
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">লাইন স্পেস</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onUpdateLayout({ lineHeight: Math.max(1.0, +(lineHeight - 0.1).toFixed(1)) })}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-800">{lineHeight.toFixed(1)}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateLayout({ lineHeight: Math.min(2.2, +(lineHeight + 0.1).toFixed(1)) })}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">মার্জিন (mm)</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(4, marginTop - 2);
                      onUpdateLayout({
                        margins: { topMm: next, bottomMm: next, leftMm: next, rightMm: next },
                      });
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-800">{marginTop}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(28, marginTop + 2);
                      onUpdateLayout({
                        margins: { topMm: next, bottomMm: next, leftMm: next, rightMm: next },
                      });
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Arabic Font Family & Harakat/Weight Presets */}
            {isArabicPaper && (
              <div className="space-y-2.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">আরবি ফন্ট</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Traditional Arabic', label: 'Traditional' },
                      { id: 'Noto Naskh Arabic', label: 'Noto Naskh' },
                      { id: 'Lateef', label: 'Lateef' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onUpdateLayout({ arabicFont: f.id as any })}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          (layoutConfig.arabicFont || 'Traditional Arabic') === f.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Arabic Weight & Harakat Preset Row */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLayout({
                        arabicFontWeight:
                          layoutConfig.arabicFontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      layoutConfig.arabicFontWeight === 'bold'
                        ? 'bg-amber-600 border-amber-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {layoutConfig.arabicFontWeight === 'bold'
                      ? 'আরবি: বোল্ড এরাব সক্রিয়'
                      : 'আরবি: হালকা এরাব সক্রিয়'}
                  </button>

                  {onStripAllHarakat && (
                    <button
                      type="button"
                      onClick={() => {
                        onStripAllHarakat();
                        setActiveSheet(null);
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 active:scale-95 transition"
                    >
                      সকল হরকত/তাশকিল সরান
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Auto-Fit */}
            <button
              type="button"
              onClick={() => {
                onAutoFitPage();
                setActiveSheet(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>পৃষ্ঠায় অটো-ফিট করুন (Auto-Fit Page)</span>
            </button>
          </div>
        )}

        {/* ─── SHEET 3: HEADER INFO ─── */}
        {activeSheet === 'header' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">প্রতিষ্ঠানের নাম</label>
              <input
                type="text"
                value={headerConfig.institutionName}
                onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">পরীক্ষার নাম</label>
                <input
                  type="text"
                  value={headerConfig.examTitle}
                  onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">শ্রেণি / মারহালা</label>
                <input
                  type="text"
                  value={headerConfig.grade}
                  onChange={(e) => onUpdateHeader({ grade: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">বিষয়</label>
                <input
                  type="text"
                  value={headerConfig.subject}
                  onChange={(e) => onUpdateHeader({ subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">সময়</label>
                <input
                  type="text"
                  value={headerConfig.timeAllowed}
                  onChange={(e) => onUpdateHeader({ timeAllowed: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">বোর্ড হেডার স্টাইল</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['SCHOOL', 'ALIA', 'QAWMI', 'UNIVERSITY'] as HeaderPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateHeader({ headerPreset: preset })}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border ${
                      headerConfig.headerPreset === preset
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SHEET 4: SETS & EXPORT ─── */}
        {activeSheet === 'sets' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">সক্রিয় প্রশ্ন সেট</label>
              {availableSets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableSets.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSelectSet(s)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        activeSetName === s
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onSelectSet('')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      !activeSetName
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    সেট ছাড়া
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  বর্তমানে প্রশ্নপত্রে কোনো সেট নেই। সেট তৈরি করতে নিচের বাটনে ট্যাপ করুন।
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onOpenSetShuffler();
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs"
            >
              <Shuffle className="w-4 h-4" />
              <span>সেট তৈরি ও শাফল করুন (ক/খ/গ/ঘ বা Set A/B/C/D)</span>
            </button>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveSheet(null);
                  onDownloadPdf('question-paper');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>মূল প্রশ্নপত্র PDF ডাউনলোড</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSheet(null);
                    onDownloadPdf('answer-key');
                  }}
                  className="py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>উত্তরমালা PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSheet(null);
                    onDownloadPdf('omr-sheet');
                  }}
                  className="py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>OMR বাবল শিট</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SHEET 5: TOOLS & SETTINGS ─── */}
        {activeSheet === 'tools' && (
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                onAutoRenumber();
                setActiveSheet(null);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold"
            >
              <ListOrdered className="w-4 h-4 text-amber-700" />
              <span>সব প্রশ্নের নম্বর ক্রমানুসারে সাজান (Auto-Renumber)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onOpenSettingsModal();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>পেপার ও প্রিন্ট সেটিংস</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onOpenSetupWizard();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>নতুন প্রশ্নপত্র উইজার্ড</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onOpenKeyModal();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span>AI Engine ও API Key সেটিংস</span>
            </button>

            {isArabicPaper && onLoadArabicPdfPreset && (
              <button
                type="button"
                onClick={() => {
                  setActiveSheet(null);
                  onLoadArabicPdfPreset();
                }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>বোর্ড প্রশ্নপত্র (PDF নমুনা) লোড করুন</span>
              </button>
            )}
          </div>
        )}
      </MobileBottomSheet>
    </>
  );
};
