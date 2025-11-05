import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  goBagId: { type: mongoose.Schema.Types.ObjectId, ref: "GoBag" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recommendedBasis: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "GoBagItem" },
      quantity: { type: Number, required: true },
    },
  ],
  checklistResults: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "GoBagItem" },
      quantity: { type: Number, required: true },
    },
  ],
  createdAt: [{ type: Date, required: true, default: Date.now }],
  weightedScore: { type: Number, required: true },
});

const Rating = mongoose.model("Quiz", ratingSchema);

export default Rating;
