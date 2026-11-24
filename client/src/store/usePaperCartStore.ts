import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ExamPaperData,
  ExamSection,
  ExamSet,
  HeaderPreset,
  InstitutionHeaderConfig,
  LayoutConfig,
  NumberingFormat,
  QuestionData,
  formatMarksFormula,
  formatQuestionNumber,
} from 'proshno-shared';

/** Generate a truly unique temporary ID, safe even when multiple questions are added in one tick. */
function generateTempId(idx: number = 0): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `temp-${crypto.randomUUID()}`;
  }
  return `temp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`;
}

const MAX_HISTORY = 15;

export interface PaperSnapshot {
  questions: QuestionData[];
  sections: ExamSection[];
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
}

function createSnapshot(state: {
  questions: QuestionData[];
  sections: ExamSection[];
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
}): PaperSnapshot {
  return JSON.parse(
    JSON.stringify({
      questions: state.questions,
      sections: state.sections,
      headerConfig: state.headerConfig,
      layoutConfig: state.layoutConfig,
    })
  );
}

function withHistory(state: {
  questions: QuestionData[];
  sections: ExamSection[];
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
  past: PaperSnapshot[];
}) {
  return {
    past: [...state.past, createSnapshot(state)].slice(-MAX_HISTORY),
    future: [] as PaperSnapshot[],
  };
}

interface PaperCartState {
  questions: QuestionData[];
  sections: ExamSection[];
  headerConfig: InstitutionHeaderConfig;
  layoutConfig: LayoutConfig;
  sets: ExamSet[];
  activeSet: string;

  // Undo / Redo History (last 15 snapshots)
  past: PaperSnapshot[];
  future: PaperSnapshot[];
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;

