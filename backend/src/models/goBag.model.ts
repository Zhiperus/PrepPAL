import mongoose, { Document, Schema } from 'mongoose';

export interface IGoBag extends Document {
  userId: mongoose.Types.ObjectId;
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
  items: [{ type: String, ref: 'GoBagItem' }],
  lastUpdated: { type: Date, default: Date.now },
});

const GoBagModel = mongoose.model<IGoBag>('GoBag', goBagSchema);
export default GoBagModel;
