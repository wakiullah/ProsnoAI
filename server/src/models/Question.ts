import mongoose, { Document, Schema } from 'mongoose';
import {
  CqSubQuestion,
  EducationStream,
  HarakatMode,
  MatchingColumns,
  McqOption,
  PassageLinkedQuestion,
  QuestionDifficulty,
  QuestionSourceType,
  QuestionTypology,
  SupportedLanguage,
  TahqeeqWordEntry,
  WritingBoxConfig,
} from 'proshno-shared';

export interface IQuestion extends Document {
  userId?: mongoose.Types.ObjectId;
  subject: string;
  grade: string;
  chapter?: string;
  topic?: string;
  typology: QuestionTypology;
  educationStream?: EducationStream;
  harakatMode?: HarakatMode;
  stemOrPassage?: string;
  statements?: string[];
  options?: McqOption[];
  subQuestions?: CqSubQuestion[];
  passageQuestions?: PassageLinkedQuestion[];
  matchingColumns?: MatchingColumns;
  tahqeeqWords?: TahqeeqWordEntry[];
  answerSpaceLines?: number;
  writingBoxes?: WritingBoxConfig;
  hasClues?: boolean;
  wordClues?: string[];
  correctAnswer?: any;
  explanation?: string;
  marks: number;
  difficulty: QuestionDifficulty;
  languages: SupportedLanguage[];
  sourceType: QuestionSourceType;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const McqOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const CqSubQuestionSchema = new Schema(
  {
    part: { type: String, required: true }, // ক, খ, গ, ঘ
    bloomLevel: {
      type: String,
      enum: ['knowledge', 'comprehension', 'application', 'higher_order'],
      required: true,
    },
    bloomTitle: { type: String, required: true }, // জ্ঞানমূলক, অনুধাবনমূলক, প্রয়োগমূলক, উচ্চতর দক্ষতা
    questionText: { type: String, required: true },
    marks: { type: Number, required: true, default: 1 },
    sampleAnswer: { type: String, default: '' },
  },
  { _id: false }
);

const PassageLinkedQuestionSchema = new Schema(
  {
    order: { type: Number, required: true },
    questionText: { type: String, required: true },
    typology: {
      type: String,
      enum: ['SIMPLE_MCQ', 'MULTIPLE_COMPLETION_MCQ', 'DESCRIPTIVE'],
      default: 'SIMPLE_MCQ',
    },
    statements: [{ type: String }],
    options: [McqOptionSchema],
    correctAnswer: { type: String },
    explanation: { type: String },
    marks: { type: Number, default: 1 },
  },
  { _id: false }
);

const MatchingColumnsSchema = new Schema(
  {
    colA: [{ type: String, required: true }],
    colB: [{ type: String, required: true }],
    colC: [{ type: String }],
    correctPairs: [
      {
        a: { type: Number, required: true },
        b: { type: Number, required: true },
        c: { type: Number },
        fullSentence: { type: String },
      },
    ],
  },
  { _id: false }
);

const TahqeeqWordEntrySchema = new Schema(
  {
    lafz: { type: String, required: true },
    sigha: { type: String, default: '' },
    bahas: { type: String, default: '' },
    baab: { type: String, default: '' },
    maddah: { type: String, default: '' },
    meaning: { type: String, default: '' },
  },
  { _id: false }
);

export const QuestionSchema = new Schema<IQuestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    subject: { type: String, required: true, trim: true, index: true },
    grade: { type: String, required: true, trim: true, index: true },
    chapter: { type: String, trim: true, index: true },
    topic: { type: String, trim: true },
    typology: {
      type: String,
      enum: [
        'SIMPLE_MCQ',
        'MULTIPLE_COMPLETION_MCQ',
        'PASSAGE_GROUP',
        'CQ',
        'FILL_BLANKS',
        'MATCHING',
        'DESCRIPTIVE',
        'TARJAMA_TASHREEH',
        'TAHQEEQ_SIGHA',
        'TARKIB_IRAB',
        'HURUF_TAJWEED',
        'MULTI_PART',
        'QAWAID_MISAL',
        'QAWMI_CQ',
      ],
      required: true,
      index: true,
    },
    educationStream: {
      type: String,
      enum: ['GENERAL', 'ALIA', 'QAWMI', 'NOORANI'],
      default: 'GENERAL',
      index: true,
    },
    harakatMode: {
      type: String,
      enum: ['WITH_HARAKAT', 'WITHOUT_HARAKAT'],
      default: 'WITH_HARAKAT',
    },
    stemOrPassage: { type: String, default: '' },
    statements: [{ type: String }],
    options: [McqOptionSchema],
    subQuestions: [CqSubQuestionSchema],
    passageQuestions: [PassageLinkedQuestionSchema],
    matchingColumns: MatchingColumnsSchema,
    tahqeeqWords: [TahqeeqWordEntrySchema],
    answerSpaceLines: { type: Number, default: 0 },
    writingBoxes: {
      type: { type: String, enum: ['row', 'grid'], default: 'row' },
      count: { type: Number },
      rows: { type: Number },
      cols: { type: Number },
      cells: [[{ type: String }]],
    },
    hasClues: { type: Boolean, default: false },
    wordClues: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed },
    explanation: { type: String, default: '' },
    marks: { type: Number, required: true, default: 1 },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    languages: {
      type: [String],
      enum: ['bn', 'en', 'ar', 'ur'],
      default: ['bn'],
    },
    sourceType: {
      type: String,
      enum: ['AI', 'PDF', 'MANUAL'],
      default: 'AI',
    },
    tags: [{ type: String, index: true }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid lookup and filtering
QuestionSchema.index({ userId: 1, subject: 1, grade: 1, typology: 1 });
QuestionSchema.index({ subject: 1, chapter: 1, difficulty: 1 });
QuestionSchema.index({ stemOrPassage: 'text', explanation: 'text', tags: 'text' });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
