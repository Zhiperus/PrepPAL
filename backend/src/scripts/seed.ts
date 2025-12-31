import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { GO_BAG_ITEMS } from '../lib/seedData.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import PostModel from '../models/post.model.js';
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
      GoBagItemModel.deleteMany({}),
      GoBagModel.deleteMany({}),
    ]);
    console.log('🧹 Database cleared');

    // 2. SEED CATALOG ITEMS
    const createdItems = await GoBagItemModel.insertMany(GO_BAG_ITEMS);
    console.log(`✅ Created ${createdItems.length} catalog items`);

    // 3. CREATE USERS
    const hashedPassword = await bcrypt.hash('password', 10);

    // 3a. Specific Users (For Login)
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        points: { goBag: 50, community: 10, modules: 5 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        points: { goBag: 80, community: 150, modules: 20 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle',
      },
      {
        email: 'jarence@example.com',
        password: hashedPassword,
        householdName: 'Design Studio',
        role: 'citizen',
        points: { goBag: 30, community: 5, modules: 0 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarence',
      },
    ];

    // 3b. Generate Random Users
    const randomUsersData = Array.from({ length: 20 }).map((_, i) => ({
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
      householdName: `Resident ${i + 1}`,
      phoneNumber: `0917${getRandomInt(1000000, 9999999)}`,
      role: 'citizen',
      onboardingCompleted: true,
      points: {
        goBag: getRandomInt(10, 100),
        community: getRandomInt(0, 50),
        modules: getRandomInt(0, 10),
      },
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i + 1}`,
    }));

    // Insert All Users
    const allUsers = await UserModel.create([...mainUsers, ...randomUsersData]);
    console.log(`✅ Created ${allUsers.length} users`);

    // 4. CREATE GO BAGS FOR ALL USERS
    const goBagDocs = allUsers.map((user) => {
      // Randomly decide which items this user has "packed" (between 5 and all items)
      const packedCount = getRandomInt(5, createdItems.length);
      const packedItems = getRandomSubset(createdItems, packedCount);

      return {
        userId: user._id,
        items: packedItems.map((i) => i._id.toString()), // Store just IDs
        lastUpdated: new Date(),
      };
    });

    const goBags = await GoBagModel.insertMany(goBagDocs);
    console.log(`✅ Created ${goBags.length} user go-bags`);

    // 5. CREATE POSTS (100 Entries)
    const postsData = [];
    const TOTAL_POSTS = 100;

    for (let i = 0; i < TOTAL_POSTS; i++) {
      const author = getRandomItem(allUsers);

      // Create a snapshot for this post
      // Pick 2-6 items from the catalog to "show off" in the post
      const snapshotCount = getRandomInt(2, 6);
      const snapshotItems = getRandomSubset(createdItems, snapshotCount).map(
        (item) => ({
          itemId: item._id,
          name: item.name,
          category: item.category,
        }),
      );

      // Random date within last 30 days
      const daysAgo = getRandomInt(0, 30);
      const postDate = new Date();
      postDate.setDate(postDate.getDate() - daysAgo);

      postsData.push({
        userId: author._id,
        imageUrl: getRandomItem(IMAGES),
        caption: getRandomItem(CAPTIONS),
        bagSnapshot: snapshotItems,
        verificationCount: getRandomInt(0, 50),
        verifiedItemCount: getRandomInt(0, snapshotCount), // Can't verify more than exists
        createdAt: postDate,
      });
    }

    // Sort posts by date so they look natural in DB (optional, as query sorts anyway)
    postsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const createdPosts = await PostModel.insertMany(postsData);
    console.log(`✅ Created ${createdPosts.length} posts`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
