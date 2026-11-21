'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QuestionData } from 'proshno-shared';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Pencil,
} from 'lucide-react';

export interface NasrulMadroosGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
  legacyQuestionIds?: string[];
  passageQuestionId?: string;
}

/**
 * Extracts all existing Nasrul Madroos blocks on the canvas.
 * Supports both tagged `groupId` blocks and legacy untagged blocks already saved in localStorage.
 */
export function extractNasrulMadroosGroups(
  questions: QuestionData[]
): NasrulMadroosGroup[] {
  const groups: NasrulMadroosGroup[] = [];
  const seenGroupIds = new Set<string>();
  const claimedIndices = new Set<number>();

  // 1. Collect explicitly grouped Nasrul Madroos blocks
  questions.forEach((q, idx) => {
    if (q.groupId && q.groupId.startsWith('nasrul-madroos') && !seenGroupIds.has(q.groupId)) {
      seenGroupIds.add(q.groupId);
      const groupQs: QuestionData[] = [];
      questions.forEach((item, i) => {
        if (item.groupId === q.groupId) {
          groupQs.push(item);
          claimedIndices.add(i);
        }
      });
      const passageQ = groupQs.find(
        (item) => item.groupRole === 'passage' || item.typology === 'PASSAGE_ONLY'
      );
      const snippet = (passageQ?.stemOrPassage || groupQs[0]?.stemOrPassage || '')
        .trim()
        .slice(0, 28);
      groups.push({
        groupId: q.groupId,
        label: `নস ${groups.length + 1}${snippet ? `: ${snippet}…` : ''}`,
        questions: groupQs,
        passageQuestionId: passageQ?._id,
      });
    }
  });

  // 2. Fallback for legacy papers without groupId (starts from an unclaimed PASSAGE_ONLY)
  const linkableSubTypologies = new Set([
    'PASSAGE_QA',
    'GROUP_TITLE',
    'TRUE_FALSE',
    'FILL_BLANKS',
    'QAWAID_MISAL',
  ]);
  const subPartNumbers = new Set(['أ.', 'ب.', 'ج.', 'د.', 'هـ.', 'و.', 'ز.', 'ح.', 'أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح']);

  for (let i = 0; i < questions.length; i++) {
    if (claimedIndices.has(i)) continue;
    const q = questions[i];
    if (q.typology !== 'PASSAGE_ONLY') continue;

    const groupQs: QuestionData[] = [q];
    claimedIndices.add(i);
    const baseSectionId = q.sectionId;

    // Collect immediately following linked Nasrul Madroos questions in the same section
    let seenQ2Title = false;
    for (let j = i + 1; j < questions.length; j++) {
      if (claimedIndices.has(j)) break;
      const next = questions[j];
      if (next.sectionId !== baseSectionId) break;
      if (next.typology === 'PASSAGE_ONLY') break;

      const isQ2SubDescriptive =
        seenQ2Title &&
        next.typology === 'DESCRIPTIVE' &&
        Boolean(next.customNumber && subPartNumbers.has(next.customNumber.trim()));

      if (linkableSubTypologies.has(next.typology) || isQ2SubDescriptive) {
        if (next.typology === 'GROUP_TITLE') seenQ2Title = true;
        groupQs.push(next);
        claimedIndices.add(j);
      } else {
        break;
      }
    }

    const legacyIds = groupQs.map((item) => item._id).filter(Boolean) as string[];
    const snippet = (q.stemOrPassage || '').trim().slice(0, 28);
    groups.push({
      groupId: `nasrul-madroos-legacy-${groups.length + 1}`,
      label: `নস ${groups.length + 1}${snippet ? `: ${snippet}…` : ''}`,
      questions: groupQs,
      legacyQuestionIds: legacyIds,
      passageQuestionId: q._id,
    });
  }

  return groups;
}

const DEFAULT_DIRECTION = 'اقرأ النص التالي ثم أجب عن الأسئلة الملحقة به :';
const DEFAULT_PASSAGE =
  'هُوَ النُّعْمَانُ بْنُ ثَابِتٍ وَكُنْيَتُهُ أَبُو حَنِيفَةَ وَلُقِّبَ بِالإِمَامِ الأَعْظَمِ، وُلِدَ بِالْكُوفَةِ سَنَةَ ثَمَانِينَ مِنَ الْهِجْرَةِ فِي عَهْدِ الْخَلِيفَةِ عَبْدِ الْمَلِكِ بْنِ مَرْوَانَ، كَانَ مِنْ سِيَمَاهُ أَنَّهُ كَانَ طَوِيلَ الصَّمْتِ دَائِمَ الْفِكْرِ وَكَانَ رَجُلاً عَالِمًا زَاهِدًا عَامِلاً بِمَا عَلِمَ.';
