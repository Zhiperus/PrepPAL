import { QuestionReport } from '@repo/shared/dist/schemas/questionReport.schema';
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionReport
  extends Omit<QuestionReport, 'id' | 'lguId' | 'postId' | 'reporterId'>,
    Document {
  postId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  lguId: mongoose.Types.ObjectId;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

const questionReportSchema = new Schema<IQuestionReport>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lguId: { type: Schema.Types.ObjectId, ref: 'Lgu', required: true },
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
