import { ContentReport } from '@repo/shared/dist/schemas/contentReport.schema';
import mongoose, { Schema, Document } from 'mongoose';

export interface IContentReport
  extends Omit<ContentReport, 'id' | 'lguId' | 'postId' | 'reporterId'>,
    Document {
  postId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  lguId: mongoose.Types.ObjectId;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

const contentReportSchema = new Schema<IContentReport>(
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

const ContentReportModel = mongoose.model<IContentReport>(
  'ContentReport',
  contentReportSchema,
);

export default ContentReportModel;
