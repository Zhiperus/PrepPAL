import type { Quiz } from '@repo/shared/dist/schemas/quiz.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Omit<Quiz, '_id' | 'moduleId'>, Document {
  moduleId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    choices: [
      {
        id: { type: Number, required: true },
        text: { type: String, required: true },
      },
    ],
    correctAnswer: { type: Number, required: true },
  },
  { _id: false },
);

const quizSchema = new Schema<IQuiz>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      unique: true,
    },
    questions: [questionSchema],
  },
  { timestamps: true },
);

const QuizModel = mongoose.model<IQuiz>('Quiz', quizSchema);
export default QuizModel;
