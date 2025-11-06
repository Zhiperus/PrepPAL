import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
