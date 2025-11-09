import mongoose from 'mongoose';

const goBagItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  scoreWeight: { type: Number, required: true },
  description: { type: String, required: true },
  applicableIf: {
    hasFemale: { type: Boolean, required: true },
    hasDog: { type: Boolean, required: true },
    hasCat: { type: Boolean, required: true },
  },
});

const GoBagItem = mongoose.model('GoBagItem', goBagItemSchema);

export default GoBagItem;
