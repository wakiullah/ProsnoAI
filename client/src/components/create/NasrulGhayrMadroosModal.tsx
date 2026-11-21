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
  Sparkles,
  Layers,
  Settings2,
} from 'lucide-react';

export interface NasrulGhayrMadroosGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
  legacyQuestionIds?: string[];
  passageQuestionId?: string;
}

/**
 * Extracts all existing Nasrul Ghayr Madroos blocks on the canvas.
 */
export function extractNasrulGhayrMadroosGroups(
  questions: QuestionData[]
): NasrulGhayrMadroosGroup[] {
  const groups: NasrulGhayrMadroosGroup[] = [];
  const seenGroupIds = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('nasrul-ghayr-madroos') &&
      !seenGroupIds.has(q.groupId)
    ) {
      seenGroupIds.add(q.groupId);
      const groupQs = questions.filter((item) => item.groupId === q.groupId);
      const passageQ = groupQs.find(
        (item) => item.groupRole === 'ghayr_passage' || item.typology === 'PASSAGE_ONLY'
      );
      const snippet = (passageQ?.stemOrPassage || groupQs[0]?.stemOrPassage || '')
        .trim()
        .slice(0, 28);
      groups.push({
        groupId: q.groupId,
        label: `গায়রে মাদরুস ${groups.length + 1}${snippet ? `: ${snippet}…` : ''}`,
        questions: groupQs,
        passageQuestionId: passageQ?._id,
      });
    }
  });

  return groups;
}

const DEFAULT_SECTION_TITLE = '(ب) النص غير المدروس : الدرجات - ۲۰';
const DEFAULT_DIRECTION = 'اقرأ النص التالى ثم أجب عن الأسئلة الملحقة :';
const DEFAULT_PASSAGE =
  'كان ابو ذر الغفارى رضى الله عنه من اصحاب النبى صلى الله عليه وسلم. وابو ذر رضى الله تعالى عنه من السابقين الى الاسلام. وقد دخل فى الدين الاسلامى فى الايام الاولى. وحين اعلن ابو ذر (رضـ) اسلامه لم يكن النبى (صـ) قد اعلن الدعوة بعد. سأل ابو ذر النبى عليه السلام : يا نبى الله! بماذا تأمرنى؟ اجابه النبى صلى الله عليه وسلم : ارجع الى اهلك حتى تصل اليك دعوتى. فقال ابو ذر : لا ارجع حتى اصيح بالاسلام فى المسجد. دخل ابو ذر (رضـ) فى المسجد وهو يصيح اشهد ان لا اله الا الله واشهد ان محمدا رسول الله.';

const DEFAULT_Q3_QUESTIONS = [
  { id: '1', part: 'الف', text: 'من هو أبو ذر الغفارى رضى الله تعالى عنه؟' },
  { id: '2', part: 'ب', text: 'متى دخل أبو ذر رضى الله تعالى عنه فى الإسلام؟' },
  { id: '3', part: 'ج', text: 'بماذا أمر النبى صلى الله عليه وسلم أبا ذر رضى الله تعالى عنه؟' },
  { id: '4', part: 'د', text: 'أين دخل أبو ذر رضى الله تعالى عنه؟' },
];

const DEFAULT_REARRANGE_SENTENCES = [
  'إن - من - أصحاب النبى (صـ) - أبا ذر الغفارى (رضـ).',
  'ابو ذر الغفارى (رضـ) - بعد أبى بكر (رضـ) - دخل - فى الإسلام.',
  'رسول الله (صـ) - للرجوع - لأبى ذر (رضـ) - إلى أهله - نصح.',
  'أعلن - فى المسجد - بعد دخول الإسلام - إسلامه - أبو ذر (رضـ).',
];

interface NasrulGhayrMadroosModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroups: NasrulGhayrMadroosGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const NasrulGhayrMadroosModal: React.FC<NasrulGhayrMadroosModalProps> = ({
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

  // ── 0. SECTION BANNER ──
  const [includeSectionBanner, setIncludeSectionBanner] = useState(true);
  const [sectionBannerTitle, setSectionBannerTitle] = useState(DEFAULT_SECTION_TITLE);

  // ── PASSAGE STATE ──
  const [directionText, setDirectionText] = useState(DEFAULT_DIRECTION);
  const [passageText, setPassageText] = useState(DEFAULT_PASSAGE);

  // ── Q3 (COMPREHENSION - 8 MARKS) STATE ──
  const [includeQ3, setIncludeQ3] = useState(true);
  const [q3Number, setQ3Number] = useState('٣.');
  const [q3Title, setQ3Title] = useState('أجب عن الأسئلة الاتية :');
  const [q3MarksFormula, setQ3MarksFormula] = useState('٨ = ٤ × ٢');
  const [q3Questions, setQ3Questions] = useState(DEFAULT_Q3_QUESTIONS);

  // ── Q4 (GRAMMAR & EXTRACTION - 12 MARKS) STATE ──
  const [includeQ4, setIncludeQ4] = useState(true);
  const [q4Number, setQ4Number] = useState('٤.');
  const [q4Title, setQ4Title] = useState('أجب عن الأسئلة الاتية (ثلاثا فقط) :');
  const [q4MarksFormula, setQ4MarksFormula] = useState('١٢ = ٣ × ٤');

  // Item 1: Verb Conversion (ماضي <-> مضارع)
  const [itemVerbEnabled, setItemVerbEnabled] = useState(true);
  const [itemVerbMode, setItemVerbMode] = useState<'past_to_present' | 'present_to_past'>('past_to_present');
  const [itemVerbCustomText, setItemVerbCustomText] = useState('');

  // Item 2: Antonyms / Opposite Words (الكلمات المتضادة)
  const [itemAntonymEnabled, setItemAntonymEnabled] = useState(true);
  const [itemAntonymWords, setItemAntonymWords] = useState('اب ، دخل ، اعلن ، رضى');
  const [itemAntonymCustomTitle, setItemAntonymCustomTitle] = useState('');

  // Item 3: Synonyms (الكلمات المرادفة)
  const [itemSynonymEnabled, setItemSynonymEnabled] = useState(false);
  const [itemSynonymWords, setItemSynonymWords] = useState('عالم ، اصحاب ، اهلك ، المسجد');
  const [itemSynonymCustomTitle, setItemSynonymCustomTitle] = useState('');

  // Item 4: Tahqeeq & Sigha Analysis
  const [itemTahqeeqEnabled, setItemTahqeeqEnabled] = useState(true);
  const [itemTahqeeqMode, setItemTahqeeqMode] = useState<'tahqeeq_only' | 'sigha_only' | 'tahqeeq_and_sigha'>('tahqeeq_only');
  const [itemTahqeeqWords, setItemTahqeeqWords] = useState('سأل ، أرجع ، اجاب ، لم يكن');
  const [itemTahqeeqCustomTitle, setItemTahqeeqCustomTitle] = useState('');

  // Item 5: Rearrange / Sentence Formation (التركيب وترتيب الجمل)
  const [itemStructureEnabled, setItemStructureEnabled] = useState(true);
  const [itemStructureMode, setItemStructureMode] = useState<'rearrange' | 'make_sentence' | 'tarkib'>('rearrange');
  const [itemRearrangeSentences, setItemRearrangeSentences] = useState(DEFAULT_REARRANGE_SENTENCES);
  const [itemMakeSentenceWords, setItemMakeSentenceWords] = useState('مدينة ، النبى ، انصار ، قديمة');
  const [itemStructureCustomTitle, setItemStructureCustomTitle] = useState('');

  // Item 6: Singular & Plural (المفرد والجمع)
  const [itemNumberEnabled, setItemNumberEnabled] = useState(true);
  const [itemNumberMode, setItemNumberMode] = useState<'extract_from_text' | 'singular_to_plural' | 'plural_to_singular'>('extract_from_text');
  const [itemNumberWords, setItemNumberWords] = useState('المدينة ، المملكة ، الخليفة ، الرسول');
  const [itemNumberCustomTitle, setItemNumberCustomTitle] = useState('');

  // Item 7: Direct Grammar Extraction from Text (নস থেকে সরাসরি বের করা)
  const [itemExtractionEnabled, setItemExtractionEnabled] = useState(false);
  const [itemExtractionType, setItemExtractionType] = useState<'isjamid' | 'masdar' | 'ismushtaq'>('isjamid');
  const [itemExtractionCustomTitle, setItemExtractionCustomTitle] = useState('');

  // Sync state whenever activeGroup changes
  useEffect(() => {
    if (!activeGroup) {
      // Fresh new group defaults
      setIncludeSectionBanner(true);
      setSectionBannerTitle(DEFAULT_SECTION_TITLE);
      setDirectionText(DEFAULT_DIRECTION);
      setPassageText(DEFAULT_PASSAGE);

      setIncludeQ3(true);
      setQ3Number('٣.');
      setQ3Title('أجب عن الأسئلة الاتية :');
      setQ3MarksFormula('٨ = ٤ × ٢');
      setQ3Questions(DEFAULT_Q3_QUESTIONS);

      setIncludeQ4(true);
      setQ4Number('٤.');
      setQ4Title('أجب عن الأسئلة الاتية (ثلاثا فقط) :');
      setQ4MarksFormula('١٢ = ٣ × ٤');

      setItemVerbEnabled(true);
      setItemVerbMode('past_to_present');
      setItemAntonymEnabled(true);
      setItemSynonymEnabled(false);
      setItemTahqeeqEnabled(true);
      setItemTahqeeqMode('tahqeeq_only');
      setItemStructureEnabled(true);
      setItemStructureMode('rearrange');
      setItemNumberEnabled(true);
      setItemNumberMode('extract_from_text');
      setItemExtractionEnabled(false);
      return;
    }

    const qs = activeGroup.questions;

    // 0. Banner
    const bannerQ = qs.find((q) => q.groupRole === 'ghayr_section_banner' || q.typology === 'SECTION_TITLE');
    if (bannerQ) {
      setIncludeSectionBanner(true);
      setSectionBannerTitle(bannerQ.stemOrPassage || DEFAULT_SECTION_TITLE);
    } else {
      setIncludeSectionBanner(false);
    }

    // 1. Passage
    const passageQ = qs.find((q) => q.groupRole === 'ghayr_passage' || q.typology === 'PASSAGE_ONLY');
    setDirectionText(passageQ?.topic || DEFAULT_DIRECTION);
    setPassageText(passageQ?.stemOrPassage || '');

    // 2. Q3 Comprehension
    const q3Item = qs.find((q) => q.groupRole === 'ghayr_q3' || (q.customNumber && q.customNumber.includes('٣')));
    if (q3Item) {
      setIncludeQ3(true);
      setQ3Number(q3Item.customNumber || '٣.');
      setQ3Title(q3Item.stemOrPassage || 'أجب عن الأسئلة الاتية :');
      setQ3MarksFormula(q3Item.customMarksText || '٨ = ٤ × ٢');
      setQ3Questions(
        (q3Item.subQuestions || []).length > 0
          ? (q3Item.subQuestions || []).map((sq, idx) => ({
              id: String(idx + 1),
              part: String(sq.part || ['الف', 'ب', 'ج', 'د'][idx] || idx + 1),
              text: sq.questionText || '',
            }))
          : DEFAULT_Q3_QUESTIONS
      );
    }

    // 3. Q4 Parent
    const q4Item = qs.find((q) => q.groupRole === 'ghayr_q4_title' || (q.customNumber && q.customNumber.includes('٤')));
    if (q4Item) {
      setIncludeQ4(true);
      setQ4Number(q4Item.customNumber || '٤.');
      setQ4Title(q4Item.stemOrPassage || 'أجب عن الأسئلة الاتية (ثلاثا فقط) :');
      setQ4MarksFormula(q4Item.customMarksText || '١٢ = ٣ × ٤');
    }
  }, [activeGroup]);

  if (!isOpen) return null;

  // Build ordered list of active Q4 sub-items
  const subLetters = ['(الف)', '(ب)', '(ج)', '(د)', '(هـ)', '(و)', '(ز)'];

  const buildQuestionsPayload = (targetGroupId: string): QuestionData[] => {
    const questionsToInsert: QuestionData[] = [];

    // 0. Section Banner
    if (includeSectionBanner && sectionBannerTitle.trim()) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'ghayr_section_banner',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'SECTION_TITLE',
        stemOrPassage: sectionBannerTitle.trim(),
        marks: 0,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 1. Unseen Passage
    if (passageText.trim()) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'ghayr_passage',
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

    // 2. Q3 Comprehension Questions (4 questions, 8 marks)
    if (includeQ3 && q3Questions.length > 0) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'ghayr_q3',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'PASSAGE_QA',
        customNumber: q3Number.trim() || '٣.',
        stemOrPassage: q3Title.trim() || 'أجب عن الأسئلة الاتية :',
        customMarksText: q3MarksFormula.trim() || '٨ = ٤ × ٢',
        subQuestions: q3Questions.map((q) => ({
          part: q.part as any,
          bloomLevel: 'comprehension',
          bloomTitle: '',
          questionText: q.text.trim(),
          marks: 2,
        })),
        marks: 8,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });
    }

    // 3. Q4 Parent & Sub-Items (Choice: 3 out of items, 12 marks)
    if (includeQ4) {
      questionsToInsert.push({
        groupId: targetGroupId,
        groupRole: 'ghayr_q4_title',
        subject: 'اللغة العربية الإتصالية',
        grade: 'الصف العاشر من الداخل',
        typology: 'GROUP_TITLE',
        customNumber: q4Number.trim() || '٤.',
        stemOrPassage: q4Title.trim() || 'أجب عن الأسئلة الاتية (ثلاثا فقط) :',
        customMarksText: q4MarksFormula.trim() || '١٢ = ٣ × ٤',
        marks: 12,
        difficulty: 'Medium',
        languages: ['ar'],
        sourceType: 'MANUAL',
      });

      let letterIdx = 0;

      // 4.1 Verb conversion
      if (itemVerbEnabled) {
        const defaultText =
          itemVerbMode === 'past_to_present'
            ? 'استخرج اربعا من الأفعال الماضية من النص ثم حولها إلى المضارع.'
            : 'استخرج اربعا من الأفعال المضارعة من النص ثم حولها إلى الماضي.';
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_verb',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: itemVerbCustomText.trim() || defaultText,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // 4.2 Antonyms
      if (itemAntonymEnabled) {
        const words = itemAntonymWords.trim();
        const fullStem = `${itemAntonymCustomTitle.trim() || 'هات الألفاظ المتضادة للكلمات الاتية :'} ${words ? `(${words})` : ''}`;
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_antonym',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: fullStem,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // 4.3 Synonyms
      if (itemSynonymEnabled) {
        const words = itemSynonymWords.trim();
        const fullStem = `${itemSynonymCustomTitle.trim() || 'هات الألفاظ المرادفة للكلمات الاتية :'} ${words ? `(${words})` : ''}`;
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_synonym',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: fullStem,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // 4.4 Tahqeeq & Sigha
      if (itemTahqeeqEnabled) {
        const defaultTitle =
          itemTahqeeqMode === 'tahqeeq_only'
            ? 'حقق الألفاظ التالية (اثنين فقط) :'
            : itemTahqeeqMode === 'sigha_only'
            ? 'اذكر صيغ الأفعال التالية مع بيان الأصل (اثنين فقط) :'
            : 'حقق واذكر الصيغة للألفاظ التالية (اثنين فقط) :';
        const words = itemTahqeeqWords.trim();
        const fullStem = `${itemTahqeeqCustomTitle.trim() || defaultTitle} ${words ? `(${words})` : ''}`;
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_tahqeeq',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: fullStem,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // 4.5 Rearrange / Sentence formation
      if (itemStructureEnabled) {
        if (itemStructureMode === 'rearrange') {
          questionsToInsert.push({
            groupId: targetGroupId,
            groupRole: 'ghayr_structure',
            subject: 'اللغة العربية الإتصالية',
            grade: 'الصف العاشر من الداخل',
            typology: 'DESCRIPTIVE',
            customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
            customMarksText: '',
            stemOrPassage: itemStructureCustomTitle.trim() || 'رتب الكلمات الآتية لتكون جملا مفيدة :',
            subQuestions: itemRearrangeSentences.map((sent, idx) => ({
              part: (['الف', 'ب', 'ج', 'د', 'هـ'][idx] || String(idx + 1)) as any,
              bloomLevel: 'application',
              bloomTitle: '',
              questionText: sent.trim(),
              marks: 1,
            })),
            marks: 4,
            difficulty: 'Medium',
            languages: ['ar'],
            sourceType: 'MANUAL',
          });
        } else if (itemStructureMode === 'make_sentence') {
          const words = itemMakeSentenceWords.trim();
          questionsToInsert.push({
            groupId: targetGroupId,
            groupRole: 'ghayr_structure',
            subject: 'اللغة العربية الإتصالية',
            grade: 'الصف العاشر من الداخل',
            typology: 'DESCRIPTIVE',
            customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
            customMarksText: '',
            stemOrPassage: `${itemStructureCustomTitle.trim() || 'كون جملا مفيدة من الكلمات التالية :'} ${words ? `(${words})` : ''}`,
            marks: 4,
            difficulty: 'Medium',
            languages: ['ar'],
            sourceType: 'MANUAL',
          });
        } else {
          questionsToInsert.push({
            groupId: targetGroupId,
            groupRole: 'ghayr_structure',
            subject: 'اللغة العربية الإتصالية',
            grade: 'الصف العاشر من الداخل',
            typology: 'DESCRIPTIVE',
            customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
            customMarksText: '',
            stemOrPassage: itemStructureCustomTitle.trim() || 'أعرب ما تحته خط من الجمل الآتية :',
            marks: 4,
            difficulty: 'Medium',
            languages: ['ar'],
            sourceType: 'MANUAL',
          });
        }
      }

      // 4.6 Singular & Plural
      if (itemNumberEnabled) {
        let defaultTitle = 'استخرج الأسماء من النص ثم حولها إلى المفرد او الجمع (اربعا فقط).';
        let words = '';
        if (itemNumberMode === 'singular_to_plural') {
          defaultTitle = 'اكتب جمعا للكلمات الاتية :';
          words = itemNumberWords.trim();
        } else if (itemNumberMode === 'plural_to_singular') {
          defaultTitle = 'اكتب مفردا للكلمات الاتية :';
          words = itemNumberWords.trim();
        }
        const fullStem = `${itemNumberCustomTitle.trim() || defaultTitle} ${words ? `(${words})` : ''}`;
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_number',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: fullStem,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }

      // 4.7 Direct Grammar Extraction (No sub-options, purely standalone exam questions)
      if (itemExtractionEnabled) {
        const text =
          itemExtractionType === 'isjamid'
            ? 'استخرج أربعة من أسماء الجوامد من النص.'
            : itemExtractionType === 'masdar'
            ? 'استخرج أربعة مصادر من النص.'
            : 'استخرج أربعة من الأسماء المشتقة من النص.';
        questionsToInsert.push({
          groupId: targetGroupId,
          groupRole: 'ghayr_extraction',
          subject: 'اللغة العربية الإتصالية',
          grade: 'الصف العاشر من الداخل',
          typology: 'DESCRIPTIVE',
          customNumber: subLetters[letterIdx++] || `(${letterIdx}).`,
          customMarksText: '',
          stemOrPassage: itemExtractionCustomTitle.trim() || text,
          marks: 4,
          difficulty: 'Medium',
          languages: ['ar'],
          sourceType: 'MANUAL',
        });
      }
    }

    return questionsToInsert;
  };

  const handleApply = (modeOverride?: 'update' | 'create') => {
    const mode = modeOverride || (isEditMode ? 'update' : 'create');
    const targetGroupId =
      mode === 'update' && activeGroup
        ? activeGroup.groupId
        : `nasrul-ghayr-madroos-${Date.now()}`;

    const payload = buildQuestionsPayload(targetGroupId);
    onSave(payload, mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* ── HEADER ── */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700/80 border border-teal-500/50 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  নসসে গায়রে মাদরুস তৈরি ও পরিচালনা
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-serif">
                  (ب) النص غير المدروس : ۲۰ درجات
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 font-serif">
                إعداد النص غير المدروس وأسئلة الفهم وقواعد اللغة العربية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── GROUP SWITCHER / SELECTOR ── */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              বিদ্যমান গায়রে মাদরুস ({allGroups.length}টি):
            </span>

            {allGroups.length === 0 ? (
              <span className="text-slate-500 italic text-[11px]">
                এখনও কোনো গায়রে মাদরুস যোগ করা হয়নি
              </span>
            ) : (
              allGroups.map((g, idx) => {
                const isSelected = activeGroupId === g.groupId;
                return (
                  <button
                    key={g.groupId}
                    type="button"
                    onClick={() => onSelectGroupId(g.groupId)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    <Pencil className="w-3 h-3" />
                    <span>{g.label || `গায়রে মাদরুস ${idx + 1}`}</span>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectGroupId(null);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 ${
              !activeGroupId
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ নতুন গায়রে মাদরুস তৈরি</span>
          </button>
        </div>

        {/* ── BODY (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 text-xs">
          {/* SECTION 0: SECTION BANNER */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSectionBanner}
                  onChange={(e) => setIncludeSectionBanner(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">বিভাগীয় হেডার ব্যানার (Section Banner)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">নম্বর ছাড়া বড় শিরোনাম</span>
            </div>

            {includeSectionBanner && (
              <input
                type="text"
                dir="rtl"
                value={sectionBannerTitle}
                onChange={(e) => setSectionBannerTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-serif text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-right"
                placeholder="(ب) النص غير المدروس : الدرجات - ۲۰"
              />
            )}
          </div>

          {/* SECTION 1: PASSAGE */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span>১. আনসিন নস / প্যারাগ্রাফ (النص غير المدروس)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-serif">فقرة القراءة الملحقة</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                প্যাসেজের নির্দেশনা (Direction Text):
              </label>
              <input
                type="text"
                dir="rtl"
                value={directionText}
                onChange={(e) => setDirectionText(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নসের মূল টেক্সট (Unseen Passage Content):
              </label>
              <textarea
                dir="rtl"
                rows={4}
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-serif text-sm leading-relaxed text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-right"
              />
            </div>
          </div>

          {/* SECTION 2: Q3 (COMPREHENSION QUESTIONS - 8 MARKS) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ3}
                  onChange={(e) => setIncludeQ3(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>২. ৩ নং প্রশ্ন — নস থেকে সরাসরি ৪টি প্রশ্ন (৮ নম্বর)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-serif">
                {q3MarksFormula}
              </span>
            </div>

            {includeQ3 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      প্রশ্ন নম্বর:
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q3Number}
                      onChange={(e) => setQ3Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      প্রশ্নের নির্দেশনা (Stem):
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q3Title}
                      onChange={(e) => setQ3Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">
                    ৪টি বাধ্যতামূলক প্রশ্ন (الف، ب، ج، د):
                  </span>
                  {q3Questions.map((q, idx) => (
                    <div key={q.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q.part}
                        onChange={(e) => {
                          const updated = [...q3Questions];
                          updated[idx].part = e.target.value;
                          setQ3Questions(updated);
                        }}
                        className="w-14 text-center px-1 py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-serif font-bold text-slate-800"
                        title="সাব-প্রশ্ন বর্ণ"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...q3Questions];
                          updated[idx].text = e.target.value;
                          setQ3Questions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:bg-white outline-none text-right"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQ3Questions(q3Questions.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const letters = ['الف', 'ب', 'ج', 'د', 'هـ', 'و'];
                      setQ3Questions([
                        ...q3Questions,
                        {
                          id: String(Date.now()),
                          part: letters[q3Questions.length] || String(q3Questions.length + 1),
                          text: '',
                        },
                      ]);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ প্রশ্ন যোগ করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Q4 (GRAMMAR & EXTRACTION - 12 MARKS) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQ4}
                  onChange={(e) => setIncludeQ4(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>৩. ৪ নং প্রশ্ন — ব্যাকরণ ও রূপান্তর (১২ নম্বর: ৫টির মধ্যে যেকোনো ৩টির উত্তর)</span>
              </label>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-serif">
                {q4MarksFormula}
              </span>
            </div>

            {includeQ4 && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      প্রশ্ন নম্বর:
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q4Number}
                      onChange={(e) => setQ4Number(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      প্রধান নির্দেশনা (Stem):
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={q4Title}
                      onChange={(e) => setQ4Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:bg-white outline-none text-right"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>৪ নং প্রশ্নের সাব-আইটেমসমূহ নির্বাচন ও পরিচালনা:</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      (প্রয়োজনমতো চালু/বন্ধ করুন ও অপশন বেছে নিন)
                    </span>
                  </div>

                  {/* ITEM 1: VERB CONVERSION */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemVerbEnabled}
                          onChange={(e) => setItemVerbEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>১. ফে'ল (ক্রিয়াপদ) রূপান্তর (الأفعال)</span>
                      </label>
                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setItemVerbMode('past_to_present')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemVerbMode === 'past_to_present'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          অতীত ➔ বর্তমান (ماضي ➔ مضارع)
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemVerbMode('present_to_past')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemVerbMode === 'present_to_past'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          বর্তমান ➔ অতীত (مضارع ➔ ماضي)
                        </button>
                      </div>
                    </div>

                    {itemVerbEnabled && (
                      <input
                        type="text"
                        dir="rtl"
                        value={
                          itemVerbCustomText ||
                          (itemVerbMode === 'past_to_present'
                            ? 'استخرج اربعا من الأفعال الماضية من النص ثم حولها إلى المضارع.'
                            : 'استخرج اربعا من الأفعال المضارعة من النص ثم حولها إلى الماضي.')
                        }
                        onChange={(e) => setItemVerbCustomText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                      />
                    )}
                  </div>

                  {/* ITEM 2: ANTONYMS */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemAntonymEnabled}
                          onChange={(e) => setItemAntonymEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>২. বিপরীত শব্দ (الكلمات المتضادة / الأضداد)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-serif">الأضداد</span>
                    </div>

                    {itemAntonymEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="هات الألفاظ المتضادة للكلمات الاتية :"
                          value={itemAntonymCustomTitle || 'هات الألفاظ المتضادة للكلمات الاتية :'}
                          onChange={(e) => setItemAntonymCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="শব্দসমূহ: اب ، دخل ، اعلن ، رضى"
                          value={itemAntonymWords}
                          onChange={(e) => setItemAntonymWords(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* ITEM 3: SYNONYMS */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemSynonymEnabled}
                          onChange={(e) => setItemSynonymEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>৩. সমার্থক শব্দ (الكلمات المرادفة / المترادفات)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-serif">المترادفات</span>
                    </div>

                    {itemSynonymEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="هات الألفاظ المرادفة للكلمات الاتية :"
                          value={itemSynonymCustomTitle || 'هات الألفاظ المرادفة للكلمات الاتية :'}
                          onChange={(e) => setItemSynonymCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="শব্দসমূহ: عالم ، اصحاب ، اهلك ، المسجد"
                          value={itemSynonymWords}
                          onChange={(e) => setItemSynonymWords(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* ITEM 4: TAHQEEQ & SIGHA */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemTahqeeqEnabled}
                          onChange={(e) => setItemTahqeeqEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>৪. তাহকীক ও সীগাহ বিশ্লেষণ (التحقيق والصيغة)</span>
                      </label>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setItemTahqeeqMode('tahqeeq_only')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemTahqeeqMode === 'tahqeeq_only'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          শুধু তাহকীক
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemTahqeeqMode('sigha_only')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemTahqeeqMode === 'sigha_only'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          শুধু সীগাহ
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemTahqeeqMode('tahqeeq_and_sigha')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemTahqeeqMode === 'tahqeeq_and_sigha'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          তাহকীক + সীগাহ
                        </button>
                      </div>
                    </div>

                    {itemTahqeeqEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="rtl"
                          value={
                            itemTahqeeqCustomTitle ||
                            (itemTahqeeqMode === 'tahqeeq_only'
                              ? 'حقق الألفاظ التالية (اثنين فقط) :'
                              : itemTahqeeqMode === 'sigha_only'
                              ? 'اذكر صيغ الأفعال التالية مع بيان الأصل (اثنين فقط) :'
                              : 'حقق واذكر الصيغة للألفاظ التالية (اثنين فقط) :')
                          }
                          onChange={(e) => setItemTahqeeqCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="শব্দসমূহ: سأل ، أرجع ، اجاب ، لم يكن"
                          value={itemTahqeeqWords}
                          onChange={(e) => setItemTahqeeqWords(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* ITEM 5: REARRANGE / SENTENCE FORMATION */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemStructureEnabled}
                          onChange={(e) => setItemStructureEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>৫. তারকীব ও বাক্য গঠন (التركيب وترتيب الجمل)</span>
                      </label>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setItemStructureMode('rearrange')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemStructureMode === 'rearrange'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          এলোমেলো বাক্য সাজানো (رتب)
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemStructureMode('make_sentence')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemStructureMode === 'make_sentence'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          বাক্য তৈরি (كون جملا)
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemStructureMode('tarkib')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemStructureMode === 'tarkib'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          তারকীব / এরআব (الإعراب)
                        </button>
                      </div>
                    </div>

                    {itemStructureEnabled && itemStructureMode === 'rearrange' && (
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="text"
                          dir="rtl"
                          value={itemStructureCustomTitle || 'رتب الكلمات الآتية لتكون جملا مفيدة :'}
                          onChange={(e) => setItemStructureCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        {itemRearrangeSentences.map((sent, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-slate-500 font-mono">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              dir="rtl"
                              value={sent}
                              onChange={(e) => {
                                const updated = [...itemRearrangeSentences];
                                updated[idx] = e.target.value;
                                setItemRearrangeSentences(updated);
                              }}
                              className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {itemStructureEnabled && itemStructureMode === 'make_sentence' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          dir="rtl"
                          value={itemStructureCustomTitle || 'كون جملا مفيدة من الكلمات التالية :'}
                          onChange={(e) => setItemStructureCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="শব্দসমূহ: مدينة ، النبى ، انصار ، قديمة"
                          value={itemMakeSentenceWords}
                          onChange={(e) => setItemMakeSentenceWords(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                      </div>
                    )}

                    {itemStructureEnabled && itemStructureMode === 'tarkib' && (
                      <input
                        type="text"
                        dir="rtl"
                        value={itemStructureCustomTitle || 'أعرب ما تحته خط من الجمل الآتية :'}
                        onChange={(e) => setItemStructureCustomTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                      />
                    )}
                  </div>

                  {/* ITEM 6: SINGULAR & PLURAL */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemNumberEnabled}
                          onChange={(e) => setItemNumberEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>৬. একবচন ও বহুবচন রূপান্তর (المفرد والجمع)</span>
                      </label>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setItemNumberMode('extract_from_text')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemNumberMode === 'extract_from_text'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          নস থেকে বের করে
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemNumberMode('singular_to_plural')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemNumberMode === 'singular_to_plural'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          একবচন ➔ বহুবচন
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemNumberMode('plural_to_singular')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemNumberMode === 'plural_to_singular'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          বহুবচন ➔ একবচন
                        </button>
                      </div>
                    </div>

                    {itemNumberEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="rtl"
                          value={
                            itemNumberCustomTitle ||
                            (itemNumberMode === 'extract_from_text'
                              ? 'استخرج الأسماء من النص ثم حولها إلى المفرد او الجمع (اربعا فقط).'
                              : itemNumberMode === 'singular_to_plural'
                              ? 'اكتب جمعا للكلمات الاتية :'
                              : 'اكتب مفردا للكلمات الاتية :')
                          }
                          onChange={(e) => setItemNumberCustomTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                        />
                        {itemNumberMode !== 'extract_from_text' && (
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="শব্দসমূহ: المدينة ، المملكة ، الخليفة ، الرسول"
                            value={itemNumberWords}
                            onChange={(e) => setItemNumberWords(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* ITEM 7: DIRECT GRAMMAR EXTRACTION (NO OPTIONS, STRAIGHT QUESTION) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemExtractionEnabled}
                          onChange={(e) => setItemExtractionEnabled(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>৭. নস থেকে সরাসরি ব্যাকরণিক নিষ্কাশন (Extraction - সরাসরি প্রশ্ন)</span>
                      </label>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setItemExtractionType('isjamid')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemExtractionType === 'isjamid'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ইসমে জামিদ (اسم جامد)
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemExtractionType('masdar')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemExtractionType === 'masdar'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          মাসদার (مصدر)
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemExtractionType('ismushtaq')}
                          className={`px-2 py-0.5 rounded transition ${
                            itemExtractionType === 'ismushtaq'
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ইসমে মুশতাক (اسم مشتق)
                        </button>
                      </div>
                    </div>

                    {itemExtractionEnabled && (
                      <input
                        type="text"
                        dir="rtl"
                        value={
                          itemExtractionCustomTitle ||
                          (itemExtractionType === 'isjamid'
                            ? 'استخرج أربعة من أسماء الجوامد من النص.'
                            : itemExtractionType === 'masdar'
                            ? 'استخرج أربعة مصادر من النص.'
                            : 'استخرج أربعة من الأسماء المشتقة من النص.')
                        }
                        onChange={(e) => setItemExtractionCustomTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-serif text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none text-right"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
            >
              বাতিল
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => handleApply('create')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন আলাদা নস হিসেবে যুক্ত করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply('update')}
                  className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>বিদ্যমান নসে আপডেট করুন</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleApply('create')}
                className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>প্রশ্নপত্রে নসসে গায়রে মাদরুস যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
