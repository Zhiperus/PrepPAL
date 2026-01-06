import type { GoBagItem } from '@repo/shared/dist/schemas/goBagItem.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IGoBagItem extends Omit<GoBagItem, '_id'>, Document {}

const goBagItemSchema = new Schema<IGoBagItem>({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'food',
      'water',
      'hygiene',
      'first-aid',
      'tools',
      'tech',
      'clothing',
      'documents',
    ],
    required: true,
  },
  defaultQuantity: { type: Number, default: 1 },
});

const GoBagItemModel = mongoose.model<IGoBagItem>('GoBagItem', goBagItemSchema);
export default GoBagItemModel;
