import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { GO_BAG_ITEMS } from '../lib/seedData.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import LguModel from '../models/lgu.model.js';
import ModuleModel from '../models/module.model.js';
import PostModel from '../models/post.model.js';
import QuizModel from '../models/quiz.model.js';
import UserModel from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || '';

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = <T>(arr: T[], size: number): T[] => {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};

// --- LOCATIONS ---
// We define a "target" location to populate heavily for testing
const TARGET_LOCATION = {
  region: 'NCR',
  province: 'Metro Manila',
  city: 'Quezon City',
  barangay: 'Batasan Hills',
};

const PH_LOCATIONS = [
  TARGET_LOCATION, // Batasan Hills
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Quezon City',
    barangay: 'Diliman',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Manila',
    barangay: 'Tondo',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Makati',
    barangay: 'Poblacion',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Taguig',
    barangay: 'Fort Bonifacio',
  },
  {
    region: 'IV-A',
    province: 'Laguna',
    city: 'Santa Rosa',
    barangay: 'Balibago',
  },
  {
    region: 'IV-A',
    province: 'Cavite',
    city: 'Dasmarinas',
    barangay: 'Salawag',
  },
  {
    region: 'III',
    province: 'Pampanga',
    city: 'Angeles',
    barangay: 'Balibago',
  },
  { region: 'VII', province: 'Cebu', city: 'Cebu City', barangay: 'Guadalupe' },
  {
    region: 'XI',
    province: 'Davao del Sur',
    city: 'Davao City',
    barangay: 'Buhangin',
  },
];

const CAPTIONS = [
  'Just updated my kit! 🎒',
  'Safety first. Ready for the typhoon season.',
  'Finally bought a proper flashlight.',
  'Checking expiration dates on my canned goods.',
  'Added a whistle to my bag today.',
  'My Go Bag is finally 100% complete!',
  'Hope I never have to use this, but glad I have it.',
  'Reminder: Check your batteries!',
  'Packing light but essential.',
  'Got this new multi-tool, highly recommend it.',
  'Preparing for the worst, hoping for the best.',
  'Family safety is priority #1.',
  'Reviewing my checklist...',
  'Don’t forget your important documents!',
  'Water supply refreshed. 💧',
];

const IMAGES = [
  'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1000', // Bag
  'https://images.unsplash.com/photo-1516939884455-14a5cbe23644?q=80&w=1000', // Flashlight
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000', // Camping Gear
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000', // Watch/Tech
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000', // Bike/Gear
  'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1000', // First Aid
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000', // Canned Food
  'https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1000', // Water
  'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1000', // Electronics
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. CLEAR EXISTING DATA
    await Promise.all([
      UserModel.deleteMany({}),
      PostModel.deleteMany({}),
      LguModel.deleteMany({}),
      GoBagItemModel.deleteMany({}),
      GoBagModel.deleteMany({}),
      ModuleModel.deleteMany({}),
      QuizModel.deleteMany({}),
    ]);
    console.log('🧹 Database cleared');

    // 2. SEED CATALOG ITEMS
    const createdItems = await GoBagItemModel.insertMany(GO_BAG_ITEMS);
    console.log(`✅ Created ${createdItems.length} catalog items`);

    // 3. CREATE LGUS
    const lgus = await LguModel.insertMany([
      {
        name: 'Manila',
        region: 'NCR',
        province: 'Metro Manila',
        city: 'Manila',
      },
      {
        name: 'Quezon City',
        region: 'NCR',
        province: 'Metro Manila',
        city: 'Quezon City',
      },
    ]);

    const manilaId = lgus[0]._id;
    const qcId = lgus[1]._id;

    const hashedPassword = await bcrypt.hash('password', 10);

    // 4. CREATE USERS

    // 4a. Specific Main Users
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        lguId: qcId, // Batasan is in QC
        points: { goBag: 50, community: 10, modules: 5 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
        location: TARGET_LOCATION, // Batasan Hills
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        lguId: null, // Taguig doesn't have an LGU record in this seed yet
        points: { goBag: 80, community: 150, modules: 20 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle',
        location: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Taguig',
          barangay: 'Fort Bonifacio',
        },
      },
      {
        email: 'jarence@example.com',
        password: hashedPassword,
        householdName: 'Design Studio',
        role: 'citizen',
        lguId: qcId,
        points: { goBag: 30, community: 5, modules: 0 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarence',
        location: TARGET_LOCATION, // Also in Batasan Hills for competition
      },
    ];

    // 4b. Admins
    const adminsToCreate = [
      {
        email: 'super@test.com',
        password: hashedPassword,
        role: 'super_admin',
        lguId: null, // Sees everything
        householdName: 'Global HQ',
      },
      {
        email: 'lgu.manila@test.com',
        password: hashedPassword,
        role: 'lgu',
        lguId: manilaId, // Only sees Manila data
        householdName: 'Manila City Hall',
      },
      {
        email: 'lgu.qc@test.com',
        password: hashedPassword