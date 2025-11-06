import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: { type: String, required: true },
  goBagId: { type: mongoose.Schema.Types.ObjectId, ref: "GoBag" },
  date: { type: Date, required: true, default: Date.now },
  averageScore: { type: Number, required: true },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