const DEFAULT_Q1_QUESTIONS = [
  { id: '1', part: 'أ', text: 'ما اسم الإمام أبي حنيفة وماذا لقبه؟', marks: 2 },
  { id: '2', part: 'ب', text: 'أين ولد الإمام أبو حنيفة ومتى؟', marks: 2 },
  { id: '3', part: 'ج', text: 'اذكر بعض أوصاف الإمام أبي حنيفة.', marks: 2 },
  { id: '4', part: 'د', text: 'بم اشتهر الإمام أبو حنيفة؟', marks: 2 },
];
const DEFAULT_TF_STATEMENTS = [
  'ولد الإمام أبو حنيفة فى عهد الخليفة عبد الملك ابن مروان.',
  'حفظ أبو حنيفة القرآن الكريم فى كبره.',
  'كان الإمام أبو حنيفة طويل الصمت ودائم الفكر.',
  'خرج الإمام أبو حنيفة لأداء الحج حين بلغ السابعة من عمره.',
];
const DEFAULT_FB_CLUES = 'الكوفة ، ثمانين ، الصمت ، زاهدا';
const DEFAULT_FB_SENTENCES = [
  'ولد الإمام أبو حنيفة بـ .......... سنة ثمانين من الهجرة.',
  'ولد الإمام أبو حنيفة سنة .......... من الهجرة.',
  'كان الإمام أبو حنيفة طويل .......... ودائم الفكر.',
  'كان الإمام أبو حنيفة رجلاً عالماً .......... عاملاً بما علم.',
];
const DEFAULT_VOCAB_WORDS = ['عالم', 'زاهد', 'الصمت', 'سنة'];
const DEFAULT_SENTENCE_WORDS = ['الخليفة', 'الهجرة', 'الفكر', 'العلم'];

interface NasrulMadroosModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: NasrulMadroosGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string,
    legacyQuestionIds?: string[]
  ) => void;
}

