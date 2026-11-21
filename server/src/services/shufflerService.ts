import { ExamSet, ExamSetEntry, McqOption, QuestionData } from 'proshno-shared';

/**
 * Fisher-Yates array shuffle utility
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Option labels for standard Bangladeshi MCQs
 */
const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['a', 'b', 'c', 'd'];

/**
 * Shuffles options for an MCQ and updates labels while preserving correct answer.
 */
function shuffleMcqOptions(options: McqOption[]): {
  shuffledOptions: McqOption[];
  optionOrder: number[];
  correctLabel: string;
} {
  const isEnglish = options.some((o) => /^[a-d]$/i.test(o.label));
  const labelSet = isEnglish ? EN_LABELS : BN_LABELS;

  const indexed = options.map((opt, idx) => ({ opt, originalIndex: idx }));
  const shuffledIndexed = shuffleArray(indexed);

  const optionOrder = shuffledIndexed.map((item) => item.originalIndex);
  let correctLabel = '';

  const shuffledOptions: McqOption[] = shuffledIndexed.map((item, newIdx) => {
    const label = labelSet[newIdx] || `${newIdx + 1}`;
    if (item.opt.isCorrect) {
      correctLabel = label;
    }
    return {
      label,
      text: item.opt.text,
      isCorrect: item.opt.isCorrect,
    };
  });

  return { shuffledOptions, optionOrder, correctLabel };
}

/**
 * Generates randomized Sets (Set A, Set B, Set C, Set D) from a list of questions.
 *
 * Rules:
 * - Standalone questions (MCQs, Descriptive, Fill in blanks, Matching) are shuffled.
 * - For MCQs: options (ক, খ, গ, ঘ) are shuffled per set and answerKeyMap is accurately computed.
 * - For PASSAGE_GROUP: child questions remain permanently bound to their parent passage.
 * - For CQ: Bloom's sub-questions (ক জ্ঞানমূলক -> ঘ উচ্চতর দক্ষতা) preserve their 1->2->3->4 hierarchy.
 */
/**
 * Shuffles questions while strictly preserving section groupings.
 * Questions within Section A stay in Section A, Section B in Section B.
 */
function shuffleQuestionsPreservingSections(questions: QuestionData[]): QuestionData[] {
  const hasSections = questions.some((q) => Boolean(q.sectionId));
  if (!hasSections) {
    return shuffleArray(questions);
  }

  const sectionBuckets = new Map<string | undefined, QuestionData[]>();
  for (const q of questions) {
    const sId = q.sectionId;
    if (!sectionBuckets.has(sId)) {
      sectionBuckets.set(sId, []);
    }
    sectionBuckets.get(sId)!.push(q);
  }

  const result: QuestionData[] = [];
  for (const bucketQuestions of sectionBuckets.values()) {
    result.push(...shuffleArray(bucketQuestions));
  }
  return result;
}

export function generateExamSets(
  questions: QuestionData[],
  setNames: string[] = ['Set A', 'Set B', 'Set C', 'Set D']
): ExamSet[] {
  return setNames.map((setName, setIndex) => {
    // For Set A, preserve original order; for subsequent sets, shuffle preserving section groupings
    const orderedQuestions =
      setIndex === 0 ? [...questions] : shuffleQuestionsPreservingSections([...questions]);

    const questionEntries: ExamSetEntry[] = [];
    const answerKeyMap: Record<number, string> = {};

    let currentQuestionNumber = 1;

    for (let qIdx = 0; qIdx < orderedQuestions.length; qIdx++) {
      const q = orderedQuestions[qIdx];
      const qId = q._id?.toString() || `q-${qIdx}`;

      if (q.typology === 'SIMPLE_MCQ' || q.typology === 'MULTIPLE_COMPLETION_MCQ') {
        if (q.options && q.options.length > 0) {
          // Shuffle options for sets other than Set A (or shuffle Set A if desired)
          const { shuffledOptions, optionOrder, correctLabel } =
            setIndex === 0
              ? {
                  shuffledOptions: q.options,
                  optionOrder: q.options.map((_, i) => i),
                  correctLabel:
                    q.options.find((o) => o.isCorrect)?.label ||
                    (typeof q.correctAnswer === 'string' ? q.correctAnswer : 'ক'),
                }
              : shuffleMcqOptions(q.options);

          questionEntries.push({
            questionId: qId,
            order: currentQuestionNumber,
            optionOrder,
            customQuestionData: {
              ...q,
              options: shuffledOptions,
            },
          });

          if (correctLabel) {
            answerKeyMap[currentQuestionNumber] = correctLabel;
          }
          currentQuestionNumber++;
        } else {
          questionEntries.push({
            questionId: qId,
            order: currentQuestionNumber,
            customQuestionData: q,
          });
          currentQuestionNumber++;
        }
      } else if (q.typology === 'PASSAGE_GROUP' && q.passageQuestions) {
        // Stimulus and child questions stay bound together
        const passageQuestionsShuffled = q.passageQuestions.map((pq, pqIdx) => {
          let pqOptions = pq.options;
          let pqCorrectLabel = pq.correctAnswer || '';

          if (pq.options && pq.options.length > 0 && setIndex > 0) {
            const shuffled = shuffleMcqOptions(pq.options);
            pqOptions = shuffled.shuffledOptions;
            pqCorrectLabel = shuffled.correctLabel || pqCorrectLabel;
          }

          const qNum = currentQuestionNumber + pqIdx;
          if (pqCorrectLabel) {
            answerKeyMap[qNum] = pqCorrectLabel;
          }

          return {
            ...pq,
            order: qNum,
            options: pqOptions,
          };
        });

        questionEntries.push({
          questionId: qId,
          order: currentQuestionNumber,
          customQuestionData: {
            ...q,
            passageQuestions: passageQuestionsShuffled,
          },
        });

        currentQuestionNumber += q.passageQuestions.length;
      } else {
        // CQ, MATCHING, FILL_BLANKS, DESCRIPTIVE
        questionEntries.push({
          questionId: qId,
          order: currentQuestionNumber,
          customQuestionData: q,
        });

        if (q.correctAnswer) {
          if (Array.isArray(q.correctAnswer)) {
            answerKeyMap[currentQuestionNumber] = q.correctAnswer.join(', ');
          } else {
            answerKeyMap[currentQuestionNumber] = String(q.correctAnswer);
          }
        }

        currentQuestionNumber++;
      }
    }

    return {
      setName,
      questionEntries,
      answerKeyMap,
    };
  });
}