  // Section Actions
  addSection: (section: Omit<ExamSection, 'id' | 'order'> & { id?: string }) => void;
  updateSection: (sectionId: string, patch: Partial<ExamSection>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (newSections: ExamSection[]) => void;
  assignQuestionToSection: (questionIndex: number, sectionId?: string) => void;

  // Question Actions
  addQuestion: (question: QuestionData) => void;
  addQuestions: (questions: QuestionData[]) => void;
  replaceQuestionGroup: (
    groupId: string,
    newQuestions: QuestionData[],
    fallbackQuestionIds?: string[]
  ) => void;
  removeQuestion: (index: number) => void;
  updateQuestion: (index: number, patch: Partial<QuestionData>) => void;
  reorderQuestions: (newQuestions: QuestionData[]) => void;
  autoRenumberQuestions: () => void;
  stripAllHarakat: () => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  duplicateQuestion: (index: number) => string;
  clearCart: () => void;
  loadFullPaper: (data: {
    headerConfig?: Partial<InstitutionHeaderConfig>;
    layoutConfig?: Partial<LayoutConfig>;
    sections?: ExamSection[];
    questions?: QuestionData[];
  }) => void;

  updateHeaderConfig: (patch: Partial<InstitutionHeaderConfig>) => void;
  applyHeaderPreset: (preset: HeaderPreset) => void;
  setChoiceRule: (questionsToAnswer?: number, marksPerQuestion?: number, text?: string) => void;
  updateLayoutConfig: (patch: Partial<LayoutConfig>) => void;
  setGeneratedSets: (sets: ExamSet[]) => void;
  setActiveSet: (setName: string) => void;
  isNavbarVisible: boolean;
  hasCompletedSetup: boolean;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  toggleNavbar: () => void;
  setNavbarVisible: (visible: boolean) => void;

  getTotalMarks: () => number;
  getPaperData: () => ExamPaperData;
}

const defaultHeaderConfig: InstitutionHeaderConfig = {
  institutionName: '',
  institutionAddress: '',
  examTitle: '',
  subject: '',
  subjectCode: '',
  grade: '',
  timeAllowed: '৩ ঘণ্টা',
  totalMarks: 100,
  generalInstructions: [],
};

const defaultLayoutConfig: LayoutConfig = {
  columns: 2,
  fontSize: 'standard',
  paperSize: 'A4',
  margins: {
    topMm: 14,
    bottomMm: 14,
    leftMm: 18,
    rightMm: 18,
  },
  numberingFormat: 'bn',
  watermarkText: '',
  showMarks: true,
  showAnswers: false,
};

export const usePaperCartStore = create<PaperCartState>()(
  persist(
    (set, get) => ({
      questions: [],
      sections: [],
      headerConfig: defaultHeaderConfig,
      layoutConfig: defaultLayoutConfig,
      sets: [],
      activeSet: '',
      past: [],
      future: [],
      isNavbarVisible: true,
      hasCompletedSetup: false,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
      toggleNavbar: () => set((state) => ({ isNavbarVisible: !state.isNavbarVisible })),
      setNavbarVisible: (visible) => set({ isNavbarVisible: visible }),

      undo: () => {
        const state = get();
        if (state.past.length === 0) return false;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        const currentSnap = createSnapshot(state);
        set({
          questions: previous.questions,
          sections: previous.sections,
          headerConfig: previous.headerConfig,
          layoutConfig: previous.layoutConfig,
          past: newPast,
          future: [currentSnap, ...state.future].slice(0, MAX_HISTORY),
        });
        return true;
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return false;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const currentSnap = createSnapshot(state);
        set({
          questions: next.questions,
          sections: next.sections,
          headerConfig: next.headerConfig,
          layoutConfig: next.layoutConfig,
          past: [...state.past, currentSnap].slice(-MAX_HISTORY),
          future: newFuture,
        });
        return true;
      },

      clearHistory: () => set({ past: [], future: [] }),

      // Section actions
      addSection: (section) => {
        set((state) => {
          const id = section.id || `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const order = state.sections.length;
          const formula =
            section.displayMarksFormula ||
            formatMarksFormula(section.requiredCount, section.marksPerQuestion, section.totalMarks);

          const newSection: ExamSection = {
            ...section,
            id,
            order,
            displayMarksFormula: formula,
          };

          return { ...withHistory(state), sections: [...state.sections, newSection] };
        });
      },

      updateSection: (sectionId, patch) => {
        set((state) => {
          const updated = state.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            const merged = { ...sec, ...patch };
            const formula =
              patch.displayMarksFormula !== undefined
                ? patch.displayMarksFormula
                : formatMarksFormula(merged.requiredCount, merged.marksPerQuestion, merged.totalMarks);
            return { ...merged, displayMarksFormula: formula };
          });
          return { ...withHistory(state), sections: updated };
        });
      },

      removeSection: (sectionId) => {
        set((state) => {
          // Unassign sectionId on any questions belonging to this deleted section
          const updatedQuestions = state.questions.map((q) =>
            q.sectionId === sectionId ? { ...q, sectionId: undefined } : q
          );
          const remainingSections = state.sections
            .filter((sec) => sec.id !== sectionId)
            .map((sec, idx) => ({ ...sec, order: idx }));

          return {
            ...withHistory(state),
            sections: remainingSections,
            questions: updatedQuestions,
          };
        });
      },

      reorderSections: (newSections) => {
        set((state) => ({
          ...withHistory(state),
          sections: newSections.map((sec, idx) => ({ ...sec, order: idx })),
        }));
      },

      assignQuestionToSection: (questionIndex, sectionId) => {
        set((state) => {
          const updated = [...state.questions];
          if (updated[questionIndex]) {
            updated[questionIndex] = { ...updated[questionIndex], sectionId };
          }
          return { ...withHistory(state), questions: updated };
        });
      },

      addQuestion: (question) => {
        set((state) => {
          const qWithId = question._id
            ? question
            : { ...question, _id: generateTempId() };
          return { ...withHistory(state), questions: [...state.questions, qWithId] };
        });
      },

      addQuestions: (newQuestions) => {
        set((state) => {
          // Fix Z2: each question gets a genuinely unique ID using index as entropy
          const enriched = newQuestions.map((q, idx) =>
            q._id ? q : { ...q, _id: generateTempId(idx) }
          );
          return { ...withHistory(state), questions: [...state.questions, ...enriched] };
        });
      },

      replaceQuestionGroup: (groupId, newQuestions, fallbackQuestionIds) => {
        set((state) => {
          const fallbackSet = new Set(fallbackQuestionIds || []);
          const matchesGroup = (q: QuestionData) =>
            (Boolean(q.groupId) && q.groupId === groupId) ||
            (Boolean(q._id) && fallbackSet.has(q._id!));

          const firstIdx = state.questions.findIndex(matchesGroup);
          const inheritedSectionId =
            firstIdx !== -1
              ? state.questions[firstIdx].sectionId
              : state.sections[0]?.id;

          const enriched = newQuestions.map((q, idx) => ({
            ...q,
            _id: q._id || generateTempId(idx),
            groupId,
            sectionId: q.sectionId !== undefined ? q.sectionId : inheritedSectionId,
          }));

          if (firstIdx === -1) {
            return { ...withHistory(state), questions: [...state.questions, ...enriched] };
          }

          const updated: QuestionData[] = [];
          let inserted = false;
          for (let i = 0; i < state.questions.length; i++) {
            const q = state.questions[i];
            if (matchesGroup(q)) {
              if (!inserted) {
                updated.push(...enriched);
                inserted = true;
              }
              // skip old items of this group
            } else {
              updated.push(q);
            }
          }

          return { ...withHistory(state), questions: updated };
        });
      },

      removeQuestion: (index) => {
        set((state) => ({
          ...withHistory(state),
          questions: state.questions.filter((_, idx) => idx !== index),
        }));
      },

      updateQuestion: (index, patch) => {
        set((state) => {
          const updated = [...state.questions];
          updated[index] = { ...updated[index], ...patch };
          return { ...withHistory(state), questions: updated };
        });
      },

      reorderQuestions: (newQuestions) => {
        set((state) => ({ ...withHistory(state), questions: newQuestions }));
      },

      stripAllHarakat: () => {
        set((state) => {
          const stripText = (t?: string) =>
            t ? t.replace(/[\u064B-\u065F\u0670]/g, '') : t;
          const updated = state.questions.map((q) => ({
            ...q,
            stemOrPassage: stripText(q.stemOrPassage) || '',
            options: q.options?.map((o) => ({ ...o, text: stripText(o.text) || '' })),
            subQuestions: q.subQuestions?.map((sq) => ({
              ...sq,
              questionText: stripText(sq.questionText) || '',
            })),
            wordClues: q.wordClues?.map((w) => stripText(w) || ''),
            tahqeeqWords: q.tahqeeqWords?.map((tw) => ({
              ...tw,
              lafz: stripText(tw.lafz) || '',
              maddah: stripText(tw.maddah),
            })),
          }));
          return { ...withHistory(state), questions: updated };
        });
      },

      autoRenumberQuestions: () => {
        set((state) => {
          const numberingFormat: NumberingFormat =
            state.layoutConfig.numberingFormat || 'bn';
          const isArabicPaper =
            numberingFormat === 'ar' ||
            state.questions.some((q) => q.languages?.includes('ar'));

          const AR_SUB_LETTERS = ['الف', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

          let mainSeq = 1;

          // Helper: Identify if an item is a lettered sub-question (أ., (أ), الف., ক., (ক), a., (a), etc.)
          // Sub-questions MUST NOT be converted to main numbers (1, 2, 3...)
          const isLetteredSubPart = (q: QuestionData): boolean => {
            if (
              q.groupRole &&
              [
                'true_false',
                'fill_blanks',
                'vocab',
                'sentence',
                'sub_part',
                'verb_shift',
                'antonyms',
                'tahqeeq',
                'rearrange',
                'number_swap',
              ].includes(q.groupRole) ||
              q.groupRole?.startsWith('ghayr_')
            ) {
              if (q.groupRole !== 'ghayr_q3' && q.groupRole !== 'ghayr_q4_title') {
                return true;
              }
            }
            const num = (q.customNumber || '').trim();
            if (!num) return false;

            // Check if it starts with any digit (English, Bengali, Arabic-Indic, Urdu)
            const startsWithDigit = /^[\d\u09E6-\u09EF\u0660-\u0669\u06F0-\u06F9]/.test(num);
            if (startsWithDigit) return false;

            // Non-digit leading character means it's a letter prefix like 'أ.', '(أ)', 'الف.', 'ক.', '(ক)', 'a.', '(a)', 'i.'
            return true;
          };

          const isUnnumbered = (q: QuestionData): boolean => {
            return (
              q.typology === 'PASSAGE_ONLY' ||
              q.typology === 'SPACER' ||
              (q.typology === 'SECTION_TITLE' && (!q.customNumber || q.customNumber.trim() === '')) ||
              q.groupRole === 'passage'
            );
          };

          const updatedQuestions = state.questions.map((q) => {
            let item = { ...q };

            // 0. If item is a sub-exercise under Q4 choice question, omit individual redundant marks
            const isGroupSubChoice = Boolean(
              item.groupId &&
                (item.groupRole?.startsWith('ghayr_') ||
                 ['verb_shift', 'antonyms', 'tahqeeq', 'rearrange', 'number_swap'].includes(item.groupRole || '')) &&
                item.groupRole !== 'ghayr_q3' &&
                item.groupRole !== 'ghayr_q4_title'
            );
            if (isGroupSubChoice) {
              item.customMarksText = '';
            }

            // 0b. Sanitize subQuestions for Arabic papers: convert numeric or 'أ' to 'الف', 'ب', 'ج', 'د'
            if (isArabicPaper && item.subQuestions && item.subQuestions.length > 0) {
              item.subQuestions = item.subQuestions.map((sq, idx) => {
                const raw = String(sq.part || '').trim();
                if (!raw || /^[\d\u09E6-\u09EF\u0660-\u0669\u06F0-\u06F9]+$/.test(raw)) {
                  return { ...sq, part: (AR_SUB_LETTERS[idx] || raw) as any };
                }
                if (raw === 'أ' || raw === 'ا') {
                  return { ...sq, part: 'الف' as any };
                }
                return sq;
              });
            }

            // 1. Passage only or unnumbered items stay unnumbered
            if (isUnnumbered(item)) {
              return { ...item, customNumber: '' };
            }

            // 2. Sub-questions or lettered exercise parts remain untouched!
            if (isLetteredSubPart(item)) {
              return item;
            }

            // 3. Main top-level questions get formatted sequential numbers (১., ২., ৩... বা ١., ٢., ٣... বা 1., 2., 3...)
            const formatted = formatQuestionNumber(mainSeq, numberingFormat);
            mainSeq += 1;
            return {
              ...item,
              customNumber: formatted,
            };
          });

          return {
            ...withHistory(state),
            questions: updatedQuestions,
          };
        });
      },

      moveQuestion: (fromIndex, toIndex) => {
        set((state) => {
          const updated = [...state.questions];
          const [movedItem] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, movedItem);
          return { ...withHistory(state), questions: updated };
        });
      },

      /**
       * Duplicates the question at `index` and inserts the copy immediately after it.
       * The copy receives a fresh unique ID so it won't clash during DnD or React rendering.
       */
      duplicateQuestion: (index) => {
        let newId = '';
        set((state) => {
          const original = state.questions[index];
          if (!original) return state;
          newId = generateTempId(index);
          const copy: QuestionData = { ...original, _id: newId };
          const updated = [...state.questions];
          updated.splice(index + 1, 0, copy);
          return { ...withHistory(state), questions: updated };
        });
        return newId;
      },

      clearCart: () => {
        set((state) => ({
          ...withHistory(state),
          questions: [],
          sections: [],
          sets: [],
          activeSet: '',
        }));
      },

      loadFullPaper: (data) => {
        set((state) => ({
          ...withHistory(state),
          hasCompletedSetup: true,
          headerConfig: data.headerConfig ? { ...state.headerConfig, ...data.headerConfig } : state.headerConfig,
          layoutConfig: data.layoutConfig ? { ...state.layoutConfig, ...data.layoutConfig } : state.layoutConfig,
          sections: data.sections !== undefined ? data.sections : state.sections,
          questions: data.questions !== undefined ? data.questions : state.questions,
          sets: [],
          activeSet: '',
        }));
      },

      updateHeaderConfig: (patch) => {
        set((state) => ({
          ...withHistory(state),
          headerConfig: { ...state.headerConfig, ...patch },
        }));
      },

      applyHeaderPreset: (preset) => {
        set((state) => {
          const hist = withHistory(state);
          if (preset === 'ALIA') {
            return {
              ...hist,
              headerConfig: {
                ...state.headerConfig,
                headerPreset: 'ALIA',
                educationStream: 'ALIA',
                bismillahText: undefined,
              },
            };
          }
          if (preset === 'QAWMI') {
            return {
              ...hist,
              headerConfig: {
                ...state.headerConfig,
                headerPreset: 'QAWMI',
                educationStream: 'QAWMI',
                institutionName: state.headerConfig.institutionName.includes('স্কুল')
                  ? 'মাদরাসা দারুল উলূম ও জামিয়া আরাবিয়া'
                  : state.headerConfig.institutionName,
                institutionAddress: state.headerConfig.institutionAddress || 'ঢাকা, বাংলাদেশ',
                examTitle: 'মারহালা / বার্ষিক পরীক্ষা - ১৪৪৭ হি.',
                bismillahText: undefined,
                kitab: state.headerConfig.kitab || state.headerConfig.subject || 'শরহে বেকায়া (ফিকহ)',
                jamat: state.headerConfig.jamat || 'মিশকাত জামাত',
                questionsToAnswer: 5,
                totalQuestionsIncluded: state.questions.length || 8,
                choiceInstructionText: 'যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)',
              },
            };
          }
          if (preset === 'NOORANI') {
            return {
              ...hist,
              headerConfig: {
                ...state.headerConfig,
                headerPreset: 'NOORANI',
                educationStream: 'NOORANI',
                institutionName: state.headerConfig.institutionName.includes('স্কুল')
                  ? "নূরানী তা'লীমুল কুরআন মাদরাসা ও মডেল মক্তব"
                  : state.headerConfig.institutionName,
                institutionAddress: state.headerConfig.institutionAddress || 'ঢাকা',
                examTitle: '১ম সাময়িক পরীক্ষা',
                subject: 'কুরআন মজিদ ও তাজবীদ',
                grade: 'শিশু শ্রেণি / ১ম শ্রেণি',
                timeAllowed: '১ ঘণ্টা ৩০ মিনিট',
                totalMarks: 50,
              },
              layoutConfig: {
                ...state.layoutConfig,
                fontSize: 'standard',
                columns: 1,
              },
            };
          }
          if (preset === 'NOORANI_GRID') {
            const nooraniSampleQuestions: QuestionData[] = [
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: '৫ নম্বর ভাগের হরফগুলো সুন্দর করে সাজিয়ে লিখ:',
                marks: 10,
                difficulty: 'Easy',
                languages: ['bn'],
                sourceType: 'MANUAL',
                writingBoxes: { type: 'row', count: 4 },
              },
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: '৭ নম্বর ভাগের হরফগুলো সুন্দর করে সাজিয়ে লিখ:',
                marks: 10,
                difficulty: 'Easy',
                languages: ['bn'],
                sourceType: 'MANUAL',
                writingBoxes: { type: 'row', count: 4 },
              },
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: 'খালিঘর পূরণ কর:',
                marks: 15,
                difficulty: 'Medium',
                languages: ['bn', 'ar'],
                sourceType: 'MANUAL',
                writingBoxes: {
                  type: 'grid',
                  rows: 3,
                  cols: 5,
                  cells: [
                    ['ك', '', 'ث', '', 'ب'],
                    ['ذ', '', 'و', '', 'ر'],
                    ['×', '×', 'ل', '', 'ن'],
                  ],
                },
              },
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: 'কায়দার তারতীবে ২৯ হরফ লিখ:',
                marks: 25,
                difficulty: 'Medium',
                languages: ['bn'],
                sourceType: 'MANUAL',
                writingBoxes: {
                  type: 'grid',
                  rows: 5,
                  cols: 7,
                  cells: [
                    ['', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', ''],
                    ['×', '', '', '', '', '', ''],
                  ],
                },
              },
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: 'و এর সঙ্গে ১০ সূরত সুন্দর করে সাজিয়ে লিখ:',
                marks: 20,
                difficulty: 'Medium',
                languages: ['bn', 'ar'],
                sourceType: 'MANUAL',
                writingBoxes: { type: 'row', count: 10 },
              },
              {
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                typology: 'HURUF_TAJWEED',
                educationStream: 'NOORANI',
                stemOrPassage: 'বাকি কয় হরফ মুরাক্কাব হয় না সুন্দর করে সাজিয়ে লিখ:',
                marks: 14,
                difficulty: 'Medium',
                languages: ['bn'],
                sourceType: 'MANUAL',
                writingBoxes: { type: 'row', count: 6 },
              },
            ];

            return {
              ...hist,
              headerConfig: {
                ...state.headerConfig,
                headerPreset: 'NOORANI_GRID',
                educationStream: 'NOORANI',
                nooraniBoardTitle: 'ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ',
                institutionName: 'ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ',
                examTitle: 'নূরানী বার্ষিক পরীক্ষা- ২০২৬',
                subject: 'আরবী লিখা',
                grade: 'নার্সারী',
                timeAllowed: '২ ঘণ্টা',
                totalMarks: 100,
                handwritingMarks: 6,
                showScoreRubricTable: true,
              },
              layoutConfig: {
                ...state.layoutConfig,
                columns: 1,
                fontSize: 'standard',
                margins: { topMm: 12, bottomMm: 12, leftMm: 16, rightMm: 16 },
                numberingFormat: 'bn',
              },
              questions: nooraniSampleQuestions,
            };
          }
          // NCTB / ALIA default
          return {
            ...hist,
            headerConfig: {
              ...state.headerConfig,
              headerPreset: 'NCTB',
              educationStream: 'GENERAL',
              questionsToAnswer: undefined,
              choiceInstructionText: undefined,
              handwritingMarks: undefined,
            },
          };
        });
      },

      setChoiceRule: (questionsToAnswer, marksPerQuestion, text) => {
        set((state) => {
          const qCount = questionsToAnswer || state.headerConfig.questionsToAnswer;
          const mPerQ = marksPerQuestion || state.questions[0]?.marks || 10;
          const formulaText =
            text ||
            (qCount ? `যেকোনো ${qCount}টি প্রশ্নের উত্তর দাও (${qCount} × ${mPerQ} = ${qCount * mPerQ})` : '');
          return {
            ...withHistory(state),
            headerConfig: {
              ...state.headerConfig,
              questionsToAnswer,
              totalQuestionsIncluded: state.questions.length,
              choiceInstructionText: formulaText,
            },
          };
        });
      },

      updateLayoutConfig: (patch) => {
        set((state) => ({
          ...withHistory(state),
          layoutConfig: { ...state.layoutConfig, ...patch },
        }));
      },

      setGeneratedSets: (sets) => {
        set({ sets });
      },

      setActiveSet: (setName) => {
        set({ activeSet: setName });
      },

      getTotalMarks: () => {
        const { questions, sections, headerConfig } = get();

        // 1. If paper-level choice rule is set without sections (e.g. Qawmi: answer any 5)
        if (headerConfig.questionsToAnswer && (!sections || sections.length === 0)) {
          const sorted = [...questions].map((q) => q.marks || 0).sort((a, b) => b - a);
          const top = sorted.slice(0, headerConfig.questionsToAnswer);
          return top.reduce((a, b) => a + b, 0);
        }

        // 2. If no sections defined, sum all question marks directly
        if (!sections || sections.length === 0) {
          return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        }

        let total = 0;

        // 3. Calculate for each defined section based on choice rules
        sections.forEach((sec) => {
          const secQuestions = questions.filter((q) => q.sectionId === sec.id);

          if (typeof sec.totalMarks === 'number' && sec.totalMarks > 0) {
            total += sec.totalMarks;
          } else if (sec.requiredCount && sec.marksPerQuestion) {
            total += sec.requiredCount * sec.marksPerQuestion;
          } else if (sec.requiredCount && secQuestions.length > 0) {
            const sorted = [...secQuestions].map((q) => q.marks || 0).sort((a, b) => b - a);
            const top = sorted.slice(0, sec.requiredCount);
            total += top.reduce((a, b) => a + b, 0);
          } else {
            total += secQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
          }
        });

        // 4. Add unassigned questions (not in any section)
        const unassigned = questions.filter(
          (q) => !q.sectionId || !sections.some((s) => s.id === q.sectionId)
        );
        total += unassigned.reduce((sum, q) => sum + (q.marks || 0), 0);

        return total;
      },

      getPaperData: () => {
        const { questions, sections, headerConfig, layoutConfig, sets, activeSet, getTotalMarks } =
          get();
        return {
          title: `${headerConfig.examTitle} - ${headerConfig.subject}`,
          headerConfig: {
            ...headerConfig,
            totalMarks: getTotalMarks() || headerConfig.totalMarks,
          },
          layoutConfig,
          sections,
          questions,
          sets,
          activeSet,
        };
      },
    }),
    {
      name: 'proshno-paper-v1', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the data fields — not the action functions
      partialize: (state) => ({
        questions: state.questions,
        sections: state.sections,
        headerConfig: state.headerConfig,
        layoutConfig: state.layoutConfig,
        sets: state.sets,
        activeSet: state.activeSet,
        hasCompletedSetup: state.hasCompletedSetup,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.sets || state.sets.length === 0) {
            state.setActiveSet('');
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);
