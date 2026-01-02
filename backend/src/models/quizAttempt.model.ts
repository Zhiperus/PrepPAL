import type { QuizAttempt } from '@repo/shared/dist/schemas/quizAttempt.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt
  extends Omit<QuizAttempt, 'quizId' | 'userId' | 'createdAt'>,
    Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Fast lookup for a specific user's history
    },
    answers: [{ type: Number, required: true }],
    correctAnswers: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const QuizAttemptModel = mongoose.model<IQuizAttempt>(
  'QuizAttempt',
  quizAttemptSchema,
);
export default QuizAttemptModel;
