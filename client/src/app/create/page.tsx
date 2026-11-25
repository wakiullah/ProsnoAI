'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  EducationStream,
  ExamSection,
  HeaderPreset,
  InstitutionHeaderConfig,
  LayoutConfig,
  QuestionData,
  QuestionTypology,
} from 'proshno-shared';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { SetupWizardModal } from '../../components/create/SetupWizardModal';
import { DocumentRibbon, RibbonTab } from '../../components/create/DocumentRibbon';
import { MobileTopBar } from '../../components/create/MobileTopBar';
import { MobileBottomDock } from '../../components/create/MobileBottomDock';
import { MobileQuestionActionBar } from '../../components/create/MobileQuestionActionBar';
import { A4DocumentCanvas } from '../../components/create/A4DocumentCanvas';
import { QuickAiDrawer } from '../../components/create/QuickAiDrawer';
import {
  NasrulMadroosModal,
  extractNasrulMadroosGroups,
} from '../../components/create/NasrulMadroosModal';
import {
  NasrulGhayrMadroosModal,
  extractNasrulGhayrMadroosGroups,
} from '../../components/create/NasrulGhayrMadroosModal';
import {
  NazmSectionModal,
  extractNazmSectionGroups,
} from '../../components/create/NazmSectionModal';
import {
  VocabSectionModal,
  extractVocabSectionGroups,
} from '../../components/create/VocabSectionModal';
import {
  KitabahSectionModal,
  extractKitabahSectionGroups,
} from '../../components/create/KitabahSectionModal';
import {
  SarfNahwModal,
  extractSarfNahwGroups,
} from '../../components/create/arabic2nd/SarfNahwModal';
import {
  IkhtibarulQawaidModal,
  extractIkhtibarQawaidGroups,
} from '../../components/create/arabic2nd/IkhtibarulQawaidModal';
import {
  TarjamaInshaModal,
  extractTarjamaInshaGroups,
} from '../../components/create/arabic2nd/TarjamaInshaModal';
import { isAlimArabic2ndPaper } from '../../components/create/arabic2nd/alimArabic2ndDefaults';
import {
  AlimArabic2ndQawaidModal,
  extractAlimAr2QawaidGroups,
} from '../../components/create/arabic2nd/AlimArabic2ndQawaidModal';
import {
  AlimArabic2ndTarjamaInshaModal,
  extractAlimAr2TarjamaInshaGroups,
} from '../../components/create/arabic2nd/AlimArabic2ndTarjamaInshaModal';
import {
  getAlimQuranInstructions,
  getDakhilQuranInstructions,
  isAlimQuranPaper,
  isDakhilQuranTajweed,
} from '../../components/create/quranTajweed/quranTajweedDefaults';
import {
  DAKHIL_QURAN_WRITTEN_GROUP_ID,
  QuranTajweedWrittenModal,
} from '../../components/create/quranTajweed/QuranTajweedWrittenModal';
import {
  ALIM_QURAN_GROUP_ID,
  AlimQuranBuilderModal,
} from '../../components/create/quranTajweed/AlimQuranBuilderModal';
import {
  BanglaMcqBuilderModal,
  extractBanglaMcqGroups,
} from '../../components/create/bangla1st/BanglaMcqBuilderModal';
import {
  BanglaCqBuilderModal,
  extractBanglaCqGroups,
} from '../../components/create/bangla1st/BanglaCqBuilderModal';
import {
  BanglaPaperMode,
  getBanglaInstructionsByMode,
  isBangla1stPaper,
} from '../../components/create/bangla1st/bangla1stDefaults';
import {
  getBangla2ndInstructions,
  isBangla2ndPaper,
  isHscOrAlimGrade,
} from '../../components/create/bangla2nd/bangla2ndDefaults';
import {
  Bangla2ndSscWrittenModal,
  extractBangla2ndSscWrittenGroups,
} from '../../components/create/bangla2nd/Bangla2ndSscWrittenModal';
import {
  Bangla2ndHscGrammarModal,
  extractBangla2ndHscGrammarGroups,
} from '../../components/create/bangla2nd/Bangla2ndHscGrammarModal';
import {
  Bangla2ndHscNirmitiModal,
  extractBangla2ndHscNirmitiGroups,
} from '../../components/create/bangla2nd/Bangla2ndHscNirmitiModal';
import {
  getAlimFiqhInstructions,
  getAqaidFiqhInstructions,
  isAlimFiqh2nd,
  isAlimFiqhPaper,
  isDakhilAqaidFiqh,
} from '../../components/create/aqaidFiqh/aqaidFiqhDefaults';
import {
  AqaidFiqhWrittenModal,
  extractAqaidFiqhWrittenGroups,
} from '../../components/create/aqaidFiqh/AqaidFiqhWrittenModal';
import {
  AlimFiqhBuilderModal,
  extractAlimFiqhGroups,
} from '../../components/create/aqaidFiqh/AlimFiqhBuilderModal';
import { SetShufflerModal } from '../../components/builder/SetShufflerModal';
import { DownloadModal, DeliverableType } from '../../components/builder/DownloadModal';
import { PaperSettingsModal } from '../../components/builder/PaperSettingsModal';
import { ApiKeySettingsModal } from '../../components/common/ApiKeySettingsModal';
import { ConfirmActionModal } from '../../components/common/ConfirmActionModal';
import {
  downloadPdfDeliverable,
  getActiveAiProvider,
  getStoredGeminiKey,
  getStoredOpenRouterKey,
} from '../../lib/api';
import {
  dakhilArabic1stPaperHeader,
  dakhilArabic1stPaperLayout,
  dakhilArabic1stPaperSections,
  dakhilArabic1stPaperQuestions,
} from '../../presets/dakhilArabicFirstPaper';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateQuestionPage() {
  const {
    questions,
    sections,
    headerConfig,
    layoutConfig,
    sets,
    activeSet,
    past,
    future,
    undo,
    redo,
    addQuestion,
    addQuestions,
    replaceQuestionGroup,
    removeQuestion,
    updateQuestion,
    duplicateQuestion,
    reorderQuestions,
    moveQuestion,
    autoRenumberQuestions,
    stripAllHarakat,
    addSection,
    updateSection,
    removeSection,
    assignQuestionToSection,
    updateHeaderConfig,
    updateLayoutConfig,
    applyHeaderPreset,
    setActiveSet,
    loadFullPaper,
    getTotalMarks,
    getPaperData,
    hasCompletedSetup,
    hasHydrated,
  } = usePaperCartStore();

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isConfirmWizardOpen, setIsConfirmWizardOpen] = useState(false);

  const handleRequestOpenWizard = useCallback(() => {
    if (questions.length > 0) {
      setIsConfirmWizardOpen(true);
    } else {
      setIsWizardOpen(true);
    }
  }, [questions.length]);

  // Auto-open wizard on initial visit if user hasn't completed setup yet;
  // if they already completed setup earlier, keep their saved class & subject from localStorage.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!hasCompletedSetup || !headerConfig.subject) {
      setIsWizardOpen(true);
    }
  }, [hasHydrated, hasCompletedSetup, headerConfig.subject]);

  // Ribbon & UI state
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [zoom, setZoom] = useState(100);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [mobileInsertTrigger, setMobileInsertTrigger] = useState(0);

  // Auto-fit initial A4 canvas zoom on Mobile & Tablet (< 1024px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const pagePx = (layoutConfig.paperSize === 'Legal' ? 215.9 : 210) * (96 / 25.4);
      const pad = window.innerWidth < 640 ? 16 : 36;
      const pct = Math.max(35, Math.min(95, Math.floor(((window.innerWidth - pad) / pagePx) * 100)));
      setZoom(pct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isShufflerOpen, setIsShufflerOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadDeliverableType, setDownloadDeliverableType] =
    useState<DeliverableType>('question-paper');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isNasrulMadroosModalOpen, setIsNasrulMadroosModalOpen] = useState(false);
  const [activeNasrulGroupId, setActiveNasrulGroupId] = useState<string | null>(null);
  const [isNasrulGhayrMadroosModalOpen, setIsNasrulGhayrMadroosModalOpen] = useState(false);
  const [activeNasrulGhayrGroupId, setActiveNasrulGhayrGroupId] = useState<string | null>(null);
  const [isNazmModalOpen, setIsNazmModalOpen] = useState(false);
  const [activeNazmGroupId, setActiveNazmGroupId] = useState<string | null>(null);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [activeVocabGroupId, setActiveVocabGroupId] = useState<string | null>(null);
  const [isKitabahModalOpen, setIsKitabahModalOpen] = useState(false);
  const [activeKitabahGroupId, setActiveKitabahGroupId] = useState<string | null>(null);
  const [isSarfNahwModalOpen, setIsSarfNahwModalOpen] = useState(false);
  const [activeSarfNahwGroupId, setActiveSarfNahwGroupId] = useState<string | null>(null);
  const [isIkhtibarModalOpen, setIsIkhtibarModalOpen] = useState(false);
  const [activeIkhtibarGroupId, setActiveIkhtibarGroupId] = useState<string | null>(null);
  const [isTarjamaInshaModalOpen, setIsTarjamaInshaModalOpen] = useState(false);
  const [activeTarjamaInshaGroupId, setActiveTarjamaInshaGroupId] = useState<string | null>(null);
  const [isBanglaMcqModalOpen, setIsBanglaMcqModalOpen] = useState(false);
  const [activeBanglaMcqGroupId, setActiveBanglaMcqGroupId] = useState<string | null>(null);
  const [isBanglaCqModalOpen, setIsBanglaCqModalOpen] = useState(false);
  const [activeBanglaCqGroupId, setActiveBanglaCqGroupId] = useState<string | null>(null);
  const [isBangla2ndSscWrittenModalOpen, setIsBangla2ndSscWrittenModalOpen] = useState(false);
  const [activeBangla2ndSscWrittenGroupId, setActiveBangla2ndSscWrittenGroupId] = useState<string | null>(null);
  const [isBangla2ndHscGrammarModalOpen, setIsBangla2ndHscGrammarModalOpen] = useState(false);
  const [activeBangla2ndHscGrammarGroupId, setActiveBangla2ndHscGrammarGroupId] = useState<string | null>(null);
  const [isBangla2ndHscNirmitiModalOpen, setIsBangla2ndHscNirmitiModalOpen] = useState(false);
  const [activeBangla2ndHscNirmitiGroupId, setActiveBangla2ndHscNirmitiGroupId] = useState<string | null>(null);
  const [isAqaidFiqhWrittenModalOpen, setIsAqaidFiqhWrittenModalOpen] = useState(false);
  const [activeAqaidFiqhWrittenGroupId, setActiveAqaidFiqhWrittenGroupId] = useState<string | null>(null);
  const [isAlimFiqhModalOpen, setIsAlimFiqhModalOpen] = useState(false);
  const [activeAlimFiqhGroupId, setActiveAlimFiqhGroupId] = useState<string | null>(null);
  const [isAlimAr2QawaidModalOpen, setIsAlimAr2QawaidModalOpen] = useState(false);
  const [activeAlimAr2QawaidGroupId, setActiveAlimAr2QawaidGroupId] = useState<string | null>(null);
  const [isAlimAr2TarjamaModalOpen, setIsAlimAr2TarjamaModalOpen] = useState(false);
  const [activeAlimAr2TarjamaGroupId, setActiveAlimAr2TarjamaGroupId] = useState<string | null>(null);
  const [isDakhilQuranWrittenModalOpen, setIsDakhilQuranWrittenModalOpen] = useState(false);
  const [isAlimQuranModalOpen, setIsAlimQuranModalOpen] = useState(false);
  const [isPaperSettingsModalOpen, setIsPaperSettingsModalOpen] = useState(false);
  const autoFitFnRef = useRef<((targetPages?: number) => void) | null>(null);

  // Detect all existing section blocks on canvas for smart Edit-in-Place vs Create-New
  const nasrulGroups = useMemo(() => extractNasrulMadroosGroups(questions), [questions]);
  const nasrulGhayrGroups = useMemo(() => extractNasrulGhayrMadroosGroups(questions), [questions]);
  const nazmGroups = useMemo(() => extractNazmSectionGroups(questions), [questions]);
  const vocabGroups = useMemo(() => extractVocabSectionGroups(questions), [questions]);
  const kitabahGroups = useMemo(() => extractKitabahSectionGroups(questions), [questions]);
  const sarfNahwGroups = useMemo(() => extractSarfNahwGroups(questions), [questions]);
  const ikhtibarGroups = useMemo(() => extractIkhtibarQawaidGroups(questions), [questions]);
  const tarjamaInshaGroups = useMemo(() => extractTarjamaInshaGroups(questions), [questions]);
  const banglaMcqGroups = useMemo(() => extractBanglaMcqGroups(questions), [questions]);
  const banglaCqGroups = useMemo(() => extractBanglaCqGroups(questions), [questions]);
  const bangla2ndSscWrittenGroups = useMemo(() => extractBangla2ndSscWrittenGroups(questions), [questions]);
  const bangla2ndHscGrammarGroups = useMemo(() => extractBangla2ndHscGrammarGroups(questions), [questions]);
  const bangla2ndHscNirmitiGroups = useMemo(() => extractBangla2ndHscNirmitiGroups(questions), [questions]);
  const aqaidFiqhWrittenGroups = useMemo(() => extractAqaidFiqhWrittenGroups(questions), [questions]);
  const alimFiqhGroups = useMemo(() => extractAlimFiqhGroups(questions), [questions]);
  const alimAr2QawaidGroups = useMemo(() => extractAlimAr2QawaidGroups(questions), [questions]);
  const alimAr2TarjamaGroups = useMemo(() => extractAlimAr2TarjamaInshaGroups(questions), [questions]);
  const dakhilQuranWrittenCount = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.groupId === DAKHIL_QURAN_WRITTEN_GROUP_ID &&
          (q.groupRole === 'quran_ayat_item' || q.groupRole === 'quran_short_item')
      ).length,
    [questions]
  );
  const alimQuranCount = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.groupId === ALIM_QURAN_GROUP_ID &&
          (q.groupRole === 'alim_quran_group_a_item' || q.groupRole === 'alim_quran_group_b_item')
      ).length,
    [questions]
  );

  const handleOpenNasrulModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = nasrulGroups.find(
          (g) =>
            (specificQuestion.groupId && g.groupId === specificQuestion.groupId) ||
            (specificQuestion._id && g.passageQuestionId === specificQuestion._id)
        );
        setActiveNasrulGroupId(matched ? matched.groupId : nasrulGroups[0]?.groupId ?? null);
      } else {
        setActiveNasrulGroupId(nasrulGroups[0]?.groupId ?? null);
      }
      setIsNasrulMadroosModalOpen(true);
    },
    [nasrulGroups]
  );

  const handleOpenNasrulGhayrModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = nasrulGhayrGroups.find(
          (g) =>
            (specificQuestion.groupId && g.groupId === specificQuestion.groupId) ||
            (specificQuestion._id && g.passageQuestionId === specificQuestion._id)
        );
        setActiveNasrulGhayrGroupId(matched ? matched.groupId : nasrulGhayrGroups[0]?.groupId ?? null);
      } else {
        setActiveNasrulGhayrGroupId(nasrulGhayrGroups[0]?.groupId ?? null);
      }
      setIsNasrulGhayrMadroosModalOpen(true);
    },
    [nasrulGhayrGroups]
  );

  const handleOpenNazmModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = nazmGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveNazmGroupId(matched ? matched.groupId : nazmGroups[0]?.groupId ?? null);
      } else {
        setActiveNazmGroupId(nazmGroups[0]?.groupId ?? null);
      }
      setIsNazmModalOpen(true);
    },
    [nazmGroups]
  );

  const handleOpenVocabModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = vocabGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveVocabGroupId(matched ? matched.groupId : vocabGroups[0]?.groupId ?? null);
      } else {
        setActiveVocabGroupId(vocabGroups[0]?.groupId ?? null);
      }
      setIsVocabModalOpen(true);
    },
    [vocabGroups]
  );

  const handleOpenKitabahModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = kitabahGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveKitabahGroupId(matched ? matched.groupId : kitabahGroups[0]?.groupId ?? null);
      } else {
        setActiveKitabahGroupId(kitabahGroups[0]?.groupId ?? null);
      }
      setIsKitabahModalOpen(true);
    },
    [kitabahGroups]
  );

  const handleOpenSarfNahwModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = sarfNahwGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveSarfNahwGroupId(matched ? matched.groupId : sarfNahwGroups[0]?.groupId ?? null);
      } else {
        setActiveSarfNahwGroupId(sarfNahwGroups[0]?.groupId ?? null);
      }
      setIsSarfNahwModalOpen(true);
    },
    [sarfNahwGroups]
  );

  const handleOpenIkhtibarModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = ikhtibarGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveIkhtibarGroupId(matched ? matched.groupId : ikhtibarGroups[0]?.groupId ?? null);
      } else {
        setActiveIkhtibarGroupId(ikhtibarGroups[0]?.groupId ?? null);
      }
      setIsIkhtibarModalOpen(true);
    },
    [ikhtibarGroups]
  );

  const handleOpenTarjamaInshaModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = tarjamaInshaGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveTarjamaInshaGroupId(
          matched ? matched.groupId : tarjamaInshaGroups[0]?.groupId ?? null
        );
      } else {
        setActiveTarjamaInshaGroupId(tarjamaInshaGroups[0]?.groupId ?? null);
      }
      setIsTarjamaInshaModalOpen(true);
    },
    [tarjamaInshaGroups]
  );

  const handleOpenBanglaMcqModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = banglaMcqGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveBanglaMcqGroupId(
          matched ? matched.groupId : banglaMcqGroups[0]?.groupId ?? null
        );
      } else {
        setActiveBanglaMcqGroupId(banglaMcqGroups[0]?.groupId ?? null);
      }
      setIsBanglaMcqModalOpen(true);
    },
    [banglaMcqGroups]
  );

  const handleOpenBanglaCqModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = banglaCqGroups.find((g) => g.groupId === specificQuestion.groupId);
        setActiveBanglaCqGroupId(
          matched ? matched.groupId : banglaCqGroups[0]?.groupId ?? null
        );
      } else {
        setActiveBanglaCqGroupId(banglaCqGroups[0]?.groupId ?? null);
      }
      setIsBanglaCqModalOpen(true);
    },
    [banglaCqGroups]
  );

  const handleOpenBangla2ndSscWrittenModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = bangla2ndSscWrittenGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveBangla2ndSscWrittenGroupId(
          matched ? matched.groupId : bangla2ndSscWrittenGroups[0]?.groupId ?? null
        );
      } else {
        setActiveBangla2ndSscWrittenGroupId(
          bangla2ndSscWrittenGroups[0]?.groupId ?? null
        );
      }
      setIsBangla2ndSscWrittenModalOpen(true);
    },
    [bangla2ndSscWrittenGroups]
  );

  const handleOpenBangla2ndHscGrammarModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = bangla2ndHscGrammarGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveBangla2ndHscGrammarGroupId(
          matched ? matched.groupId : bangla2ndHscGrammarGroups[0]?.groupId ?? null
        );
      } else {
        setActiveBangla2ndHscGrammarGroupId(
          bangla2ndHscGrammarGroups[0]?.groupId ?? null
        );
      }
      setIsBangla2ndHscGrammarModalOpen(true);
    },
    [bangla2ndHscGrammarGroups]
  );

  const handleOpenBangla2ndHscNirmitiModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = bangla2ndHscNirmitiGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveBangla2ndHscNirmitiGroupId(
          matched ? matched.groupId : bangla2ndHscNirmitiGroups[0]?.groupId ?? null
        );
      } else {
        setActiveBangla2ndHscNirmitiGroupId(
          bangla2ndHscNirmitiGroups[0]?.groupId ?? null
        );
      }
      setIsBangla2ndHscNirmitiModalOpen(true);
    },
    [bangla2ndHscNirmitiGroups]
  );

  const handleOpenAqaidFiqhWrittenModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = aqaidFiqhWrittenGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveAqaidFiqhWrittenGroupId(
          matched ? matched.groupId : aqaidFiqhWrittenGroups[0]?.groupId ?? null
        );
      } else {
        setActiveAqaidFiqhWrittenGroupId(
          aqaidFiqhWrittenGroups[0]?.groupId ?? null
        );
      }
      setIsAqaidFiqhWrittenModalOpen(true);
    },
    [aqaidFiqhWrittenGroups]
  );

  const handleOpenAlimFiqhModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = alimFiqhGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveAlimFiqhGroupId(
          matched ? matched.groupId : alimFiqhGroups[0]?.groupId ?? null
        );
      } else {
        setActiveAlimFiqhGroupId(alimFiqhGroups[0]?.groupId ?? null);
      }
      setIsAlimFiqhModalOpen(true);
    },
    [alimFiqhGroups]
  );

  const handleOpenAlimAr2QawaidModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = alimAr2QawaidGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveAlimAr2QawaidGroupId(
          matched ? matched.groupId : alimAr2QawaidGroups[0]?.groupId ?? null
        );
      } else {
        setActiveAlimAr2QawaidGroupId(alimAr2QawaidGroups[0]?.groupId ?? null);
      }
      setIsAlimAr2QawaidModalOpen(true);
    },
    [alimAr2QawaidGroups]
  );

  const handleOpenAlimAr2TarjamaModal = useCallback(
    (specificQuestion?: QuestionData) => {
      if (specificQuestion) {
        const matched = alimAr2TarjamaGroups.find(
          (g) => g.groupId === specificQuestion.groupId
        );
        setActiveAlimAr2TarjamaGroupId(
          matched ? matched.groupId : alimAr2TarjamaGroups[0]?.groupId ?? null
        );
      } else {
        setActiveAlimAr2TarjamaGroupId(alimAr2TarjamaGroups[0]?.groupId ?? null);
      }
      setIsAlimAr2TarjamaModalOpen(true);
    },
    [alimAr2TarjamaGroups]
  );

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleUndo = useCallback(() => {
    if (undo()) {
      showToast('পূর্বাবস্থায় ফেরত নেওয়া হয়েছে (Undo)');
    }
  }, [undo, showToast]);

  const handleRedo = useCallback(() => {
    if (redo()) {
      showToast('পুনরায় প্রয়োগ করা হয়েছে (Redo)');
    }
  }, [redo, showToast]);

  const handleAutoRenumber = useCallback(() => {
    if (questions.length === 0) {
      showToast('নম্বর সাজানোর মতো কোনো প্রশ্ন নেই।');
      return;
    }
    autoRenumberQuestions();
    showToast('সকল প্রশ্ন ক্রমানুসারে সাজানো হয়েছে (Undo: Ctrl+Z)');
  }, [questions.length, autoRenumberQuestions, showToast]);

  const handleStripAllHarakat = useCallback(() => {
    if (questions.length === 0) {
      showToast('হরকত সরানোর মতো কোনো প্রশ্ন নেই।');
      return;
    }
    stripAllHarakat();
    showToast('সকল প্রশ্নের আরবি হরকত/তাশকিল সরানো হয়েছে (Undo: Ctrl+Z)');
  }, [questions.length, stripAllHarakat, showToast]);

  // Global Keyboard Shortcuts: Ctrl/Cmd+Z (Undo) and Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z (Redo)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;

      // Let native typing undo/redo work normally while editing inside inputs or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        if (past.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        if (future.length > 0) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [past.length, future.length, handleUndo, handleRedo]);

  // API Key Check
  const [hasApiKey, setHasApiKey] = useState(false);
  const checkKey = useCallback(() => {
    const p = getActiveAiProvider();
    const hasKey = p === 'gemini' ? Boolean(getStoredGeminiKey()) : Boolean(getStoredOpenRouterKey());
    setHasApiKey(hasKey);
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  // Handle Wizard Completion
  const handleWizardComplete = (config: {
    stream: EducationStream;
    grade: string;
    subject: string;
    subjectCode?: string;
    institutionName: string;
    examTitle: string;
    timeAllowed: string;
    totalMarks: number;
    bismillahText?: string;
    banglaPaperMode?: BanglaPaperMode;
    setCode?: string;
  }) => {
    const isArabic2nd =
      config.subject.includes('আরবি ২য়') ||
      config.subject.includes('আরবি দ্বিতীয়') ||
      config.subject.includes('قواعد اللغة العربية') ||
      config.subject.includes('الورقة الثانية') ||
      config.subject.includes('الأدب العربي') ||
      config.subject.includes('কাওয়াইদুল') ||
      config.subjectCode === '১৩৪' ||
      config.subjectCode === '২০৬';

    const isAlimAr2 = isAlimArabic2ndPaper(config.subject, config.subjectCode, config.grade);

    const isArabic1st =
      !isArabic2nd &&
      (config.subject.includes('আরবি ১ম') ||
        config.subject.includes('الإتصالية') ||
        config.subject.includes('اللغة العربية') ||
        config.subjectCode === '১৩৩');

    const hasBengali = (str?: string) => Boolean(str && /[\u0980-\u09FF]/.test(str));

    // Handle Alim Arabic 2nd Paper (Code 206) Empty Paper with Arabic Header
    if (isAlimAr2) {
      loadFullPaper({
        headerConfig: {
          institutionName:
            !config.institutionName || hasBengali(config.institutionName)
              ? 'بهيربهيري عالم مدرسة - تاكورغاو'
              : config.institutionName,
          examTitle:
            !config.examTitle || hasBengali(config.examTitle)
              ? 'امتحان العالم - ٢٠٢٦'
              : config.examTitle,
          grade:
            !config.grade || hasBengali(config.grade)
              ? config.grade?.includes('১ম')
                ? 'الصف الأول من العالم'
                : 'الصف الثاني من العالم'
              : config.grade,
          subject: 'الأدب العربي - الورقة الثانية (القواعد والترجمة والإنشاء)',
          subjectCode: '২০৬',
          timeAllowed:
            !config.timeAllowed || hasBengali(config.timeAllowed)
              ? 'ثلاث ساعات'
              : config.timeAllowed,
          totalMarks: 100,
          headerSize: 'compact',
          bismillahText: undefined,
          educationStream: 'ALIA',
          headerPreset: 'ALIA',
          generalInstructions: [],
        },
        layoutConfig: {
          columns: 1,
          numberingFormat: 'ar',
          fontSize: 'standard',
          paperSize: 'A4',
          arabicFont: 'Traditional Arabic',
        },
        sections: [],
        questions: [],
      });

      setActiveTab('insert');
      showToast('আলিম আরবি ২য় পত্র (الأدب العربي - الورقة الثانية : কোড ২০৬) প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।');
      return;
    }

    // Handle Arabic 2nd Paper (Dakhil 10th / 9th) Empty Paper with Arabic Header
    if (isArabic2nd) {
      loadFullPaper({
        headerConfig: {
          institutionName:
            !config.institutionName || hasBengali(config.institutionName)
              ? 'بهيربهيري عالم مدرسة - تاكورغاو'
              : config.institutionName,
          examTitle:
            !config.examTitle || hasBengali(config.examTitle)
              ? 'الإمتحان التَّأهيلي - ٢٠٢٦'
              : config.examTitle,
          grade:
            !config.grade || hasBengali(config.grade)
              ? 'الصف العاشر من الداخل'
              : config.grade,
          subject: 'قواعد اللغة العربية',
          subjectCode: '১৩৪',
          timeAllowed:
            !config.timeAllowed || hasBengali(config.timeAllowed)
              ? 'ثلاث ساعات'
              : config.timeAllowed,
          totalMarks: 100,
          headerSize: 'compact',
          bismillahText: undefined,
          educationStream: 'ALIA',
          headerPreset: 'ALIA',
          generalInstructions: ['الملاحظة: إجابة كل سؤال لازمة باللغة العربية'],
        },
        layoutConfig: {
          columns: 2,
          numberingFormat: 'ar',
          fontSize: 'standard',
          paperSize: 'A4',
          arabicFont: 'Traditional Arabic',
        },
        sections: [],
        questions: [],
      });

      setActiveTab('insert');
      showToast('আরবি ২য় পত্র (কাওয়াইদুল লুগাতিল আরাবিয়্যাহ) এর হেডার প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।');
      return;
    }

    // Handle Arabic 1st Paper (Dakhil 10th / 9th) Empty Paper with Arabic Header
    if (isArabic1st) {
      loadFullPaper({
        headerConfig: {
          institutionName: (!config.institutionName || hasBengali(config.institutionName))
            ? 'بهيربهيري عالم مدرسة - تاكورغاو'
            : config.institutionName,
          examTitle: (!config.examTitle || hasBengali(config.examTitle))
            ? 'الإمتحان التَّأهيلي - ٢٠٢٦'
            : config.examTitle,
          grade: (!config.grade || hasBengali(config.grade))
            ? 'الصف العاشر من الداخل'
            : config.grade,
          subject: 'اللغة العربية الإتصالية',
          subjectCode: '১৩৩',
          timeAllowed: (!config.timeAllowed || hasBengali(config.timeAllowed))
            ? 'ثلاث ساعات'
            : config.timeAllowed,
          totalMarks: 100,
          headerSize: 'compact',
          bismillahText: undefined,
          educationStream: 'ALIA',
          headerPreset: 'ALIA',
          generalInstructions: ['الملاحظة: إجابة كل سؤال لازمة باللغة العربية'],
        },
        layoutConfig: {
          columns: 2,
          numberingFormat: 'ar',
          fontSize: 'standard',
          paperSize: 'A4',
          arabicFont: 'Traditional Arabic',
        },
        sections: [],
        questions: [],
      });

      setActiveTab('insert');
      showToast('আরবি ১ম পত্র (আল-লুগাতুল আরাবিয়্যাতুল ইত্তিসালিয়্যাহ) এর হেডার প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।');
      return;
    }

    const preset: HeaderPreset =
      config.stream === 'QAWMI'
        ? 'QAWMI'
        : config.stream === 'NOORANI'
        ? 'NOORANI'
        : config.stream === 'ALIA'
        ? 'ALIA'
        : 'NCTB';

    applyHeaderPreset(preset);

    const isBangla2nd = isBangla2ndPaper(config.subject, config.subjectCode);
    const isAlimQuran = isAlimQuranPaper(config.subject, config.subjectCode, config.grade);
    const isDakhilQuran = isDakhilQuranTajweed(config.subject, config.subjectCode, config.grade);
    const isBangla1st =
      !isBangla2nd &&
      !isDakhilQuran &&
      !isAlimQuran &&
      isBangla1stPaper(config.subject, config.subjectCode);
    const isAqaidFiqh = isDakhilAqaidFiqh(config.subject, config.subjectCode);
    const isAlimFiqh = isAlimFiqhPaper(config.subject, config.subjectCode);
    const banglaModeInfo = isDakhilQuran
      ? getDakhilQuranInstructions(config.banglaPaperMode || 'COMBINED_100')
      : isAlimQuran
      ? getAlimQuranInstructions()
      : isBangla1st
      ? getBanglaInstructionsByMode(config.banglaPaperMode || 'COMBINED_100', config.grade)
      : isBangla2nd
      ? getBangla2ndInstructions(config.banglaPaperMode || 'COMBINED_100', config.grade)
      : isAqaidFiqh
      ? getAqaidFiqhInstructions(config.banglaPaperMode || 'COMBINED_100')
      : isAlimFiqh
      ? getAlimFiqhInstructions(isAlimFiqh2nd(config.subject, config.subjectCode))
      : null;

    const isSingleColPaper =
      (isBangla2nd && isHscOrAlimGrade(config.grade)) || isAlimFiqh || isAlimQuran;

    if (isAlimQuran) {
      const alimQuranMeta = getAlimQuranInstructions();
      loadFullPaper({
        headerConfig: {
          institutionName:
            !config.institutionName || hasBengali(config.institutionName)
              ? 'بهيربهيري عالم مدرسة - تاكورغاو'
              : config.institutionName,
          examTitle:
            !config.examTitle || hasBengali(config.examTitle)
              ? 'امتحان العالم - ٢٠٢٦'
              : config.examTitle,
          grade:
            !config.grade || hasBengali(config.grade)
              ? config.grade?.includes('২য়') || config.grade?.includes('২য়')
                ? 'الصف الثاني من العالم'
                : 'الصف الأول من العالم'
              : config.grade,
          subject: 'القرآن المجيد',
          subjectCode: '২০১',
          timeAllowed:
            !config.timeAllowed || hasBengali(config.timeAllowed)
              ? 'ثلاث ساعات'
              : config.timeAllowed,
          totalMarks: 100,
          headerSize: 'compact',
          bismillahText: undefined,
          educationStream: 'ALIA',
          headerPreset: 'ALIA',
          generalInstructions: alimQuranMeta.generalInstructions,
        },
        layoutConfig: {
          columns: 1,
          numberingFormat: 'ar',
          fontSize: 'standard',
          paperSize: 'A4',
          arabicFont: 'Traditional Arabic',
        },
        sections: [],
        questions: [],
      });

      setActiveTab('insert');
      showToast('আলিম আল কুরআন মাজিদ (القرآن المجيد : কোড ২০১) প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।');
      return;
    }

    if (isAlimFiqh) {
      const is2ndFiqh = isAlimFiqh2nd(config.subject, config.subjectCode);
      loadFullPaper({
        headerConfig: {
          institutionName:
            !config.institutionName || hasBengali(config.institutionName)
              ? 'بهيربهيري عالم مدرسة - تاكورغاو'
              : config.institutionName,
          examTitle:
            !config.examTitle || hasBengali(config.examTitle)
              ? 'الإمتحان السنوي للعالم - ٢٠٢٦'
              : config.examTitle,
          grade:
            !config.grade || hasBengali(config.grade)
              ? config.grade?.includes('২য়') || config.grade?.includes('২য়')
                ? 'الصف الثاني من العالم'
                : 'الصف الأول من العالم'
              : config.grade,
          subject: is2ndFiqh ? 'الفقه الثاني' : 'الفقه الأول',
          subjectCode: is2ndFiqh ? '২০৪' : '২০৩',
          timeAllowed:
            !config.timeAllowed || hasBengali(config.timeAllowed)
              ? 'ثلاث ساعات'
              : config.timeAllowed,
          totalMarks: 100,
          headerSize: 'compact',
          bismillahText: undefined,
          educationStream: 'ALIA',
          headerPreset: 'ALIA',
          generalInstructions: [],
        },
        layoutConfig: {
          columns: 1,
          numberingFormat: 'ar',
          fontSize: 'standard',
          paperSize: 'A4',
          arabicFont: 'Traditional Arabic',
        },
        sections: [],
        questions: [],
      });

      setActiveTab('insert');
      showToast(
        is2ndFiqh
          ? 'আল ফিকহ ২য় পত্র (الفقه الثاني) এর আরবি হেডার প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।'
          : 'আল ফিকহ ১ম পত্র (الفقه الأول) এর আরবি হেডার প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।'
      );
      return;
    }

    loadFullPaper({
      headerConfig: {
        institutionName: config.institutionName,
        examTitle: config.examTitle,
        subject: config.subject,
        subjectCode:
          config.subjectCode ||
          (isBangla1st
            ? config.stream === 'ALIA'
              ? '১৩৫'
              : '১০১'
            : isBangla2nd
            ? config.stream === 'ALIA'
              ? '১৩৬'
              : '১০২'
            : isAqaidFiqh
            ? '১০৩'
            : isAlimFiqh
            ? isAlimFiqh2nd(config.subject, config.subjectCode)
              ? '২০৪'
              : '২০৩'
            : undefined),
        grade: config.grade,
        timeAllowed: config.timeAllowed || banglaModeInfo?.timeAllowed || '৩ ঘণ্টা',
        totalMarks: config.totalMarks || banglaModeInfo?.totalMarks || 100,
        educationStream: config.stream,
        bismillahText: undefined,
        headerSize: isBangla1st || isBangla2nd || isAqaidFiqh || isAlimFiqh ? 'compact' : 'standard',
        generalInstructions: banglaModeInfo
          ? banglaModeInfo.generalInstructions
          : [
              'সকল প্রশ্নের মান সমান।',
              'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক।',
            ],
      },
      layoutConfig: {
        columns: isSingleColPaper ? 1 : 2,
        numberingFormat: 'bn',
        fontSize: 'standard',
      },
      sections: [],
      questions: [],
    });

    setActiveTab('insert');
    showToast(`${config.subject} এর হেডার প্রস্তুত হয়েছে! ইনসার্ট মেনু থেকে প্রশ্ন যোগ করুন।`);
  };

  // 1-Click Load PDF Board Exam Preset
  const handleLoadArabicPdfPreset = () => {
    loadFullPaper({
      headerConfig: dakhilArabic1stPaperHeader,
      layoutConfig: dakhilArabic1stPaperLayout,
      sections: dakhilArabic1stPaperSections,
      questions: dakhilArabic1stPaperQuestions,
    });
    showToast('দাখিল ১০ম শ্রেণির আরবি ১ম পত্রের ১০০ নম্বরের সম্পূর্ণ বোর্ড মডেল প্রশ্নপত্র (PDF নমুনা) লোড হয়েছে!');
  };

  // Insert Template Question based on Typology
  const handleInsertQuestion = (typology: QuestionTypology) => {
    const isArabic =
      headerConfig.subject?.includes('আরবি') ||
      headerConfig.subject?.includes('العربية') ||
      layoutConfig.numberingFormat === 'ar';
    let newQ: QuestionData;

    if (typology === 'SPACER') {
      newQ = {
        subject: headerConfig.subject || 'সাধারণ',
        grade: headerConfig.grade || '১০ম শ্রেণি',
        typology: 'SPACER',
        customNumber: '',
        customMarksText: '',
        stemOrPassage: '',
        marks: 0,
        spacingTop: 10,
        spacingBottom: 10,
        difficulty: 'Easy',
        languages: isArabic ? ['ar'] : ['bn'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'SECTION_TITLE' || (typology === 'GROUP_TITLE' && !isArabic)) {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: isArabic ? '(ألف) النص المدروس' : 'ক-বিভাগ : সৃজনশীল প্রশ্ন',
        customMarksText: isArabic ? 'الدرجات - ٣٠' : 'মান: ৩০',
        marks: 30,
        difficulty: 'Medium',
        languages: isArabic ? ['ar'] : ['bn'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'GROUP_TITLE') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        customNumber: '٢.',
        stemOrPassage: 'أجب عن أي أربعة من الأسئلة الآتية :',
        customMarksText: '(٤ × ٤ = ١٦)',
        marks: 16,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'PASSAGE_ONLY') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'PASSAGE_ONLY',
        topic: 'اقرأ النص التالي ثم أجب عن الأسئلة الملحقة به :',
        stemOrPassage:
          'هُوَ النُّعْمَانُ بْنُ ثَابِتٍ وَكُنْيَتُهُ أَبُو حَنِيفَةَ وَلُقِّبَ بِالإِمَامِ الأَعْظَمِ، وُلِدَ بِالْكُوفَةِ سَنَةَ ثَمَانِينَ مِنَ الْهِجْرَةِ فِي عَهْدِ الْخَلِيفَةِ عَبْدِ الْمَلِكِ بْنِ مَرْوَانَ، كَانَ مِنْ سِيَمَاهُ أَنَّهُ كَانَ طَوِيلَ الصَّمْتِ دَائِمَ الْفِكْرِ...',
        marks: 0,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'PASSAGE_QA') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'PASSAGE_QA',
        customNumber: '١.',
        customMarksText: '٢×٤= ٨',
        stemOrPassage: 'أجب عن الأسئلة التالية باللغة العربية :',
        subQuestions: [
          { part: 'أ' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: 'ما اسم الإمام أبي حنيفة وماذا لقبه؟', marks: 2 },
          { part: 'ب' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'أين ولد الإمام أبو حنيفة ومتى؟', marks: 2 },
          { part: 'ج' as any, bloomLevel: 'application', bloomTitle: '', questionText: 'اذكر بعض أوصاف الإمام أبي حنيفة.', marks: 2 },
          { part: 'د' as any, bloomLevel: 'higher_order', bloomTitle: '', questionText: 'بم اشتهر الإمام أبو حنيفة؟', marks: 2 },
        ],
        marks: 8,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'PASSAGE_GROUP') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'PASSAGE_GROUP',
        customNumber: '١.',
        customMarksText: '٢×٤= ٨',
        stemOrPassage:
          'اقرأ النص التالي ثم أجب عن الأسئلة الملحقة باللغة العربية:\nهُوَ النُّعْمَانُ بْنُ ثَابِتٍ وَكُنْيَتُهُ أَبُو حَنِيفَةَ وَلُقِّبَ بِالإِمَامِ الأَعْظَمِ، وُلِدَ بِالْكُوفَةِ سَنَةَ ثَمَانِينَ مِنَ الْهِجْرَةِ فِي عَهْدِ الْخَلِيفَةِ عَبْدِ الْمَلِكِ بْنِ مَرْوَانَ...\n\nأجب عن الأسئلة التالية باللغة العربية :',
        subQuestions: [
          { part: 'أ' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: 'ما اسم الإمام أبي حنيفة وماذا لقبه؟', marks: 2 },
          { part: 'ب' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'أين ولد الإمام أبو حنيفة ومتى؟', marks: 2 },
          { part: 'ج' as any, bloomLevel: 'application', bloomTitle: '', questionText: 'اذكر بعض أوصاف الإمام أبي حنيفة.', marks: 2 },
          { part: 'د' as any, bloomLevel: 'higher_order', bloomTitle: '', questionText: 'بم اشتهر الإمام أبو حنيفة؟', marks: 2 },
        ],
        marks: 8,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'TRUE_FALSE') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'TRUE_FALSE',
        customNumber: 'أ.',
        customMarksText: '١×٤= ٤',
        stemOrPassage: 'اكتب (صحيح) إذا كانت العبارة صحيحة أو (خطأ) إذا كانت العبارة خاطئة مع تصحيح الخطأ:',
        subQuestions: [
          { part: 'الف' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'ولد الإمام أبو حنيفة فى عهد الخليفة عبد الملك ابن مروان.', marks: 1 },
          { part: 'ب' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'حفظ أبو حنيفة القرآن الكريم فى كبره.', marks: 1 },
          { part: 'ج' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'كان الإمام أبو حنيفة طويل الصمت ودائم الفكر.', marks: 1 },
          { part: 'د' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'خرج الإمام أبو حنيفة لأداء الحج حين بلغ السابعة من عمره.', marks: 1 },
        ],
        marks: 4,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'FILL_BLANKS') {
      newQ = isArabic
        ? {
            subject: headerConfig.subject || 'اللغة العربية الإتصالية',
            grade: headerConfig.grade || 'الصف العاشر من الداخل',
            typology: 'FILL_BLANKS',
            customNumber: '٧.',
            customMarksText: '٢×٥= ١٠',
            stemOrPassage: 'املاً الفراغ في الجمل الآتية بكلمة مناسبة من الصندوق:',
            wordClues: ['نزلت', 'أطول', 'النصف', 'مبين', 'ابن كثير'],
            subQuestions: [
              { part: 'أ' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'قرأ نعمان القرآن ساعة و .......... تقريبا.', marks: 2 },
              { part: 'ب' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: 'المصنف لتفسير القرآن العظيم ..........', marks: 2 },
              { part: 'ج' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'السور المدنية .......... بعد الهجرة ولو في غير المدينة.', marks: 2 },
              { part: 'د' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: '.......... سورة في القرآن الكريم هي سورة البقرة.', marks: 2 },
              { part: 'هـ' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: 'نزل الله القرآن الكريم بلسان عربي ..........', marks: 2 },
            ],
            marks: 10,
            difficulty: 'Medium',
            languages: ['ar'],
            sourceType: 'MANUAL',
          }
        : {
            subject: headerConfig.subject || 'বাংলা ১ম পত্র',
            grade: headerConfig.grade || '১০ম শ্রেণি',
            typology: 'FILL_BLANKS',
            stemOrPassage: 'উপযুক্ত শব্দ বসিয়ে নিচের শূন্যস্থানগুলো পূরণ করো:\n(ক) বাক্য ১ ..........।\n(খ) বাক্য ২ ..........।',
            marks: 5,
            difficulty: 'Medium',
            languages: ['bn'],
            sourceType: 'MANUAL',
          };
    } else if (typology === 'QAWAID_MISAL') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'QAWAID_MISAL',
        customNumber: 'د.',
        customMarksText: '١×٤= ٤',
        stemOrPassage: 'هات مرادف الكلمات الآتية (أو استبدل العدد):',
        subQuestions: [
          { part: 'أ' as any, bloomLevel: 'knowledge', bloomTitle: '', questionText: 'الأعظم، صالحة، زيارة، حسن.', marks: 4 },
        ],
        marks: 4,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'DIALOGUE') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'DIALOGUE',
        customNumber: '٩.',
        customMarksText: '١×١٠= ١٠',
        stemOrPassage: 'اكتب حوارا واحدا بعشر جمل على الأقل من الموضوع التالي:',
        subQuestions: [
          { part: 'أ' as any, bloomLevel: 'application', bloomTitle: '', questionText: 'الرحلة إلى مكة المكرمة.', marks: 10 },
          { part: 'ب' as any, bloomLevel: 'application', bloomTitle: '', questionText: 'البيع والشراء.', marks: 10 },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'PARAGRAPH_WRITING') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'PARAGRAPH_WRITING',
        customNumber: '١٠.',
        customMarksText: '١×١٠= ١٠',
        stemOrPassage:
          'اكتب فقرة عن "حب الوطن" على أساس الأجوبة من الأسئلة التالية:\n(أ) ما معنى حب الوطن؟\n(ب) ما هي اهمية حب الوطن؟\n(ج) ما هي طرق إظهار حب الوطن؟\n\nأو- اكتب فقرة عن "العدل والإنصاف" على أساس الأجوبة من الأسئلة التالية:\n(أ) ما معنى العدل والإنصاف؟\n(ب) بين أهمية العدل والإنصاف.\n(ج) اذكر بعض الآيات القرآنية والأحاديث النبوية عن العدل والإنصاف.',
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'POETRY_EXPLANATION') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'POETRY_EXPLANATION',
        customNumber: '٦.',
        customMarksText: '٥×١= ٥',
        stemOrPassage: 'اشرح الأبيات التالية (واحدا فقط):',
        subQuestions: [
          { part: 'أ' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'لأُمِّكَ حَقٌّ لَوْ عَلِمْتَ كَبِيرُ * كَثِيرُكَ يَا هَذَا لَدَيْهِ يَسِيرُ', marks: 5 },
          { part: 'ب' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'وَقِيمَةُ الْمَرْءِ مَا قَدْ كَانَ يُحْسِنُهُ * وَلِلرِّجَالِ عَلَى الأَفْعَالِ أَسْمَاءُ', marks: 5 },
          { part: 'ج' as any, bloomLevel: 'comprehension', bloomTitle: '', questionText: 'النَّاسُ مِنْ جِهَةِ التِّمْثَالِ أَكْفَاءُ * أَبُوهُمُ آدَمُ وَالأُمُّ حَوَّاءُ', marks: 5 },
        ],
        marks: 5,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'TARJAMA_TASHREEH') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'TARJAMA_TASHREEH',
        customNumber: '١١.',
        customMarksText: '٢×٥= ١٠',
        stemOrPassage: 'ترجم إلى البنغالية:',
        subQuestions: [
          {
            part: 'أ' as any,
            bloomLevel: 'application',
            bloomTitle: '',
            questionText:
              'إِنَّ سَيِّدَنَا عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ ثَانِي الْخُلَفَاءِ الرَّاشِدِينَ، وَأَحَدُ الْعَشَرَةِ الْمُبَشَّرَةِ بِالْجَنَّةِ. كَانَ مِثَالاً لِلشَّجَاعَةِ، وَالشَّهَامَةِ، وَالْعَدْلِ وَالإِنْصَافِ، وَالزُّهْدِ وَالاِسْتِقَامَةِ فِي إِيصَالِ الْخَيْرِ إِلَى كُلِّ فَرْدٍ مِنْ أَفْرَادِ الرَّعِيَّةِ.',
            marks: 5,
          },
          {
            part: 'ب' as any,
            bloomLevel: 'application',
            bloomTitle: '',
            questionText:
              'عَلَى الْمُسْلِمِ أَنْ يُخْلِصَ النِّيَّةَ فِي كُلِّ عَمَلٍ يَقُومُ بِهِ حَتَّى يَتَقَبَّلَهُ اللَّهُ مِنْهُ؛ لأَنَّ الأَعْمَالَ لا تُقْبَلُ إِلا بِشَرْطَيْنِ: الإِخْلاصُ وَالْمُتَابَعَةُ لِلرَّسُولِ ﷺ.',
            marks: 5,
          },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['ar', 'bn'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'TAHQEEQ_SIGHA') {
      newQ = {
        subject: headerConfig.subject || 'اللغة العربية الإتصالية',
        grade: headerConfig.grade || 'الصف العاشر من الداخل',
        typology: 'TAHQEEQ_SIGHA',
        customNumber: '٣.',
        customMarksText: '٢×٣= ٦',
        stemOrPassage: 'حقق الكلمات الآتية (الصيغة، البحث، الباب، المادة، المعنى):',
        tahqeeqWords: [
          {
            lafz: 'نَصَرَ',
            sigha: 'واحد مذكر غائب',
            bahas: 'إثبات فعل ماض معروف',
            baab: 'نصر ينصر',
            maddah: 'ن-ص-ر',
            meaning: 'সে সাহায্য করল',
          },
          {
            lafz: 'يَعْلَمُونَ',
            sigha: 'جمع مذكر غائب',
            bahas: 'إثبات فعل مضارع معروف',
            baab: 'سمع يسمع',
            maddah: 'ع-ل-م',
            meaning: 'তারা জানে',
          },
        ],
        marks: 6,
        difficulty: 'Hard',
        languages: ['ar', 'bn'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'SIMPLE_MCQ') {
      newQ = {
        subject: headerConfig.subject || 'সাধারণ',
        grade: headerConfig.grade || '১০ম শ্রেণি',
        typology: 'SIMPLE_MCQ',
        stemOrPassage: 'নিচের কোনটি সঠিক উত্তর?',
        options: [
          { label: 'ক', text: 'অপশন ১', isCorrect: true },
          { label: 'খ', text: 'অপশন ২', isCorrect: false },
          { label: 'গ', text: 'অপশন ৩', isCorrect: false },
          { label: 'ঘ', text: 'অপশন ৪', isCorrect: false },
        ],
        marks: 1,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
      };
    } else if (typology === 'CQ') {
      newQ = {
        subject: headerConfig.subject || 'বাংলা ১ম পত্র',
        grade: headerConfig.grade || '১০ম শ্রেণি',
        typology: 'CQ',
        stemOrPassage: 'উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর যথাযথ উত্তর দাও:',
        subQuestions: [
          { part: 'ক', bloomLevel: 'knowledge', bloomTitle: 'জ্ঞানমূলক', questionText: 'জ্ঞানমূলক প্রশ্ন লিখুন...', marks: 1 },
          { part: 'খ', bloomLevel: 'comprehension', bloomTitle: 'অনুধাবনমূলক', questionText: 'অনুধাবনমূলক প্রশ্ন লিখুন...', marks: 2 },
          { part: 'গ', bloomLevel: 'application', bloomTitle: 'প্রয়োগমূলক', questionText: 'প্রয়োগমূলক প্রশ্ন লিখুন...', marks: 3 },
          { part: 'ঘ', bloomLevel: 'higher_order', bloomTitle: 'উচ্চতর দক্ষতা', questionText: 'উচ্চতর দক্ষতা প্রশ্ন লিখুন...', marks: 4 },
        ],
        marks: 10,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
      };
    } else {
      newQ = {
        subject: headerConfig.subject || 'সাধারণ',
        grade: headerConfig.grade || 'দাখিল ৯ম শ্রেণি',
        typology: 'DESCRIPTIVE',
        stemOrPassage: 'সংক্ষেপে উত্তর দাও: আল-কুরআনের মোট সূরার সংখ্যা কত এবং এটি কত বছরে অবতীর্ণ হয়েছিল?',
        marks: 5,
        difficulty: 'Easy',
        languages: ['bn'],
        sourceType: 'MANUAL',
      };
    }

    // Default to the first section if sections exist
    if (sections.length > 0) {
      newQ.sectionId = sections[0].id;
    }

    addQuestion(newQ);
    showToast(`নতুন প্রশ্ন যুক্ত হয়েছে! পেপারে ক্লিক করে সরাসরি এডিট করুন।`);
  };

  // Insert New Section
  const handleInsertSection = () => {
    const nextOrder = sections.length + 1;
    const name =
      nextOrder === 1
        ? 'ক-বিভাগ : বহুনির্বাচনী প্রশ্ন'
        : nextOrder === 2
        ? 'খ-বিভাগ : সংক্ষিপ্ত প্রশ্ন'
        : `বিভাগ ${nextOrder} : রচনামূলক প্রশ্ন`;

    addSection({
      name,
      instructions: 'নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৪টি প্রশ্নের উত্তর দাও:',
      requiredCount: 4,
      marksPerQuestion: 10,
    });
    showToast(`নতুন বিভাগ "${name}" যুক্ত হয়েছে!`);
  };

  // Build standalone client-rendered HTML matching preview 100% for PDF conversion
  const buildClientRenderedHtml = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const pageEls = document.querySelectorAll('.proshno-a4-page');
    if (pageEls.length === 0) return undefined;

    const isArabicPaper =
      layoutConfig.numberingFormat === 'ar' ||
      Boolean(headerConfig.subject?.includes('আরবি')) ||
      Boolean(headerConfig.subject?.includes('العربية')) ||
      Boolean(headerConfig.subject?.includes('Arabic'));

    const selectedArabicFont = layoutConfig.arabicFont || 'Traditional Arabic';
    const arabicFontFamily = `'${selectedArabicFont}', 'Traditional Arabic', 'Noto Naskh Arabic', 'Lateef', serif`;
    const paperLineHeight = String(layoutConfig.lineHeight ?? 1.5);
    const arabicLineHeight = paperLineHeight;

    const headerSize = headerConfig.headerSize || (isArabicPaper ? 'compact' : 'standard');
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

    const fontSizeMap = {
      compact: '11.5px',
      standard: '13.5px',
      large: '15.5px',
    };
    const currentFontSize = layoutConfig.customFontSizePt
      ? `${layoutConfig.customFontSizePt}pt`
      : (fontSizeMap[layoutConfig.fontSize] || '13.5px');

    // Clone each page and remove print:hidden elements
    const pagesHtml = Array.from(pageEls)
      .map((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        // Remove interactive toolbars, guidelines, drag listeners, and print-hidden elements
        clone.querySelectorAll('.print\\:hidden').forEach((item) => item.remove());
        clone.querySelectorAll('[contenteditable]').forEach((item) => {
          item.removeAttribute('contenteditable');
          item.removeAttribute('suppresscontenteditablewarning');
        });
        return clone.outerHTML;
      })
      .join('\n');

    // Extract all parsed CSS rules from document.styleSheets to preserve complete Tailwind & app styling
    let inlinedCss = '';
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = sheet.cssRules || (sheet as any).rules;
          if (rules) {
            for (const rule of Array.from(rules)) {
              inlinedCss += rule.cssText + '\n';
            }
          }
        } catch (e) {
          // Cross-origin stylesheet access protection
        }
      }
    } catch (e) {}

    // Also collect any existing <style> tags in document head
    const headStyleTags = Array.from(document.querySelectorAll('style'))
      .map((el) => el.outerHTML)
      .join('\n');

    const margins = layoutConfig.margins || {
      topMm: 14,
      bottomMm: 14,
      leftMm: 18,
      rightMm: 18,
    };

    const isLegal = layoutConfig.paperSize === 'Legal';
    const pageWidthMm = isLegal ? 215.9 : 210;
    const pageHeightMm = isLegal ? 355.6 : 297;

    return `<!DOCTYPE html>
<html lang="${isArabicPaper ? 'ar' : 'bn'}" dir="${isArabicPaper ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>${headerConfig.examTitle || 'Question Paper'} - ${headerConfig.subject || ''}</title>
  ${headStyleTags}
  <style id="proshno-inlined-app-css">
    ${inlinedCss}
  </style>
  <style id="proshno-pdf-overrides">
    @page {
      size: ${pageWidthMm}mm ${pageHeightMm}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
    }
    :root {
      --arabic-font-family: ${arabicFontFamily} !important;
      --paper-font-size: ${currentFontSize} !important;
      --paper-line-height: ${paperLineHeight} !important;
      --arabic-line-height: ${arabicLineHeight} !important;
    }
    html {
      font-size: 16px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }
    body {
      background: #ffffff !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
      width: ${pageWidthMm}mm !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
      font-family: ${isArabicPaper ? arabicFontFamily : "'Noto Serif Bengali', 'Times New Roman', serif"} !important;
      font-size: ${currentFontSize} !important;
      line-height: ${paperLineHeight} !important;
    }
    .proshno-a4-page {
      display: flex !important;
      flex-direction: column !important;
      width: ${pageWidthMm}mm !important;
      height: ${pageHeightMm}mm !important;
      min-height: ${pageHeightMm}mm !important;
      max-height: ${pageHeightMm}mm !important;
      padding-top: ${margins.topMm}mm !important;
      padding-bottom: ${margins.bottomMm}mm !important;
      padding-left: ${margins.leftMm}mm !important;
      padding-right: ${margins.rightMm}mm !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      break-after: page !important;
      position: relative !important;
      overflow: hidden !important;
      background: #ffffff !important;
      margin: 0 auto !important;
      font-family: ${isArabicPaper ? arabicFontFamily : "'Noto Serif Bengali', 'Times New Roman', serif"} !important;
      font-size: ${currentFontSize} !important;
      line-height: ${paperLineHeight} !important;
      box-shadow: none !important;
      border: none !important;
    }
    .proshno-a4-page:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .proshno-two-col-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
      column-gap: 22px !important;
      align-items: start !important;
      position: relative !important;
      flex: 1 1 0% !important;
      min-height: 0 !important;
    }
    .proshno-col-rule {
      position: absolute !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 1px !important;
      background-color: #cbd5e1 !important;
    }
    .proshno-col {
      min-width: 0 !important;
    }

    /* Exam institution header MUST be visible, centered and sized strictly to headerSize */
    header,
    .proshno-exam-header,
    .proshno-a4-page header {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      text-align: center !important;
      border-bottom: 2px solid #0f172a !important;
      padding-bottom: ${headerMetrics.containerPaddingBottom} !important;
      margin-bottom: ${headerMetrics.containerMarginBottom} !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
    }

    .proshno-exam-header .proshno-institution-name {
      font-size: ${headerMetrics.institutionFontSize} !important;
      line-height: ${headerMetrics.institutionLineHeight} !important;
      font-weight: 800 !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
      text-align: center !important;
    }

    .proshno-exam-header .proshno-exam-title {
      font-size: ${headerMetrics.examTitleFontSize} !important;
      line-height: ${headerMetrics.examTitleLineHeight} !important;
      font-weight: 700 !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
      text-align: center !important;
      text-decoration: none !important;
    }

    .proshno-exam-header .proshno-grade {
      font-size: ${headerMetrics.gradeFontSize} !important;
      line-height: ${headerMetrics.gradeLineHeight} !important;
      font-weight: 700 !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
      text-align: center !important;
    }

    .proshno-exam-header .proshno-subject-grade-row {
      font-size: ${headerMetrics.gradeFontSize} !important;
      font-weight: 600 !important;
    }

    .proshno-exam-header .proshno-meta-row {
      font-size: ${headerMetrics.metaRowFontSize} !important;
      font-weight: 700 !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
      border-top: none !important;
      padding-top: ${headerMetrics.metaRowPaddingTop} !important;
      margin-top: ${headerMetrics.metaRowMarginTop} !important;
    }

    .proshno-exam-header .proshno-general-instructions {
      font-size: ${headerMetrics.instructionsFontSize} !important;
      line-height: 1.3 !important;
      font-family: ${isArabicPaper ? arabicFontFamily : 'inherit'} !important;
      text-align: center !important;
    }

    /* Clean question items: strictly no dotted or dashed borders in preview or PDF */
    .proshno-a4-page [class*="group relative"],
    .exam-question-item {
      border: none !important;
      border-bottom: none !important;
      outline: none !important;
    }

    /* Section banners & Group titles: clean bold text, no background boxes, no borders */
    .exam-section-banner, [class*="section-banner"] {
      background: transparent !important;
      border: none !important;
      padding: 3px 0 !important;
      margin: 8px 0 3px 0 !important;
    }

    /* Arabic typography & RTL — 1:1 identical sizing with live preview (no 1.08em mismatch or em compounding) */
    .script-ar, .font-ar, [dir="rtl"] {
      font-family: ${arabicFontFamily} !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      font-synthesis: weight style !important;
    }
    .script-ar, .font-ar {
      font-size: 1.12em !important;
      line-height: ${arabicLineHeight} !important;
    }
    .font-ar .script-ar,
    .font-ar .font-ar,
    .script-ar .script-ar,
    .script-ar .font-ar {
      font-size: 1em !important;
    }
    .font-serif {
      font-family: ${isArabicPaper ? arabicFontFamily : "'Noto Serif Bengali', serif"} !important;
    }

    /* Clean natural bolding for question headings, numbers, and titles in PDF (no heavy stroke) */
    .font-bold, .font-extrabold, .font-black, h1, h2, h3, h4, strong, b,
    [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: bold"],
    .q-number, .q-stem, .q-heading-bold {
      font-weight: 700 !important;
      font-synthesis: weight style !important;
      -webkit-text-stroke: 0 !important;
    }
    .exam-question-item .font-bold .script-ar,
    .exam-question-item .font-bold .font-ar,
    .exam-question-item .q-number .script-ar,
    .exam-question-item .q-number .font-ar,
    .exam-question-item .q-stem .script-ar,
    .exam-question-item .q-stem .font-ar,
    .exam-question-item .q-heading-bold .script-ar,
    .exam-question-item .q-heading-bold .font-ar,
    .exam-question-item [style*="font-weight: 700"] .script-ar,
    .exam-question-item [style*="font-weight: 700"] .font-ar {
      font-weight: 700 !important;
      font-synthesis: weight style !important;
      -webkit-text-stroke: 0 !important;
    }

    /* Segmented Word Clues Table with crisp vertical cell dividers */
    .proshno-word-clues-table {
      border-collapse: collapse !important;
      border: 1.5px solid #1e293b !important;
      background-color: #f8fafc !important;
      margin: 0 auto !important;
    }
    .proshno-word-clues-table td {
      border: 1px solid #334155 !important;
      padding: 3px 14px !important;
      text-align: center !important;
      white-space: nowrap !important;
    }

    /* Question header marks aligned with the last wrapped line */
    .exam-question-item .q-header {
      display: flex !important;
      align-items: flex-end !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    /* Critical Layout Utilities */
    .flex { display: flex !important; }
    .inline-flex { display: inline-flex !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .items-end { align-items: flex-end !important; }
    .items-baseline { align-items: baseline !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .justify-start { justify-content: flex-start !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }
    .text-justify, .passage-box, [class*="passage"] { text-align: justify !important; }
    .shrink-0 { flex-shrink: 0 !important; }
    .flex-1 { flex: 1 1 0% !important; }
    .w-full { width: 100% !important; }

    /* Gaps */
    .gap-1 { gap: 0.25rem !important; }
    .gap-1\\.5 { gap: 0.375rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .gap-3 { gap: 0.75rem !important; }
    .gap-4 { gap: 1rem !important; }
    .gap-x-4 { column-gap: 1rem !important; }
    .gap-y-1 { row-gap: 0.25rem !important; }

    /* Grid */
    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }

    /* Borders */
    .border-b-2 { border-bottom-width: 2px !important; }
    .border-b { border-bottom-width: 1px !important; }
    .border-t { border-top-width: 1px !important; }
    .border-y { border-top-width: 1px !important; border-bottom-width: 1px !important; }
    .border { border-width: 1px !important; }
    .border-slate-800 { border-color: #1e293b !important; }
    .border-slate-900 { border-color: #0f172a !important; }
    .border-slate-700 { border-color: #334155 !important; }
    .border-slate-400 { border-color: #94a3b8 !important; }
    .border-slate-300 { border-color: #cbd5e1 !important; }
    .border-slate-200 { border-color: #e2e8f0 !important; }

    /* Multi-column flow & Avoid Break */
    .break-inside-avoid, [style*="break-inside: avoid"], [style*="breakInside: avoid"] {
      break-inside: avoid !important;
      -webkit-column-break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .print\\:hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
  };

  const triggerPdfBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // PDF Deliverable Download
  const handleDownloadPdf = async (type: 'question-paper' | 'answer-key' | 'omr-sheet') => {
    if (questions.length === 0) {
      setErrorMessage('ডাউনলোড করার আগে অন্তত একটি প্রশ্ন যোগ করুন।');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    try {
      showToast('PDF প্রস্তুত হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...');
      let renderedHtml: string | undefined;
      if (type === 'question-paper') {
        renderedHtml = buildClientRenderedHtml();
      }
      const blob = await downloadPdfDeliverable(type, getPaperData(), activeSet, undefined, renderedHtml);
      triggerPdfBlobDownload(blob, `${type}_${activeSet || 'SetA'}.pdf`);
      showToast('PDF সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err: any) {
      setErrorMessage(err.message || 'PDF ডাউনলোড করতে ব্যর্থ হয়েছে।');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  const availableSetNames = sets.length > 0 ? sets.map((s) => s.setName) : [];
  const effectiveActiveSet = sets.length > 0 ? activeSet : '';

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-emerald-600 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-red-500 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-200" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ───────────────── CANVA-STYLE MOBILE/TABLET TOP BAR (< lg) ───────────────── */}
      <MobileTopBar
        headerConfig={headerConfig}
        totalMarks={getTotalMarks()}
        questionCount={questions.length}
        undoCount={past.length}
        redoCount={future.length}
        hasApiKey={hasApiKey}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSetupWizard={handleRequestOpenWizard}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onDownloadPdf={() => handleDownloadPdf('question-paper')}
        onLoadArabicPdfPreset={handleLoadArabicPdfPreset}
      />

      {/* ───────────────── MS WORD STYLE RIBBON HEADER (Desktop >= lg) ───────────────── */}
      <DocumentRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        layoutConfig={layoutConfig}
        onUpdateLayout={updateLayoutConfig}
        headerConfig={headerConfig}
        onUpdateHeader={updateHeaderConfig}
        onInsertQuestion={handleInsertQuestion}
        onInsertSection={handleInsertSection}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenSetShuffler={() => setIsShufflerOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onOpenSetupWizard={handleRequestOpenWizard}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        totalMarks={getTotalMarks()}
        questionCount={questions.length}
        zoom={zoom}
        onZoomChange={setZoom}
        activeSetName={effectiveActiveSet}
        availableSets={availableSetNames}
        onSelectSet={setActiveSet}
        onLoadArabicPdfPreset={handleLoadArabicPdfPreset}
        onOpenNasrulMadroosModal={() => handleOpenNasrulModal()}
        nasrulMadroosCount={nasrulGroups.length}
        onOpenNasrulGhayrMadroosModal={() => handleOpenNasrulGhayrModal()}
        nasrulGhayrMadroosCount={nasrulGhayrGroups.length}
        onOpenNazmSectionModal={() => handleOpenNazmModal()}
        nazmSectionCount={nazmGroups.length}
        onOpenVocabSectionModal={() => handleOpenVocabModal()}
        vocabSectionCount={vocabGroups.length}
        onOpenKitabahSectionModal={() => handleOpenKitabahModal()}
        kitabahSectionCount={kitabahGroups.length}
        onOpenSarfNahwModal={() => handleOpenSarfNahwModal()}
        sarfNahwCount={sarfNahwGroups.length}
        onOpenIkhtibarModal={() => handleOpenIkhtibarModal()}
        ikhtibarCount={ikhtibarGroups.length}
        onOpenTarjamaInshaModal={() => handleOpenTarjamaInshaModal()}
        tarjamaInshaCount={tarjamaInshaGroups.length}
        onOpenBanglaMcqModal={() => handleOpenBanglaMcqModal()}
        banglaMcqCount={banglaMcqGroups.length}
        onOpenBanglaCqModal={() => handleOpenBanglaCqModal()}
        banglaCqCount={banglaCqGroups.length}
        onOpenBangla2ndSscWrittenModal={() => handleOpenBangla2ndSscWrittenModal()}
        bangla2ndSscWrittenCount={bangla2ndSscWrittenGroups.length}
        onOpenBangla2ndHscGrammarModal={() => handleOpenBangla2ndHscGrammarModal()}
        bangla2ndHscGrammarCount={bangla2ndHscGrammarGroups.length}
        onOpenBangla2ndHscNirmitiModal={() => handleOpenBangla2ndHscNirmitiModal()}
        bangla2ndHscNirmitiCount={bangla2ndHscNirmitiGroups.length}
        onOpenAqaidFiqhWrittenModal={() => handleOpenAqaidFiqhWrittenModal()}
        aqaidFiqhWrittenCount={aqaidFiqhWrittenGroups.length}
        onOpenAlimFiqhModal={() => handleOpenAlimFiqhModal()}
        alimFiqhCount={alimFiqhGroups.length}
        onOpenAlimAr2QawaidModal={() => handleOpenAlimAr2QawaidModal()}
        alimAr2QawaidCount={alimAr2QawaidGroups.length}
        onOpenAlimAr2TarjamaModal={() => handleOpenAlimAr2TarjamaModal()}
        alimAr2TarjamaCount={alimAr2TarjamaGroups.length}
        onOpenDakhilQuranWrittenModal={() => setIsDakhilQuranWrittenModalOpen(true)}
        dakhilQuranWrittenCount={dakhilQuranWrittenCount}
        onOpenAlimQuranModal={() => setIsAlimQuranModalOpen(true)}
        alimQuranCount={alimQuranCount}
        onOpenSettingsModal={() => setIsPaperSettingsModalOpen(true)}
        onAutoRenumber={handleAutoRenumber}
        onStripAllHarakat={handleStripAllHarakat}
        onAutoFitPage={() => autoFitFnRef.current?.()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        undoCount={past.length}
        redoCount={future.length}
      />

      {/* ───────────────── LIVE A4 DOCUMENT CANVAS ───────────────── */}
      <main className="flex-1 overflow-auto">
        <A4DocumentCanvas
          paperData={getPaperData()}
          layoutConfig={layoutConfig}
          headerConfig={headerConfig}
          sections={sections}
          questions={questions}
          activeSetName={effectiveActiveSet}
          onUpdateHeader={updateHeaderConfig}
          onUpdateLayout={updateLayoutConfig}
          onRegisterAutoFit={(fn) => {
            autoFitFnRef.current = fn;
          }}
          showToast={showToast}
          onUpdateSection={updateSection}
          onDeleteSection={removeSection}
          onUpdateQuestion={updateQuestion}
          onDeleteQuestion={removeQuestion}
          onDuplicateQuestion={duplicateQuestion}
          onReorderQuestions={reorderQuestions}
          onAssignQuestionSection={assignQuestionToSection}
          onEditNasrulMadroos={(q) => {
            if (q.groupId && q.groupId.startsWith('nasrul-ghayr-madroos')) {
              handleOpenNasrulGhayrModal(q);
            } else if (q.groupId && q.groupId.startsWith('nazm-section')) {
              handleOpenNazmModal(q);
            } else if (q.groupId && q.groupId.startsWith('vocab-section')) {
              handleOpenVocabModal(q);
            } else if (q.groupId && q.groupId.startsWith('kitabah-section')) {
              handleOpenKitabahModal(q);
            } else if (q.groupId && q.groupId.startsWith('sarf-nahw-section')) {
              handleOpenSarfNahwModal(q);
            } else if (q.groupId && q.groupId.startsWith('ikhtibar-qawaid-section')) {
              handleOpenIkhtibarModal(q);
            } else if (q.groupId && q.groupId.startsWith('tarjama-insha-section')) {
              handleOpenTarjamaInshaModal(q);
            } else if (q.groupId && q.groupId.startsWith('bangla-mcq-section')) {
              handleOpenBanglaMcqModal(q);
            } else if (q.groupId && q.groupId.startsWith('bangla-cq-section')) {
              handleOpenBanglaCqModal(q);
            } else if (q.groupId && q.groupId.startsWith('bangla2nd-ssc-written')) {
              handleOpenBangla2ndSscWrittenModal(q);
            } else if (q.groupId && q.groupId.startsWith('bangla2nd-hsc-grammar')) {
              handleOpenBangla2ndHscGrammarModal(q);
            } else if (q.groupId && q.groupId.startsWith('bangla2nd-hsc-nirmiti')) {
              handleOpenBangla2ndHscNirmitiModal(q);
            } else if (q.groupId && q.groupId.startsWith('aqaid-fiqh-written')) {
              handleOpenAqaidFiqhWrittenModal(q);
            } else if (q.groupId && q.groupId.startsWith('alim-fiqh-section')) {
              handleOpenAlimFiqhModal(q);
            } else if (q.groupId && q.groupId.startsWith('alim-ar2-qawaid')) {
              handleOpenAlimAr2QawaidModal(q);
            } else if (q.groupId && q.groupId.startsWith('alim-ar2-tarjama')) {
              handleOpenAlimAr2TarjamaModal(q);
            } else if (q.groupId === DAKHIL_QURAN_WRITTEN_GROUP_ID) {
              setIsDakhilQuranWrittenModalOpen(true);
            } else if (q.groupId === ALIM_QURAN_GROUP_ID) {
              setIsAlimQuranModalOpen(true);
            } else {
              handleOpenNasrulModal(q);
            }
          }}
          onInsertQuestionPrompt={() => {
            setActiveTab('insert');
            setMobileInsertTrigger((n) => n + 1);
          }}
          onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
          zoom={zoom}
          onZoomChange={setZoom}
          selectedQuestionIndex={selectedQuestionIndex}
          onSelectQuestion={setSelectedQuestionIndex}
        />
      </main>

      {/* ───────────────── CANVA-STYLE MOBILE/TABLET BOTTOM DOCK OR QUESTION ACTION BAR (< lg) ───────────────── */}
      {selectedQuestionIndex !== null && questions[selectedQuestionIndex] ? (
        <MobileQuestionActionBar
          question={questions[selectedQuestionIndex]}
          questionIndex={selectedQuestionIndex}
          totalQuestions={questions.length}
          onDeselect={() => setSelectedQuestionIndex(null)}
          onMoveUp={() => {
            if (selectedQuestionIndex > 0) {
              moveQuestion(selectedQuestionIndex, selectedQuestionIndex - 1);
              setSelectedQuestionIndex(selectedQuestionIndex - 1);
            }
          }}
          onMoveDown={() => {
            if (selectedQuestionIndex < questions.length - 1) {
              moveQuestion(selectedQuestionIndex, selectedQuestionIndex + 1);
              setSelectedQuestionIndex(selectedQuestionIndex + 1);
            }
          }}
          onDuplicate={() => duplicateQuestion(selectedQuestionIndex)}
          onDelete={() => {
            removeQuestion(selectedQuestionIndex);
            setSelectedQuestionIndex(null);
          }}
          onUpdate={(updated) => updateQuestion(selectedQuestionIndex, updated)}
          onEdit={
            questions[selectedQuestionIndex]?.groupId
              ? () => {
                  const q = questions[selectedQuestionIndex];
                  if (!q) return;
                  if (q.groupId?.startsWith('nasrul-ghayr-madroos')) handleOpenNasrulGhayrModal(q);
                  else if (q.groupId?.startsWith('nazm-section')) handleOpenNazmModal(q);
                  else if (q.groupId?.startsWith('vocab-section')) handleOpenVocabModal(q);
                  else if (q.groupId?.startsWith('kitabah-section')) handleOpenKitabahModal(q);
                  else if (q.groupId?.startsWith('sarf-nahw-section')) handleOpenSarfNahwModal(q);
                  else if (q.groupId?.startsWith('ikhtibar-qawaid-section')) handleOpenIkhtibarModal(q);
                  else if (q.groupId?.startsWith('tarjama-insha-section')) handleOpenTarjamaInshaModal(q);
                  else if (q.groupId?.startsWith('bangla-mcq-section')) handleOpenBanglaMcqModal(q);
                  else if (q.groupId?.startsWith('bangla-cq-section')) handleOpenBanglaCqModal(q);
                  else if (q.groupId?.startsWith('bangla2nd-ssc-written')) handleOpenBangla2ndSscWrittenModal(q);
                  else if (q.groupId?.startsWith('bangla2nd-hsc-grammar')) handleOpenBangla2ndHscGrammarModal(q);
                  else if (q.groupId?.startsWith('bangla2nd-hsc-nirmiti')) handleOpenBangla2ndHscNirmitiModal(q);
                  else if (q.groupId?.startsWith('aqaid-fiqh-written')) handleOpenAqaidFiqhWrittenModal(q);
                  else if (q.groupId?.startsWith('alim-fiqh-section')) handleOpenAlimFiqhModal(q);
                  else if (q.groupId?.startsWith('alim-ar2-qawaid')) handleOpenAlimAr2QawaidModal(q);
                  else if (q.groupId?.startsWith('alim-ar2-tarjama')) handleOpenAlimAr2TarjamaModal(q);
                  else if (q.groupId === DAKHIL_QURAN_WRITTEN_GROUP_ID) setIsDakhilQuranWrittenModalOpen(true);
                  else if (q.groupId === ALIM_QURAN_GROUP_ID) setIsAlimQuranModalOpen(true);
                  else handleOpenNasrulModal(q);
                }
              : undefined
          }
        />
      ) : (
        <MobileBottomDock
          layoutConfig={layoutConfig}
          onUpdateLayout={updateLayoutConfig}
          headerConfig={headerConfig}
          onUpdateHeader={updateHeaderConfig}
          onInsertQuestion={handleInsertQuestion}
          onInsertSection={handleInsertSection}
          onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
          onOpenSetShuffler={() => setIsShufflerOpen(true)}
          onDownloadPdf={handleDownloadPdf}
          onOpenSetupWizard={handleRequestOpenWizard}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          onOpenSettingsModal={() => setIsPaperSettingsModalOpen(true)}
          onAutoRenumber={handleAutoRenumber}
          onStripAllHarakat={handleStripAllHarakat}
          onAutoFitPage={() => autoFitFnRef.current?.()}
          activeSetName={effectiveActiveSet}
          availableSets={availableSetNames}
          onSelectSet={setActiveSet}
          onLoadArabicPdfPreset={handleLoadArabicPdfPreset}
          onOpenNasrulMadroosModal={() => handleOpenNasrulModal()}
          nasrulMadroosCount={nasrulGroups.length}
          onOpenNasrulGhayrMadroosModal={() => handleOpenNasrulGhayrModal()}
          nasrulGhayrMadroosCount={nasrulGhayrGroups.length}
          onOpenNazmSectionModal={() => handleOpenNazmModal()}
          nazmSectionCount={nazmGroups.length}
          onOpenVocabSectionModal={() => handleOpenVocabModal()}
          vocabSectionCount={vocabGroups.length}
          onOpenKitabahSectionModal={() => handleOpenKitabahModal()}
          kitabahSectionCount={kitabahGroups.length}
          onOpenSarfNahwModal={() => handleOpenSarfNahwModal()}
          sarfNahwCount={sarfNahwGroups.length}
          onOpenIkhtibarModal={() => handleOpenIkhtibarModal()}
          ikhtibarCount={ikhtibarGroups.length}
          onOpenTarjamaInshaModal={() => handleOpenTarjamaInshaModal()}
          tarjamaInshaCount={tarjamaInshaGroups.length}
          onOpenBanglaMcqModal={() => handleOpenBanglaMcqModal()}
          banglaMcqCount={banglaMcqGroups.length}
          onOpenBanglaCqModal={() => handleOpenBanglaCqModal()}
          banglaCqCount={banglaCqGroups.length}
          onOpenBangla2ndSscWrittenModal={() => handleOpenBangla2ndSscWrittenModal()}
          bangla2ndSscWrittenCount={bangla2ndSscWrittenGroups.length}
          onOpenBangla2ndHscGrammarModal={() => handleOpenBangla2ndHscGrammarModal()}
          bangla2ndHscGrammarCount={bangla2ndHscGrammarGroups.length}
          onOpenBangla2ndHscNirmitiModal={() => handleOpenBangla2ndHscNirmitiModal()}
          bangla2ndHscNirmitiCount={bangla2ndHscNirmitiGroups.length}
          onOpenAqaidFiqhWrittenModal={() => handleOpenAqaidFiqhWrittenModal()}
          aqaidFiqhWrittenCount={aqaidFiqhWrittenGroups.length}
          onOpenAlimFiqhModal={() => handleOpenAlimFiqhModal()}
          alimFiqhCount={alimFiqhGroups.length}
          onOpenAlimAr2QawaidModal={() => handleOpenAlimAr2QawaidModal()}
          alimAr2QawaidCount={alimAr2QawaidGroups.length}
          onOpenAlimAr2TarjamaModal={() => handleOpenAlimAr2TarjamaModal()}
          alimAr2TarjamaCount={alimAr2TarjamaGroups.length}
          onOpenDakhilQuranWrittenModal={() => setIsDakhilQuranWrittenModalOpen(true)}
          dakhilQuranWrittenCount={dakhilQuranWrittenCount}
          onOpenAlimQuranModal={() => setIsAlimQuranModalOpen(true)}
          alimQuranCount={alimQuranCount}
          openInsertTrigger={mobileInsertTrigger}
        />
      )}

      {/* ───────────────── CONFIRM RESET WARNING MODAL ───────────────── */}
      <ConfirmActionModal
        isOpen={isConfirmWizardOpen}
        onClose={() => setIsConfirmWizardOpen(false)}
        onConfirm={() => setIsWizardOpen(true)}
        title="সতর্কতা: বর্তমান তৈরি করা প্রশ্নগুলো হারিয়ে যাবে!"
        description={`আপনার ক্যানভাসে ইতিমধ্যে ${questions.length}টি প্রশ্ন তৈরি করা রয়েছে। নতুন প্রশ্নপত্র উইজার্ডে গেলে বর্তমান প্রশ্নগুলো মুছে যাবে এবং নতুন সেটআপ শুরু হবে। আপনি কি নতুন উইজার্ডে যেতে রাজি আছেন?`}
        confirmLabel="হ্যাঁ, নতুন উইজার্ডে যান"
        cancelLabel="না, বর্তমান পেপারে থাকুন"
        variant="warning"
        countBadge={`ক্যানভাসে বর্তমান প্রশ্ন: ${questions.length}টি`}
      />

      {/* ───────────────── SETUP WIZARD POPUP MODAL ───────────────── */}
      <SetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      {/* ───────────────── NASRUL MADROOS BUILDER MODAL (Smart Update + Optional Add New) ───────────────── */}
      <NasrulMadroosModal
        isOpen={isNasrulMadroosModalOpen}
        onClose={() => setIsNasrulMadroosModalOpen(false)}
        allGroups={nasrulGroups}
        activeGroupId={activeNasrulGroupId}
        onSelectGroupId={setActiveNasrulGroupId}
        onSave={(newQs, mode, targetGroupId, legacyQuestionIds) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs, legacyQuestionIds);
            showToast(`নসসুল মাদরুস ও ${Math.max(0, newQs.length - 1)}টি প্রশ্ন আগের জায়গাতেই আপডেট হয়েছে!`);
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast(`নতুন নসসুল মাদরুস ও ${Math.max(0, newQs.length - 1)}টি প্রশ্ন পেপারে যুক্ত হয়েছে!`);
          }
        }}
      />

      {/* ───────────────── NASRUL GHAYR MADROOS BUILDER MODAL (Smart Update + Optional Add New) ───────────────── */}
      <NasrulGhayrMadroosModal
        isOpen={isNasrulGhayrMadroosModalOpen}
        onClose={() => setIsNasrulGhayrMadroosModalOpen(false)}
        allGroups={nasrulGhayrGroups}
        activeGroupId={activeNasrulGhayrGroupId}
        onSelectGroupId={setActiveNasrulGhayrGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast(`নসসে গায়রে মাদরুস ও এর প্রশ্নাবলি আগের জায়গাতেই আপডেট হয়েছে!`);
          } else {
            const sec = sections.find((s) => s.id === 'sec-ar-2') || sections[1] || sections[0];
            if (sec) {
              newQs.forEach((q) => {
                q.sectionId = sec.id;
              });
            }
            addQuestions(newQs);
            showToast(`নতুন নসসে গায়রে মাদরুস ও প্রশ্নাবলি পেপারে যুক্ত হয়েছে!`);
          }
        }}
      />

      {/* ───────────────── NAZM SECTION BUILDER MODAL (Smart Update + Optional Add New) ───────────────── */}
      <NazmSectionModal
        isOpen={isNazmModalOpen}
        onClose={() => setIsNazmModalOpen(false)}
        allGroups={nazmGroups}
        activeGroupId={activeNazmGroupId}
        onSelectGroupId={setActiveNazmGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast(`কবিতা অংশ (قسم النظم) আগের জায়গাতেই আপডেট হয়েছে!`);
          } else {
            const sec = sections.find((s) => s.id === 'sec-ar-3') || sections[2] || sections[0];
            if (sec) {
              newQs.forEach((q) => {
                q.sectionId = sec.id;
              });
            }
            addQuestions(newQs);
            showToast(`নতুন কবিতা অংশ (قسم النظم : ২০ নম্বর) পেপারে যুক্ত হয়েছে!`);
          }
        }}
      />

      {/* ───────────────── VOCAB SECTION BUILDER MODAL (Smart Update + Optional Add New) ───────────────── */}
      <VocabSectionModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        allGroups={vocabGroups}
        activeGroupId={activeVocabGroupId}
        onSelectGroupId={setActiveVocabGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast(`শব্দভাণ্ডার ও শূন্যস্থান (اختبار المفردات) আগের জায়গাতেই আপডেট হয়েছে!`);
          } else {
            const sec = sections.find((s) => s.id === 'sec-ar-4') || sections[3] || sections[0];
            if (sec) {
              newQs.forEach((q) => {
                q.sectionId = sec.id;
              });
            }
            addQuestions(newQs);
            showToast(`নতুন শূন্যস্থান ও শব্দভাণ্ডার (اختبار المفردات : ২০ নম্বর) পেপারে যুক্ত হয়েছে!`);
          }
        }}
      />

      {/* ───────────────── KITABAH SECTION BUILDER MODAL (Smart Update + Optional Add New) ───────────────── */}
      <KitabahSectionModal
        isOpen={isKitabahModalOpen}
        onClose={() => setIsKitabahModalOpen(false)}
        allGroups={kitabahGroups}
        activeGroupId={activeKitabahGroupId}
        onSelectGroupId={setActiveKitabahGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast(`লিখন দক্ষতা (اختبار الكتابة) আগের জায়গাতেই আপডেট হয়েছে!`);
          } else {
            const sec = sections.find((s) => s.id === 'sec-ar-5') || sections[4] || sections[0];
            if (sec) {
              newQs.forEach((q) => {
                q.sectionId = sec.id;
              });
            }
            addQuestions(newQs);
            showToast(`নতুন লিখন দক্ষতা ও সংলাপ (اختبار الكتابة : ২০ নম্বর) পেপারে যুক্ত হয়েছে!`);
          }
        }}
      />

      {/* ───────────────── SARF & NAHW BUILDER MODAL (Arabic 2nd Paper Q1 & Q2) ───────────────── */}
      <SarfNahwModal
        isOpen={isSarfNahwModalOpen}
        onClose={() => setIsSarfNahwModalOpen(false)}
        allGroups={sarfNahwGroups}
        activeGroupId={activeSarfNahwGroupId}
        onSelectGroupId={setActiveSarfNahwGroupId}
        onSave={(newQs, mode, targetGroupId, proceedToIkhtibar) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('সরফ ও নাহু প্রশ্নাবলী সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('সরফ ও নাহু প্রশ্নাবলী (الصرف والنحو - ৩০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
          if (proceedToIkhtibar) {
            handleOpenIkhtibarModal();
          }
        }}
      />

      {/* ───────────────── IKHTIBARUL QAWAID BUILDER MODAL (Dakhil Q3 / Alim Q11) ───────────────── */}
      <IkhtibarulQawaidModal
        isOpen={isIkhtibarModalOpen}
        onClose={() => setIsIkhtibarModalOpen(false)}
        isAlim={isAlimArabic2ndPaper(headerConfig.subject, headerConfig.subjectCode, headerConfig.grade)}
        allGroups={ikhtibarGroups}
        activeGroupId={activeIkhtibarGroupId}
        onSelectGroupId={setActiveIkhtibarGroupId}
        onSave={(newQs, mode, targetGroupId, proceedToInsha) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('কাওয়ায়েদ পরীক্ষা সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('কাওয়ায়েদ পরীক্ষা (اختبار القواعد) পেপারে যুক্ত হয়েছে!');
          }
          if (proceedToInsha) {
            if (isAlimArabic2ndPaper(headerConfig.subject, headerConfig.subjectCode, headerConfig.grade)) {
              handleOpenAlimAr2TarjamaModal();
            } else {
              handleOpenTarjamaInshaModal();
            }
          }
        }}
      />

      {/* ───────────────── TARJAMA & INSHA BUILDER MODAL (Arabic 2nd Paper Q4, Q5, Q6, Q7) ───────────────── */}
      <TarjamaInshaModal
        isOpen={isTarjamaInshaModalOpen}
        onClose={() => setIsTarjamaInshaModalOpen(false)}
        allGroups={tarjamaInshaGroups}
        activeGroupId={activeTarjamaInshaGroupId}
        onSelectGroupId={setActiveTarjamaInshaGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('অনুবাদ ও রচনা অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('অনুবাদ ও রচনা (الترجمة والإنشاء - ৪৫ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── BANGLA 1ST, 2ND, AQAID & QURAN MCQ BUILDER MODAL (30 / 40 Marks) ───────────────── */}
      <BanglaMcqBuilderModal
        isOpen={isBanglaMcqModalOpen}
        onClose={() => setIsBanglaMcqModalOpen(false)}
        grade={headerConfig.grade || '১০ম শ্রেণি'}
        subject={headerConfig.subject || 'বাংলা ১ম পত্র'}
        targetMarks={
          isDakhilAqaidFiqh(headerConfig.subject, headerConfig.subjectCode) ||
          isDakhilQuranTajweed(headerConfig.subject, headerConfig.subjectCode, headerConfig.grade)
            ? 40
            : 30
        }
        allGroups={banglaMcqGroups}
        activeGroupId={activeBanglaMcqGroupId}
        onSelectGroupId={setActiveBanglaMcqGroupId}
        onSave={(newQs, mode, targetGroupId, proceedToCq) => {
          const isFortyMcq =
            isDakhilAqaidFiqh(headerConfig.subject, headerConfig.subjectCode) ||
            isDakhilQuranTajweed(headerConfig.subject, headerConfig.subjectCode, headerConfig.grade);
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('বহুনির্বাচনি (MCQ) অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast(
              isFortyMcq
                ? 'বহুনির্বাচনি অভীক্ষা (MCQ - ৪০ নম্বর) পেপারে যুক্ত হয়েছে!'
                : 'বহুনির্বাচনি অভীক্ষা (MCQ - ৩০ নম্বর) পেপারে যুক্ত হয়েছে!'
            );
          }
          if (proceedToCq) {
            if (isDakhilQuranTajweed(headerConfig.subject, headerConfig.subjectCode, headerConfig.grade)) {
              setIsDakhilQuranWrittenModalOpen(true);
            } else if (isDakhilAqaidFiqh(headerConfig.subject, headerConfig.subjectCode)) {
              handleOpenAqaidFiqhWrittenModal();
            } else if (isBangla2ndPaper(headerConfig.subject, headerConfig.subjectCode)) {
              handleOpenBangla2ndSscWrittenModal();
            } else {
              handleOpenBanglaCqModal();
            }
          }
        }}
      />

      {/* ───────────────── BANGLA 1ST PAPER CQ BUILDER MODAL (70 Marks) ───────────────── */}
      <BanglaCqBuilderModal
        isOpen={isBanglaCqModalOpen}
        onClose={() => setIsBanglaCqModalOpen(false)}
        grade={headerConfig.grade || '১০ম শ্রেণি'}
        subject={headerConfig.subject || 'বাংলা ১ম পত্র'}
        allGroups={banglaCqGroups}
        activeGroupId={activeBanglaCqGroupId}
        onSelectGroupId={setActiveBanglaCqGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('বাংলা ১ম পত্রের সৃজনশীল (CQ) অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('বাংলা ১ম পত্রের সৃজনশীল প্রশ্ন (CQ - ৭০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── BANGLA 2ND PAPER (CLASS 6–10 & DAKHIL) WRITTEN BUILDER MODAL (70 Marks) ───────────────── */}
      <Bangla2ndSscWrittenModal
        isOpen={isBangla2ndSscWrittenModalOpen}
        onClose={() => setIsBangla2ndSscWrittenModalOpen(false)}
        grade={headerConfig.grade || '১০ম শ্রেণি (এসএসসি)'}
        subject={headerConfig.subject || 'বাংলা ২য় পত্র'}
        allGroups={bangla2ndSscWrittenGroups}
        activeGroupId={activeBangla2ndSscWrittenGroupId}
        onSelectGroupId={setActiveBangla2ndSscWrittenGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('বাংলা ২য় পত্রের রচনামূলক (নির্মিতি - ৭০) অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('বাংলা ২য় পত্রের রচনামূলক প্রশ্ন (নির্মিতি - ৭০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── BANGLA 2ND PAPER (HSC & ALIM) GRAMMAR BUILDER MODAL (Q1–Q6: 30 Marks) ───────────────── */}
      <Bangla2ndHscGrammarModal
        isOpen={isBangla2ndHscGrammarModalOpen}
        onClose={() => setIsBangla2ndHscGrammarModalOpen(false)}
        grade={headerConfig.grade || 'দ্বাদশ শ্রেণি (এইচএসসি)'}
        subject={headerConfig.subject || 'বাংলা ২য় পত্র'}
        allGroups={bangla2ndHscGrammarGroups}
        activeGroupId={activeBangla2ndHscGrammarGroupId}
        onSelectGroupId={setActiveBangla2ndHscGrammarGroupId}
        onSave={(newQs, mode, targetGroupId, proceedToNirmiti) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('বাংলা ২য় পত্রের ব্যাকরণ অংশ (১–৬ নং প্রশ্ন) সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('বাংলা ২য় পত্রের ব্যাকরণ অংশ (১–৬ নং প্রশ্ন : ৩০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
          if (proceedToNirmiti) {
            handleOpenBangla2ndHscNirmitiModal();
          }
        }}
      />

      {/* ───────────────── BANGLA 2ND PAPER (HSC & ALIM) NIRMITI BUILDER MODAL (Q7–Q12: 70 Marks) ───────────────── */}
      <Bangla2ndHscNirmitiModal
        isOpen={isBangla2ndHscNirmitiModalOpen}
        onClose={() => setIsBangla2ndHscNirmitiModalOpen(false)}
        grade={headerConfig.grade || 'দ্বাদশ শ্রেণি (এইচএসসি)'}
        subject={headerConfig.subject || 'বাংলা ২য় পত্র'}
        allGroups={bangla2ndHscNirmitiGroups}
        activeGroupId={activeBangla2ndHscNirmitiGroupId}
        onSelectGroupId={setActiveBangla2ndHscNirmitiGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('বাংলা ২য় পত্রের নির্মিতি অংশ (৭–১২ নং প্রশ্ন) সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('বাংলা ২য় পত্রের নির্মিতি অংশ (৭–১২ নং প্রশ্ন : ৭০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── DAKHIL AQAID & FIQH WRITTEN BUILDER MODAL (60 Marks) ───────────────── */}
      <AqaidFiqhWrittenModal
        isOpen={isAqaidFiqhWrittenModalOpen}
        onClose={() => setIsAqaidFiqhWrittenModalOpen(false)}
        grade={headerConfig.grade || 'দাখিল ১০ম শ্রেণি'}
        subject={headerConfig.subject || 'আকাইদ ও ফিকহ'}
        allGroups={aqaidFiqhWrittenGroups}
        activeGroupId={activeAqaidFiqhWrittenGroupId}
        onSelectGroupId={setActiveAqaidFiqhWrittenGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('আকাইদ ও ফিকহ রচনামূলক (খ–চ বিভাগ) সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('আকাইদ ও ফিকহ রচনামূলক (খ–চ বিভাগ : ৬০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── ALIM FIQH 1ST & 2ND PAPER BUILDER MODAL (100 Marks + Optional Bengali) ───────────────── */}
      <AlimFiqhBuilderModal
        isOpen={isAlimFiqhModalOpen}
        onClose={() => setIsAlimFiqhModalOpen(false)}
        isSecondPaper={isAlimFiqh2nd(headerConfig.subject, headerConfig.subjectCode)}
        grade={headerConfig.grade || 'আলিম ১ম বর্ষ'}
        subject={headerConfig.subject}
        allGroups={alimFiqhGroups}
        activeGroupId={activeAlimFiqhGroupId}
        onSelectGroupId={setActiveAlimFiqhGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('আল ফিকহ প্রশ্নাবলি সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('আল ফিকহ প্রশ্নাবলি (১০০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── ALIM ARABIC 2ND PAPER (أ) QAWAID MODAL (Q1–Q10: 35 Marks) ───────────────── */}
      <AlimArabic2ndQawaidModal
        isOpen={isAlimAr2QawaidModalOpen}
        onClose={() => setIsAlimAr2QawaidModalOpen(false)}
        grade={headerConfig.grade || 'الصف الثاني من العالم'}
        subject={headerConfig.subject || 'الأدب العربي (الورقة الثانية)'}
        allGroups={alimAr2QawaidGroups}
        activeGroupId={activeAlimAr2QawaidGroupId}
        onSelectGroupId={setActiveAlimAr2QawaidGroupId}
        onSave={(newQs, mode, targetGroupId, proceedToIkhtibar) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('(أ) القواعد অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('(أ) القواعد (১–১০ নং প্রশ্ন : ৩৫ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
          if (proceedToIkhtibar) {
            handleOpenIkhtibarModal();
          }
        }}
      />

      {/* ───────────────── ALIM ARABIC 2ND PAPER (ج) TARJAMA & INSHA MODAL (Q12–Q16: 50 Marks) ───────────────── */}
      <AlimArabic2ndTarjamaInshaModal
        isOpen={isAlimAr2TarjamaModalOpen}
        onClose={() => setIsAlimAr2TarjamaModalOpen(false)}
        grade={headerConfig.grade || 'الصف الثاني من العالم'}
        subject={headerConfig.subject || 'الأدب العربي (الورقة الثانية)'}
        allGroups={alimAr2TarjamaGroups}
        activeGroupId={activeAlimAr2TarjamaGroupId}
        onSelectGroupId={setActiveAlimAr2TarjamaGroupId}
        onSave={(newQs, mode, targetGroupId) => {
          if (mode === 'update') {
            replaceQuestionGroup(targetGroupId, newQs);
            showToast('(ج) الترجمة والإنشاء অংশ সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('(ج) الترجمة والإنشاء (১২–১৬ নং প্রশ্ন : ৫০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── DAKHIL QURAN MAJID & TAJWEED WRITTEN MODAL (খ–ঘ বিভাগ: 60 Marks) ───────────────── */}
      <QuranTajweedWrittenModal
        isOpen={isDakhilQuranWrittenModalOpen}
        onClose={() => setIsDakhilQuranWrittenModalOpen(false)}
        existingQuestions={questions}
        onSave={(newQs) => {
          const hasExisting = questions.some((q) => q.groupId === DAKHIL_QURAN_WRITTEN_GROUP_ID);
          if (hasExisting) {
            replaceQuestionGroup(DAKHIL_QURAN_WRITTEN_GROUP_ID, newQs);
            showToast('আল কুরআন মাজিদ ও তাজবীদ রচনামূলক (খ–ঘ বিভাগ) সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('আল কুরআন মাজিদ ও তাজবীদ রচনামূলক (খ–ঘ বিভাগ : ৬০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── ALIM QURAN MAJID ARABIC BUILDER MODAL (القرآن المجيد - 100 Marks) ───────────────── */}
      <AlimQuranBuilderModal
        isOpen={isAlimQuranModalOpen}
        onClose={() => setIsAlimQuranModalOpen(false)}
        existingQuestions={questions}
        onSave={(newQs) => {
          const hasExisting = questions.some((q) => q.groupId === ALIM_QURAN_GROUP_ID);
          if (hasExisting) {
            replaceQuestionGroup(ALIM_QURAN_GROUP_ID, newQs);
            showToast('القرآن المجيد প্রশ্নাবলি সফলভাবে আপডেট হয়েছে!');
          } else {
            if (sections.length > 0) {
              newQs.forEach((q) => {
                q.sectionId = sections[0].id;
              });
            }
            addQuestions(newQs);
            showToast('القرآن المجيد — مجموعة (أ) ও (ب) (১০০ নম্বর) পেপারে যুক্ত হয়েছে!');
          }
        }}
      />

      {/* ───────────────── QUICK AI SIDE DRAWER ───────────────── */}
      <QuickAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        stream={headerConfig.educationStream || 'ALIA'}
        subject={headerConfig.subject || 'আরবি ১ম পত্র'}
        grade={headerConfig.grade || 'দাখিল ৯ম শ্রেণি'}
        sections={sections}
        onInsertQuestions={(newQs) => {
          addQuestions(newQs);
          showToast(`${newQs.length}টি প্রশ্ন ক্যানভাসে যুক্ত হয়েছে!`);
        }}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* ───────────────── SET SHUFFLER MODAL ───────────────── */}
      <SetShufflerModal
        isOpen={isShufflerOpen}
        onClose={() => setIsShufflerOpen(false)}
      />

      {/* ───────────────── DOWNLOAD DELIVERABLES MODAL ───────────────── */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        deliverableType={downloadDeliverableType}
        availableSets={availableSetNames}
        activeSet={activeSet}
        onDownloadSet={async (setName, type) => {
          const targetType = type || downloadDeliverableType;
          const renderedHtml = targetType === 'question-paper' ? buildClientRenderedHtml() : undefined;
          const blob = await downloadPdfDeliverable(targetType, getPaperData(), setName, undefined, renderedHtml);
          triggerPdfBlobDownload(blob, `${targetType}_${setName || 'SetA'}.pdf`);
          showToast('PDF সফলভাবে ডাউনলোড হয়েছে!');
        }}
        onDownloadAllSets={async (setNames, type) => {
          const targetType = type || downloadDeliverableType;
          const renderedHtml = targetType === 'question-paper' ? buildClientRenderedHtml() : undefined;
          for (const s of setNames) {
            const blob = await downloadPdfDeliverable(targetType, getPaperData(), s, undefined, renderedHtml);
            triggerPdfBlobDownload(blob, `${targetType}_${s || 'SetA'}.pdf`);
          }
          showToast('সকল সেটের PDF সফলভাবে ডাউনলোড হয়েছে!');
        }}
        onOpenSetShuffler={() => setIsShufflerOpen(true)}
      />

      {/* ───────────────── API KEY SETTINGS MODAL ───────────────── */}
      <ApiKeySettingsModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={checkKey}
      />

      {/* ───────────────── PAPER & LAYOUT SETTINGS MODAL ───────────────── */}
      <PaperSettingsModal
        isOpen={isPaperSettingsModalOpen}
        onClose={() => setIsPaperSettingsModalOpen(false)}
      />
    </div>
  );
}
