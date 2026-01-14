import { QuestionReport } from '@repo/shared/dist/schemas/questionReport.schema';
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionReport
  extends Omit<QuestionReport, 'id' | 'quizId' | 'questionId' | 'reporterId'>,
    Document {
  quizId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

const questionReportSchema = new Schema<IQuestionReport>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    questionId: { type: Schema.Types.ObjectId, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

const QuestionReportModel = mongoose.model<IQuestionReport>(
  'QuestionReport',
  questionReportSchema,
);

export default QuestionReportModel;
