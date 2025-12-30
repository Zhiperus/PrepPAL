import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { GO_BAG_ITEMS } from '../lib/seedData.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';

dotenv.config();

const forceSeed = async () => {
  try {
    const MONGO_URI = process.env.DATABASE_URL;
    if (!MONGO_URI) throw new Error('DATABASE_URL is not set');

    await mongoose.connect(MONGO_URI);
    console.log('📡 Connected to MongoDB for seeding...');

    const repo = new GoBagItemRepository();

    console.log('🗑️ Deleting all existing Go Bag items...');
    await repo.deleteAll();

    console.log('🌱 Re-seeding Go Bag items...');
    await repo.seedData(GO_BAG_ITEMS);

    console.log('✅ Force initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

forceSeed();