export const NasrulMadroosModal: React.FC<NasrulMadroosModalProps> = ({
  isOpen,
  onClose,
  allGroups,
  activeGroupId,
  onSelectGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  // ── PASSAGE (النص المدروس) STATE ──
  const [directionText, setDirectionText] = useState(DEFAULT_DIRECTION);
  const [passageText, setPassageText] = useState(DEFAULT_PASSAGE);

  // ── 1. COMPREHENSION Q&A STATE ──
  const [includeQ1, setIncludeQ1] = useState(true);
  const [q1Number, setQ1Number] = useState('١.');
  const [q1Title, setQ1Title] = useState('أجب عن الأسئلة التالية باللغة العربية :');
  const [q1MarksFormula, setQ1MarksFormula] = useState('٢×٤= ٨');
  const [q1Questions, setQ1Questions] = useState(DEFAULT_Q1_QUESTIONS);

  // ── 2. PARENT QUESTION 2 STATE ──
  const [includeQ2, setIncludeQ2] = useState(true);
  const [q2Number, setQ2Number] = useState('٢.');
  const [q2Title, setQ2Title] = useState('أجب عن أي أربعة من الأسئلة الآتية :');
  const [q2MarksFormula, setQ2MarksFormula] = useState('(٤ × ٤ = ١٦)');

  // Sub A: True/False
  const [subTrueFalseEnabled, setSubTrueFalseEnabled] = useState(true);
  const [subTrueFalsePart, setSubTrueFalsePart] = useState('أ.');
  const [subTrueFalseTitle, setSubTrueFalseTitle] = useState(
    'اكتب (صحيح) إذا كانت العبارة صحيحة أو (خطأ) إذا كانت العبارة خاطئة مع تصحيح الخطأ :'
  );
  const [subTrueFalseFormula, setSubTrueFalseFormula] = useState('١×٤= ٤');
  const [subTrueFalseStatements, setSubTrueFalseStatements] = useState(DEFAULT_TF_STATEMENTS);

  // Sub B: Fill Blanks
  const [subFillBlanksEnabled, setSubFillBlanksEnabled] = useState(true);
  const [subFillBlanksPart, setSubFillBlanksPart] = useState('ب.');
  const [subFillBlanksTitle, setSubFillBlanksTitle] = useState(
    'املاً الفراغ في الجمل الآتية بكلمة مناسبة من الصندوق :'
  );
  const [subFillBlanksFormula, setSubFillBlanksFormula] = useState('١×٤= ٤');
  const [subFillBlanksClues, setSubFillBlanksClues] = useState(DEFAULT_FB_CLUES);
  const [subFillBlanksSentences, setSubFillBlanksSentences] = useState(DEFAULT_FB_SENTENCES);

  // Sub C: Vocab
  const [subVocabEnabled, setSubVocabEnabled] = useState(true);
  const [subVocabPart, setSubVocabPart] = useState('ج.');
  const [subVocabTitle, setSubVocabTitle] = useState('هات مرادف الكلمات الآتية :');
  const [subVocabFormula, setSubVocabFormula] = useState('١×٤= ٤');
  const [subVocabWords, setSubVocabWords] = useState(DEFAULT_VOCAB_WORDS);

  // Sub D: Sentences
  const [subSentenceEnabled, setSubSentenceEnabled] = useState(true);
  const [subSentencePart, setSubSentencePart] = useState('د.');
  const [subSentenceTitle, setSubSentenceTitle] = useState(
    'كون جملة مفيدة من الكلمات الآتية :'
  );
  const [subSentenceFormula, setSubSentenceFormula] = useState('١×٤= ٤');
  const [subSentenceWords, setSubSentenceWords] = useState(DEFAULT_SENTENCE_WORDS);

  // Extra Sub-Questions under Q2
  interface ExtraSubExercise {
    id: string;
    part: string;
    title: string;
    formula: string;
    items: string[];
  }
  const [extraSubExercises, setExtraSubExercises] = useState<ExtraSubExercise[]>([]);

  // Auto-hydrate form from existing canvas group when opened in Edit mode, or reset cleanly in Create mode
  useEffect(() => {
    if (!isOpen) return;

    if (!activeGroup) {
      // Fresh Create New Nasrul Madroos template
      setDirectionText(DEFAULT_DIRECTION);
      setPassageText(DEFAULT_PASSAGE);
      setIncludeQ1(true);
      setQ1Number('١.');
      setQ1Title('أجب عن الأسئلة التالية باللغة العربية :');
      setQ1MarksFormula('٢×٤= ٨');
      setQ1Questions(DEFAULT_Q1_QUESTIONS);

      setIncludeQ2(true);
      setQ2Number('٢.');
      setQ2Title('أجب عن أي أربعة من الأسئلة الآتية :');
      setQ2MarksFormula('(٤ × ٤ = ١٦)');

      setSubTrueFalseEnabled(true);
      setSubTrueFalsePart('أ.');
      setSubTrueFalseTitle(
        'اكتب (صحيح) إذا كانت العبارة صحيحة أو (خطأ) إذا كانت العبارة خاطئة مع تصحيح الخطأ :'
      );
      setSubTrueFalseFormula('١×٤= ٤');
      setSubTrueFalseStatements(DEFAULT_TF_STATEMENTS);

      setSubFillBlanksEnabled(true);
      setSubFillBlanksPart('ب.');
      setSubFillBlanksTitle('املاً الفراغ في الجمل الآتية بكلمة مناسبة من الصندوق :');
      setSubFillBlanksFormula('١×٤= ٤');
      setSubFillBlanksClues(DEFAULT_FB_CLUES);
      setSubFillBlanksSentences(DEFAULT_FB_SENTENCES);

      setSubVocabEnabled(true);
      setSubVocabPart('ج.');
      setSubVocabTitle('هات مرادف الكلمات الآتية :');
      setSubVocabFormula('١×٤= ٤');
      setSubVocabWords(DEFAULT_VOCAB_WORDS);

      setSubSentenceEnabled(true);
      setSubSentencePart('د.');
      setSubSentenceTitle('كون جملة مفيدة من الكلمات الآتية :');
      setSubSentenceFormula('١×٤= ٤');
      setSubSentenceWords(DEFAULT_SENTENCE_WORDS);
      setExtraSubExercises([]);
      return;
    }

    const qs = activeGroup.questions;

    // 1. Passage
    const passageQ = qs.find((q) => q.groupRole === 'passage' || q.typology === 'PASSAGE_ONLY');
    setDirectionText(passageQ?.topic || DEFAULT_DIRECTION);
    setPassageText(passageQ?.stemOrPassage || '');

    // 2. Q1 Comprehension
    const q1Item = qs.find((q) => q.groupRole === 'q1' || q.typology === 'PASSAGE_QA');
    if (q1Item) {
      setIncludeQ1(true);
      setQ1Number(q1Item.customNumber || '١.');
      setQ1Title(q1Item.stemOrPassage || 'أجب عن الأسئلة التالية باللغة العربية :');
      setQ1MarksFormula(q1Item.customMarksText || '٢×٤= ٨');
      setQ1Questions(
        (q1Item.subQuestions || []).length > 0
          ? (q1Item.subQuestions || []).map((sq, idx) => ({
              id: String(idx + 1),
              part: String(sq.part || ['أ', 'ب', 'ج', 'د'][idx] || idx + 1),
              text: sq.questionText || '',
              marks: sq.marks || 2,
            }))
          : DEFAULT_Q1_QUESTIONS
      );
    } else {
      setIncludeQ1(false);
    }

    // 3. Q2 Group & Sub-exercises
    const q2TitleItem = qs.find(
      (q) => q.groupRole === 'q2_title' || q.typology === 'GROUP_TITLE'
    );
    const tfItem = qs.find((q) => q.groupRole === 'true_false' || q.typology === 'TRUE_FALSE');
    const fbItem = qs.find((q) => q.groupRole === 'fill_blanks' || q.typology === 'FILL_BLANKS');
    const qawaidItems = qs.filter((q) => q.typology === 'QAWAID_MISAL');
    const vocabItem =
      qs.find((q) => q.groupRole === 'vocab') || qawaidItems[0];
    const sentenceItem =
      qs.find((q) => q.groupRole === 'sentence') ||
      qs.find((q) => q.typology === 'DESCRIPTIVE') ||
      (qawaidItems.length > 1 ? qawaidItems[1] : undefined);

    const hasAnyQ2 = Boolean(q2TitleItem || tfItem || fbItem || vocabItem || sentenceItem);
    setIncludeQ2(hasAnyQ2);

    if (q2TitleItem) {
      setQ2Number(q2TitleItem.customNumber || '٢.');
      setQ2Title(q2TitleItem.stemOrPassage || 'أجب عن أي أربعة من الأسئلة الآتية :');
      setQ2MarksFormula(q2TitleItem.customMarksText || '(٤ × ٤ = ١٦)');
    }

    if (tfItem) {
      setSubTrueFalseEnabled(true);
      setSubTrueFalsePart(tfItem.customNumber || 'أ.');
      setSubTrueFalseTitle(tfItem.stemOrPassage || '');
      setSubTrueFalseFormula(tfItem.customMarksText || '١×٤= ٤');
      setSubTrueFalseStatements(
        (tfItem.subQuestions || []).map((sq) => sq.questionText || '')
      );
    } else {
      setSubTrueFalseEnabled(false);
    }

    if (fbItem) {
      setSubFillBlanksEnabled(true);
      setSubFillBlanksPart(fbItem.customNumber || 'ب.');
      setSubFillBlanksTitle(fbItem.stemOrPassage || '');
      setSubFillBlanksFormula(fbItem.customMarksText || '١×٤= ٤');
      setSubFillBlanksClues((fbItem.wordClues || []).join(' ، '));
      setSubFillBlanksSentences(
        (fbItem.subQuestions || []).map((sq) => sq.questionText || '')
      );
    } else {
      setSubFillBlanksEnabled(false);
    }

    if (vocabItem) {
      setSubVocabEnabled(true);
      setSubVocabPart(vocabItem.customNumber || 'ج.');
      setSubVocabTitle(vocabItem.stemOrPassage || '');
      setSubVocabFormula(vocabItem.customMarksText || '١×٤= ٤');
      setSubVocabWords((vocabItem.subQuestions || []).map((sq) => sq.questionText || ''));
    } else {
      setSubVocabEnabled(false);
    }

    if (sentenceItem) {
      setSubSentenceEnabled(true);
      setSubSentencePart(sentenceItem.customNumber || 'د.');
      setSubSentenceTitle(sentenceItem.stemOrPassage || '');
      setSubSentenceFormula(sentenceItem.customMarksText || '١×٤= ٤');
      setSubSentenceWords((sentenceItem.subQuestions || []).map((sq) => sq.questionText || ''));
    } else {
      setSubSentenceEnabled(false);
    }

    // 4. Hydrate any extra custom sub-exercises under Q2
    const standardIds = new Set(
      [
        passageQ?._id,
        q1Item?._id,
        q2TitleItem?._id,
        tfItem?._id,
        fbItem?._id,
        vocabItem?._id,
        sentenceItem?._id,
      ].filter(Boolean)
    );
    const extraQs = qs.filter(
      (q) =>
        !standardIds.has(q._id) &&
        q.typology !== 'GROUP_TITLE' &&
        q.typology !== 'PASSAGE_ONLY' &&
        q.groupRole !== 'passage'
    );
    setExtraSubExercises(
      extraQs.map((eq, eIdx) => ({
        id: eq._id || `extra-${eIdx}`,
        part: eq.customNumber || ['هـ.', 'و.', 'ز.', 'ح.'][eIdx] || `هـ${eIdx + 1}.`,
        title: eq.stemOrPassage || '',
        formula: eq.customMarksText || '١×٤= ٤',
        items: (eq.subQuestions || []).map((sq) => sq.questionText || ''),
      }))
    );
  }, [isOpen, activeGroup]);

  if (!isOpen) return null;

  const buildQuestionsPayload = (targetGroupId: string): QuestionData[] => {
    const questionsToInsert: QuestionData[] = [];

    // 1. Passage
    if (passageText.trim()) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'passage',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'PASSAGE_ONLY',
        topic: directionText.trim() || DEFAULT_DIRECTION,
        stemOrPassage: passageText.trim(),
        marks: 0,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 2. Q1 Comprehension
    if (includeQ1 && q1Questions.length > 0) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'q1',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'PASSAGE_QA',
        customNumber: q1Number.trim() || '١.',
        stemOrPassage: q1Title.trim() || 'أجب عن الأسئلة التالية باللغة العربية :',
        customMarksText: q1MarksFormula.trim() || '٢×٤= ٨',
        subQuestions: q1Questions.map((q) => ({
          part: q.part as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: q.text,
          marks: q.marks,
        })),
        marks: q1Questions.reduce((sum, q) => sum + (q.marks || 0), 0),
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 3. Q2 Group Title & Sub-exercises
    if (includeQ2) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'q2_title',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        customNumber: q2Number.trim() || '٢.',
        stemOrPassage: q2Title.trim() || 'أجب عن أي أربعة من الأسئلة الآتية :',
        customMarksText: q2MarksFormula.trim() || '(٤ × ٤ = ١٦)',
        marks: 16,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });

      if (subTrueFalseEnabled) {
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'true_false',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'TRUE_FALSE',
          customNumber: subTrueFalsePart.trim() || 'أ.',
          customMarksText: subTrueFalseFormula.trim() || '١×٤= ٤',
          stemOrPassage: subTrueFalseTitle.trim(),
          subQuestions: subTrueFalseStatements.map((stmt, idx) => ({
            part: (['الف', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || String(idx + 1)) as any,
            bloomLevel: 'comprehension',
            bloomTitle: '',
            questionText: stmt,
            marks: 1,
          })),
          marks: subTrueFalseStatements.length,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      if (subFillBlanksEnabled) {
        const clues = subFillBlanksClues
          .split(/[،,]/)
          .map((c) => c.trim())
          .filter(Boolean);

        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'fill_blanks',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'FILL_BLANKS',
          customNumber: subFillBlanksPart.trim() || 'ب.',
          customMarksText: subFillBlanksFormula.trim() || '١×٤= ٤',
          stemOrPassage: subFillBlanksTitle.trim(),
          wordClues: clues.length > 0 ? clues : undefined,
          subQuestions: subFillBlanksSentences.map((sent, idx) => ({
            part: (['الف', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || String(idx + 1)) as any,
            bloomLevel: 'comprehension',
            bloomTitle: '',
            questionText: sent,
            marks: 1,
          })),
          marks: subFillBlanksSentences.length,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      if (subVocabEnabled) {
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'vocab',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'QAWAID_MISAL',
          customNumber: subVocabPart.trim() || 'ج.',
          customMarksText: subVocabFormula.trim() || '١×٤= ٤',
          stemOrPassage: subVocabTitle.trim(),
          subQuestions: subVocabWords.map((w, idx) => ({
            part: (['الف', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || String(idx + 1)) as any,
            bloomLevel: 'comprehension',
            bloomTitle: '',
            questionText: w,
            marks: 1,
          })),
          marks: subVocabWords.length,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      if (subSentenceEnabled) {
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'sentence',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subSentencePart.trim() || 'د.',
          customMarksText: subSentenceFormula.trim() || '١×٤= ٤',
          stemOrPassage: subSentenceTitle.trim(),
          subQuestions: subSentenceWords.map((w, idx) => ({
            part: (['الف', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || String(idx + 1)) as any,
            bloomLevel: 'application',
            bloomTitle: '',
            questionText: w,
            marks: 1,
          })),
          marks: subSentenceWords.length,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // Extra custom sub-exercises under Q2
      extraSubExercises.forEach((extra, eIdx) => {
        if (!extra.title.trim() && extra.items.length === 0) return;
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'extra_sub',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'QAWAID_MISAL',
          customNumber: extra.part.trim() || (['هـ.', 'و.', 'ز.', 'ح.'][eIdx] || 'هـ.'),
          customMarksText: extra.formula.trim() || '١×٤= ٤',
          stemOrPassage: extra.title.trim(),
          subQuestions: extra.items.map((item, idx) => ({
            part: (['الف', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || String(idx + 1)) as any,
            bloomLevel: 'application',
            bloomTitle: '',
            questionText: item,
            marks: 1,
          })),
          marks: extra.items.length || 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      });
    }

    return questionsToInsert;
  };

  const handleSubmit = (mode: 'update' | 'create') => {
    const targetGroupId =
      mode === 'update' && activeGroup
        ? activeGroup.groupId
        : `nasrul-madroos-${Date.now()}`;
    const questionsToInsert = buildQuestionsPayload(targetGroupId);
    onSave(
      questionsToInsert,
      mode,
      targetGroupId,
      mode === 'update' ? activeGroup?.legacyQuestionIds : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden sm:my-auto max-h-[94dvh] sm:max-h-[92vh] flex flex-col">
        {/* ── MODAL HEADER ── */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                {isEditMode
                  ? 'নসসুল মাদরুস ও প্রশ্নাবলি এডিট করুন (تعديل النص المدروس)'
                  : 'নসসুল মাদরুস ও প্রশ্নাবলি তৈরি করুন (إعداد النص المدروس)'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {isEditMode
                  ? 'পেপারে থাকা নস ও প্রশ্নগুলো নিচে লোড হয়েছে — পরিবর্তন করে আপডেট করলে আগের জায়গাতেই আপডেট হবে।'
                  : 'অনুচ্ছেদ দিন এবং নিচে পছন্দমতো প্রশ্নসমূহ টিক দিয়ে কনফিগার করে এক ক্লিকে পেপারে যুক্ত করুন।'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SMART MODE SWITCHER BAR (When at least 1 Nasrul Madroos already exists on paper) ── */}
        {allGroups.length > 0 && (
          <div className="px-5 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-600 mr-1">
                পেপারে বিদ্যমান নস:
              </span>
              {allGroups.map((g) => {
                const selected = activeGroupId === g.groupId;
                return (
                  <button
                    key={g.groupId}
                    type="button"
                    onClick={() => onSelectGroupId(g.groupId)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      selected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    <Pencil className="w-3 h-3" />
                    <span className="max-w-[160px] truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onSelectGroupId(null)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                !isEditMode
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-50'
              }`}
              title="আগের নস ঠিক রেখে নতুন আরেকটি নস (যেমন النص غير المدروس) যোগ করুন"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ নতুন আরেকটি নস যোগ করুন</span>
            </button>
          </div>
        )}

        {/* ── MODAL BODY (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* SECTION 1: PASSAGE */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 font-serif">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                ১. নসসুল মাদরুসের নির্দেশনা ও অনুচ্ছেদ (النص المدروس) :
              </label>
              <button
                type="button"
                onClick={() =>
                  setPassageText(
                    'هُوَ النُّعْمَانُ بْنُ ثَابِتٍ وَكُنْيَتُهُ أَبُو حَنِيفَةَ وَلُقِّبَ بِالإِمَامِ الأَعْظَمِ، وُلِدَ بِالْكُوفَةِ سَنَةَ ثَمَانِينَ مِنَ الْهِجْرَةِ فِي عَهْدِ الْخَلِيفَةِ عَبْدِ الْمَلِكِ بْنِ مَرْوَانَ...'
                  )
                }
                className="text-[11px] text-emerald-700 hover:underline font-bold"
              >
                বোর্ড নমুনা টেক্সট রিসেট
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                অনুচ্ছেদের শিরোনাম বা দিকনির্দেশনা (Direction Heading):
              </label>
              <input
                type="text"
                dir="rtl"
                value={directionText}
                onChange={(e) => setDirectionText(e.target.value)}
                className="w-full text-xs font-serif font-bold text-right py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="اقرأ النص التالي ثم أجب عن الأسئلة الملحقة به :"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                মূল আরবি অনুচ্ছেদ বা গল্প (Arabic Passage Content):
              </label>
              <textarea
                dir="rtl"
                rows={4}
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                className="w-full text-sm font-serif leading-relaxed text-right p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                placeholder="এখানে আপনার আরবি অনুচ্ছেদ লিখুন বা পেস্ট করুন..."
              />
            </div>
          </div>

          {/* SECTION 2: EXERCISE 1 (Q1 COMPREHENSION) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeQ1}
                  onChange={(e) => setIncludeQ1(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-bold text-xs text-slate-900 font-serif">
                  [✓] ১ নং প্রশ্ন: আরবিতে সংক্ষেপে উত্তর দাও (أسئلة الفهم والإستيعاب)
                </span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                মান: {q1MarksFormula}
              </span>
            </div>

            {includeQ1 && (
              <div className="p-4 space-y-3 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">প্রশ্ন নম্বর:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q1Number}
                      onChange={(e) => setQ1Number(e.target.value)}
                      className="w-full text-xs font-serif font-bold py-1.5 px-2 border border-slate-300 rounded outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500">প্রশ্ন নির্দেশনা:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q1Title}
                      onChange={(e) => setQ1Title(e.target.value)}
                      className="w-full text-xs font-serif font-bold py-1.5 px-2 border border-slate-300 rounded outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>প্রশ্নগুলোর তালিকা ({q1Questions.length}টি প্রশ্ন):</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextPart =
                          q1Questions.length === 0
                            ? 'أ'
                            : q1Questions.length === 1
                            ? 'ب'
                            : q1Questions.length === 2
                            ? 'ج'
                            : q1Questions.length === 3
                            ? 'د'
                            : 'هـ';
                        setQ1Questions([
                          ...q1Questions,
                          {
                            id: String(Date.now()),
                            part: nextPart,
                            text: 'اكتب السؤال هنا...',
                            marks: 2,
                          },
                        ]);
                      }}
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ প্রশ্ন যোগ করুন</span>
                    </button>
                  </div>

                  {q1Questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="flex items-center gap-2 p-2 bg-slate-50/70 border border-slate-200 rounded-lg"
                    >
                      <input
                        type="text"
                        value={q.part}
                        onChange={(e) => {
                          const updated = [...q1Questions];
                          updated[idx].part = e.target.value;
                          setQ1Questions(updated);
                        }}
                        className="w-8 text-center text-xs font-bold border border-slate-300 rounded py-1 bg-white"
                        title="সাব-প্রশ্ন ক্রম (أ, ب...)"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...q1Questions];
                          updated[idx].text = e.target.value;
                          setQ1Questions(updated);
                        }}
                        className="flex-1 text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white outline-none"
                        placeholder="প্রশ্নটি লিখুন..."
                      />
                      <div className="flex items-center gap-1 shrink-0 text-xs">
                        <span className="text-[10px] text-slate-400">মান:</span>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => {
                            const updated = [...q1Questions];
                            updated[idx].marks = parseInt(e.target.value, 10) || 1;
                            setQ1Questions(updated);
                          }}
                          className="w-10 text-center text-xs font-mono font-bold border border-slate-300 rounded py-1 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQ1Questions(q1Questions.filter((_, i) => i !== idx));
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                        title="প্রশ্নটি বাদ দিন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: QUESTION 2 WITH SUB-EXERCISES */}
          <div className="border border-purple-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between p-3.5 bg-purple-50/80 border-b border-purple-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeQ2}
                  onChange={(e) => setIncludeQ2(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-bold text-xs text-purple-950 font-serif">
                  [✓] ২ নং দলগত প্রশ্নাবলি ও উপ-প্রশ্নসমূহ (أجب عن أي أربعة من الأسئلة التالية)
                </span>
              </label>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                মান: {q2MarksFormula}
              </span>
            </div>

            {includeQ2 && (
              <div className="p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">ক্রমিক:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q2Number}
                      onChange={(e) => setQ2Number(e.target.value)}
                      className="w-full text-xs font-serif font-bold py-1.5 px-2 border border-slate-300 rounded outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500">মূল নির্দেশনা:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q2Title}
                      onChange={(e) => setQ2Title(e.target.value)}
                      className="w-full text-xs font-serif font-bold py-1.5 px-2 border border-slate-300 rounded outline-none text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">মান বণ্টন সূত্র:</label>
                    <input
                      type="text"
                      value={q2MarksFormula}
                      onChange={(e) => setQ2MarksFormula(e.target.value)}
                      className="w-full text-xs font-mono font-bold py-1.5 px-2 border border-slate-300 rounded outline-none text-center"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700">
                  ২ নং প্রশ্নের অধীনে নিচের কোন কোন উপ-প্রশ্নগুলো অন্তর্ভুক্ত করতে চান?
                </div>

                {/* Sub A: True/False */}
                <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 font-serif">
                      <input
                        type="checkbox"
                        checked={subTrueFalseEnabled}
                        onChange={(e) => setSubTrueFalseEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span>(أ) صح أو خطأ مع تصحيح الخطأ (শুদ্ধ/অশুদ্ধ নির্ণয়)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {subTrueFalseFormula}
                    </span>
                  </div>

                  {subTrueFalseEnabled && (
                    <div className="space-y-1.5 pl-5 pt-1 text-xs">
                      <input
                        type="text"
                        dir="rtl"
                        value={subTrueFalseTitle}
                        onChange={(e) => setSubTrueFalseTitle(e.target.value)}
                        className="w-full text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                        placeholder="নির্দেশনা..."
                      />
                      <div className="space-y-1 pt-1">
                        {subTrueFalseStatements.map((stmt, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-400">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              dir="rtl"
                              value={stmt}
                              onChange={(e) => {
                                const updated = [...subTrueFalseStatements];
                                updated[idx] = e.target.value;
                                setSubTrueFalseStatements(updated);
                              }}
                              className="flex-1 text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSubTrueFalseStatements(
                                  subTrueFalseStatements.filter((_, i) => i !== idx)
                                );
                              }}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSubTrueFalseStatements([...subTrueFalseStatements, 'اكتب العبارة هنا...'])}
                          className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ বাক্য যোগ করুন (Add Statement)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub B: Fill Blanks */}
                <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 font-serif">
                      <input
                        type="checkbox"
                        checked={subFillBlanksEnabled}
                        onChange={(e) => setSubFillBlanksEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 text-amber-600 rounded"
                      />
                      <span>(ب) املاء الفراغ من الصندوق (শব্দ বক্স শূন্যস্থান পূরণ)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {subFillBlanksFormula}
                    </span>
                  </div>

                  {subFillBlanksEnabled && (
                    <div className="space-y-1.5 pl-5 pt-1 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-amber-800">
                          صندوق الكلمات (শব্দ বক্সের শব্দসমূহ — কমা দিয়ে আলাদা করুন):
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={subFillBlanksClues}
                          onChange={(e) => setSubFillBlanksClues(e.target.value)}
                          className="w-full text-xs font-serif text-right py-1 px-2 border border-amber-300 rounded bg-white"
                        />
                      </div>
                      <div className="space-y-1 pt-1">
                        {subFillBlanksSentences.map((sent, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-400">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              dir="rtl"
                              value={sent}
                              onChange={(e) => {
                                const updated = [...subFillBlanksSentences];
                                updated[idx] = e.target.value;
                                setSubFillBlanksSentences(updated);
                              }}
                              className="flex-1 text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSubFillBlanksSentences(
                                  subFillBlanksSentences.filter((_, i) => i !== idx)
                                );
                              }}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSubFillBlanksSentences([...subFillBlanksSentences, 'اكتب الجملة هنا .......... هنا.'])}
                          className="flex items-center gap-1 text-amber-700 hover:text-amber-800 text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ শূন্যস্থান বাক্য যোগ করুন (Add Sentence)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub C: Vocab */}
                <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 font-serif">
                      <input
                        type="checkbox"
                        checked={subVocabEnabled}
                        onChange={(e) => setSubVocabEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 text-purple-600 rounded"
                      />
                      <span>(ج) مرادف / مضاد / استبدال الأعداد (শব্দার্থ ও সংখ্যা রূপান্তর)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {subVocabFormula}
                    </span>
                  </div>

                  {subVocabEnabled && (
                    <div className="space-y-1.5 pl-5 pt-1 text-xs">
                      <input
                        type="text"
                        dir="rtl"
                        value={subVocabTitle}
                        onChange={(e) => setSubVocabTitle(e.target.value)}
                        className="w-full text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {subVocabWords.map((w, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                            <input
                              type="text"
                              dir="rtl"
                              value={w}
                              onChange={(e) => {
                                const updated = [...subVocabWords];
                                updated[idx] = e.target.value;
                                setSubVocabWords(updated);
                              }}
                              className="text-xs font-serif text-right outline-none w-20"
                            />
                            <button
                              type="button"
                              onClick={() => setSubVocabWords(subVocabWords.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-500 p-0.5"
                              title="শব্দটি বাদ দিন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSubVocabWords([...subVocabWords, 'كلمة'])}
                          className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ শব্দ যোগ করুন</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub D: Sentences */}
                <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 font-serif">
                      <input
                        type="checkbox"
                        checked={subSentenceEnabled}
                        onChange={(e) => setSubSentenceEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span>(د) تكوين الجمل المفيدة (বাক্য গঠন)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {subSentenceFormula}
                    </span>
                  </div>

                  {subSentenceEnabled && (
                    <div className="space-y-1.5 pl-5 pt-1 text-xs">
                      <input
                        type="text"
                        dir="rtl"
                        value={subSentenceTitle}
                        onChange={(e) => setSubSentenceTitle(e.target.value)}
                        className="w-full text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {subSentenceWords.map((w, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                            <input
                              type="text"
                              dir="rtl"
                              value={w}
                              onChange={(e) => {
                                const updated = [...subSentenceWords];
                                updated[idx] = e.target.value;
                                setSubSentenceWords(updated);
                              }}
                              className="text-xs font-serif text-right outline-none w-20"
                            />
                            <button
                              type="button"
                              onClick={() => setSubSentenceWords(subSentenceWords.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-500 p-0.5"
                              title="শব্দটি বাদ দিন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSubSentenceWords([...subSentenceWords, 'كلمة'])}
                          className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ শব্দ যোগ করুন</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra Custom Sub-Exercises under Q2 */}
                {extraSubExercises.map((extra, eIdx) => (
                  <div key={extra.id || eIdx} className="p-3 border border-indigo-200 rounded-lg space-y-2 bg-indigo-50/40">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          dir="rtl"
                          value={extra.part}
                          onChange={(e) => {
                            const updated = [...extraSubExercises];
                            updated[eIdx].part = e.target.value;
                            setExtraSubExercises(updated);
                          }}
                          className="w-12 text-center text-xs font-serif font-bold py-1 px-1 border border-indigo-300 rounded bg-white"
                          title="উপ-প্রশ্ন ক্রম (هـ. বা و.)"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          value={extra.title}
                          onChange={(e) => {
                            const updated = [...extraSubExercises];
                            updated[eIdx].title = e.target.value;
                            setExtraSubExercises(updated);
                          }}
                          className="flex-1 text-xs font-serif text-right py-1 px-2 border border-indigo-300 rounded bg-white font-bold"
                          placeholder="উপ-প্রশ্নের শিরোনাম / নির্দেশনা..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={extra.formula}
                          onChange={(e) => {
                            const updated = [...extraSubExercises];
                            updated[eIdx].formula = e.target.value;
                            setExtraSubExercises(updated);
                          }}
                          className="w-20 text-center text-xs font-mono font-bold py-1 border border-indigo-300 rounded bg-white"
                          title="মান বণ্টন সূত্র (যেমন: ١×٤= ٤)"
                        />
                        <button
                          type="button"
                          onClick={() => setExtraSubExercises(extraSubExercises.filter((_, i) => i !== eIdx))}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="এই উপ-প্রশ্নটি মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-5 pt-1 text-xs">
                      {extra.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-1.5">
                          <span className="text-[11px] font-serif font-bold text-slate-400">
                            {['(الف)', '(ب)', '(ج)', '(د)', '(هـ)'][iIdx] || `(${iIdx + 1})`}
                          </span>
                          <input
                            type="text"
                            dir="rtl"
                            value={item}
                            onChange={(e) => {
                              const updated = [...extraSubExercises];
                              const newItems = [...updated[eIdx].items];
                              newItems[iIdx] = e.target.value;
                              updated[eIdx].items = newItems;
                              setExtraSubExercises(updated);
                            }}
                            className="flex-1 text-xs font-serif text-right py-1 px-2 border border-slate-300 rounded bg-white"
                            placeholder="আইটেম বা বাক্য লিখুন..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...extraSubExercises];
                              updated[eIdx].items = updated[eIdx].items.filter((_, i) => i !== iIdx);
                              setExtraSubExercises(updated);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...extraSubExercises];
                            updated[eIdx].items = [...updated[eIdx].items, 'الفرع الجديد'];
                            setExtraSubExercises(updated);
                          }}
                          className="flex items-center gap-1 text-indigo-700 hover:text-indigo-800 text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ অপশন/আইটেম যোগ করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Extra Sub-Exercise Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextPart = ['هـ.', 'و.', 'ز.', 'ح.'][extraSubExercises.length] || `هـ${extraSubExercises.length + 1}.`;
                      setExtraSubExercises([
                        ...extraSubExercises,
                        {
                          id: String(Date.now()),
                          part: nextPart,
                          title: 'اكتب عنوان السؤال هنا :',
                          formula: '١×٤= ٤',
                          items: ['الفرع الأول', 'الفرع الثاني', 'الفرع الثالث', 'الفرع الرابع'],
                        },
                      ]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ অতিরিক্ত উপ-প্রশ্ন যোগ করুন (Add Extra Sub-Question)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            {isEditMode ? (
              <span className="text-emerald-800 font-semibold">
                আপডেট মোড — আগের নস-এর জায়গাতেই আপডেট হবে (ডুপ্লিকেট হবে না)।
              </span>
            ) : (
              <span>
                {includeQ1 ? '১ নং প্রশ্নোত্তর' : ''}{' '}
                {includeQ2 ? '+ ২ নং দলগত উপ-প্রশ্নাবলি' : ''} নতুন নস হিসেবে পেপারে যুক্ত হবে।
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              বাতিল
            </button>

            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('create')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 rounded-xl text-xs font-bold transition"
                  title="আগের নস অপরিবর্তিত রেখে এটি নতুন আরেকটি নস হিসেবে যোগ করুন"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>নতুন নস হিসেবে যোগ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('update')}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>আগেরটি আপডেট করুন (Update)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit('create')}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ক্যানভাসে যোগ করুন (Insert to Paper)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
