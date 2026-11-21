import mongoose, { Document, Schema } from 'mongoose';
import { ExamPaperData, ExamSet, InstitutionHeaderConfig, LayoutConfig } from 'proshno-shared';
import { QuestionSchema } from './Question';

export interface IExamPaper extends Document, Omit<ExamPaperData, '_id' | 'userId'> {
  userId?: mongoose.Types.ObjectId;
}

const InstitutionHeaderSchema = new Schema<InstitutionHeaderConfig>(
  {
    institutionName: { type: String, required: true },
    institutionAddress: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    examTitle: { type: String, required: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, default: '' },
    grade: { type: String, default: '' },
    timeAllowed: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    generalInstructions: [{ type: String }],
    headerPreset: {
      type: String,
      enum: ['NCTB', 'QAWMI', 'NOORANI', 'NOORANI_GRID'],
      default: 'NCTB',
    },
    educationStream: {
      type: String,
      enum: ['GENERAL', 'ALIA', 'QAWMI', 'NOORANI'],
      default: 'GENERAL',
    },
    bismillahText: { type: String, default: '' },
    jamat: { type: String, default: '' },
    kitab: { type: String, default: '' },
    nooraniBoardTitle: { type: String, default: '' },
    handwritingMarks: { type: Number },
    showScoreRubricTable: { type: Boolean, default: true },
    questionsToAnswer: { type: Number },
    totalQuestionsIncluded: { type: Number },
    choiceInstructionText: { type: String, default: '' },
  },
  { _id: false }
);

const LayoutConfigSchema = new Schema<LayoutConfig>(
  {
    columns: { type: Number, enum: [1, 2], default: 2 },
    fontSize: { type: String, enum: ['compact', 'standard', 'large'], default: 'standard' },
    paperSize: { type: String, enum: ['A4', 'Legal'], default: 'A4' },
    margins: {
      topMm: { type: Number, default: 14 },
      bottomMm: { type: Number, default: 14 },
      leftMm: { type: Number, default: 18 },
      rightMm: { type: Number, default: 18 },
    },
    numberingFormat: {
      type: String,
      enum: ['bn', 'en', 'ar', 'ur'],
      default: 'bn',
    },
    watermarkText: { type: String, default: '' },
    showMarks: { type: Boolean, default: true },
    showAnswers: { type: Boolean, default: false },
    showOmrGuide: { type: Boolean, default: false },
  },
  { _id: false }
);

const ExamSetEntrySchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    order: { type: Number, required: true },
    optionOrder: [{ type: Number }],
    customQuestionData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ExamSetSchema = new Schema<ExamSet>(
  {
    setName: { type: String, required: true },
    questionEntries: [ExamSetEntrySchema],
    answerKeyMap: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const ExamPaperSchema = new Schema<IExamPaper>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true },
    headerConfig: { type: InstitutionHeaderSchema, required: true },
    layoutConfig: { type: LayoutConfigSchema, required: true },
    questions: [QuestionSchema],
    sets: [ExamSetSchema],
    activeSet: { type: String, default: 'Set A' },
    educationStream: {
      type: String,
      enum: ['GENERAL', 'ALIA', 'QAWMI', 'NOORANI'],
      default: 'GENERAL',
    },
  },
  {
    timestamps: true,
  }
);

ExamPaperSchema.index({ userId: 1, createdAt: -1 });

export const ExamPaper = mongoose.model<IExamPaper>('ExamPaper', ExamPaperSchema);
