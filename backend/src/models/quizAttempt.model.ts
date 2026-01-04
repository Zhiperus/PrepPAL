import type { QuizAttemptResult } from '@repo/shared/dist/schemas/quizAttempt.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt
  extends Omit<
      QuizAttemptResult,
      'quizId' | 'userId' | 'createdAt' | 'answersSubmitted'
    >,
    Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answersSubmitted: {
    questionIndex: number;
    selectedAnswerId: number;
    isCorrect: boolean;
  }[];
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
      index: true,
    },
    answersSubmitted: [
      {
        questionIndex: { type: Number, required: true },
        selectedAnswerId: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true, min: 0, max: 100 },
    correctCount: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ userId: 1, quizId: 1, score: -1 });

const QuizAttemptModel = mongoose.model<IQuizAttempt>(
  'QuizAttempt',
  quizAttemptSchema,
);

export default QuizAttemptModel;
