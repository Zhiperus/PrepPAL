import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  questions: [
    {
      questionText: { type: String, required: true },
      choices: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
    },
  ],
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
