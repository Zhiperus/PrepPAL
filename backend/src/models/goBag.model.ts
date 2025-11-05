import mongoose from "mongoose";

const goBagSchema = new mongoose.Schema({
  isRecommended: { type: Boolean, required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "GoBagItem" },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

const GoBag = mongoose.model("GoBag", goBagSchema);

export default GoBag;
