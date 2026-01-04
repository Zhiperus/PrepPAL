import mongoose, { Document, Schema } from 'mongoose';

export interface IGoBag extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  imageId: string | null;
  items: string[];
  lastUpdated: Date;
}

const goBagSchema = new Schema<IGoBag>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  imageUrl: { type: String, required: true },
  imageId: { type: String, default: null },
  items: [{ type: String, ref: 'GoBagItem' }],
  lastUpdated: { type: Date, default: Date.now },
});

const GoBagModel = mongoose.model<IGoBag>('GoBag', goBagSchema);
export default GoBagModel;
