import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { GO_BAG_ITEMS } from '../lib/seedData.js';
import ContentReportModel from '../models/contentReport.model.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import LguModel from '../models/lgu.model.js';
import ModuleModel from '../models/module.model.js';
import PostModel from '../models/post.model.js';
import QuizModel from '../models/quiz.model.js';
import QuizAttemptModel from '../models/quizAttempt.model.js';
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
const TARGET_LOCATION = {
  region: 'NCR',
  province: 'Metro Manila',
  city: 'Quezon City',
  barangay: 'Batasan Hills',
};

const PH_LOCATIONS = [
  TARGET_LOCATION,
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
  'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1000',
  'https://images.unsplash.com/photo-1516939884455-14a5cbe23644?q=80&w=1000',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000',
  'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1000',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000',
  'https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1000',
  'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1000',
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
      ContentReportModel.deleteMany({}),
      QuizAttemptModel.deleteMany({}),
    ]);
    console.log('🧹 Database cleared');

    // 2. SEED CATALOG ITEMS
    const createdItems = await GoBagItemModel.insertMany(GO_BAG_ITEMS);
    console.log(`✅ Created ${createdItems.length} catalog items`);

    // 3. CREATE LGUS (Per Barangay)
    const lguData = PH_LOCATIONS.map((loc) => ({
      name: `Brgy. ${loc.barangay}`,
      region: loc.region,
      province: loc.province,
      city: loc.city,
      barangay: loc.barangay,
    }));

    const createdLgus = await LguModel.insertMany(lguData);
    console.log(`✅ Created ${createdLgus.length} Barangay LGUs`);

    // Helper: Find LGU ID by matching Name (Safest way)
    const getLguId = (barangayName: string) => {
      const match = createdLgus.find((l) => l.name.includes(barangayName));
      return match?._id || null;
    };

    const hashedPassword = await bcrypt.hash('password', 10);

    // 3a. Create LGU ADMINS
    const lguUsers = createdLgus.map((lgu: any) => {
      // FIX: Use lgu.name to guarantee uniqueness.
      // e.g. "Brgy. Batasan Hills" -> "lgu.brgybatasanhills@test.com"
      const rawSlug = lgu.name;
      const emailSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        email: `lgu.${emailSlug}@test.com`,
        password: hashedPassword,
        role: 'lgu',
        lguId: lgu._id,
        householdName: `${lgu.name} Hall`,
        location: {
          region: lgu.region,
          province: lgu.province,
          city: lgu.city,
          // Fallback if schema stripped the barangay field
          barangay: lgu.barangay || lgu.name.replace('Brgy. ', ''),
        },
      };
    });

    // 3b. Specific Citizen Users
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        lguId: getLguId('Batasan Hills'),
        points: { goBag: 50, community: 10, modules: 5 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
        location: TARGET_LOCATION,
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        lguId: getLguId('Fort Bonifacio'),
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
        lguId: getLguId('Batasan Hills'),
        points: { goBag: 30, community: 5, modules: 0 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarence',
        location: TARGET_LOCATION,
      },
    ];

    // 3c. Super Admin
    const superAdmin = {
      email: 'super@test.com',
      password: hashedPassword,
      role: 'super_admin',
      lguId: null,
      householdName: 'Global HQ',
      location: TARGET_LOCATION,
    };

    // 3d. Random Citizens
    const randomUsersData = Array.from({ length: 40 }).map((_, i) => {
      const location = getRandomItem(PH_LOCATIONS);
      // Find the specific LGU document for this location's barangay
      const userLguId = getLguId(location.barangay);

      return {
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        householdName: `Resident ${i + 1}`,
        phoneNumber: `0917${getRandomInt(1000000, 9999999)}`,
        role: 'citizen',
        lguId: userLguId,
        location: location,
        onboardingCompleted: true,
        points: {
          goBag: getRandomInt(10, 100),
          community: getRandomInt(0, 50),
          modules: getRandomInt(0, 10),
        },
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${
          i + 1
        }`,
      };
    });

    const createdUsers = await UserModel.create([
      superAdmin,
      ...lguUsers,
      ...mainUsers,
      ...randomUsersData,
    ]);

    const createdCitizens = createdUsers.filter((u) => u.role === 'citizen');
    console.log(`✅ Created ${createdUsers.length} total users`);

    // 4. CREATE GO BAGS
    const goBagDocs = createdCitizens.map((user) => {
      const packedCount = getRandomInt(5, createdItems.length);
      const packedItems = getRandomSubset(createdItems, packedCount);
      return {
        userId: user._id,
        imageUrl: getRandomItem(IMAGES),
        items: packedItems.map((i) => i.id.toString()),
        lastUpdated: new Date(),
      };
    });
    await GoBagModel.insertMany(goBagDocs);
    console.log(`✅ Created Go Bags`);

    // 5. CREATE POSTS
    const postsData = [];
    const eligibleAuthors = createdCitizens.filter((u) => u.lguId);

    if (eligibleAuthors.length > 0) {
      for (let i = 0; i < 100; i++) {
        const author = getRandomItem(eligibleAuthors);
        const snapshotCount = getRandomInt(2, 6);
        const snapshotItems = getRandomSubset(createdItems, snapshotCount).map(
          (item) => ({
            itemId: item._id,
            name: item.name,
            category: item.category,
          }),
        );
        const daysAgo = getRandomInt(0, 30);
        const postDate = new Date();
        postDate.setDate(postDate.getDate() - daysAgo);

        postsData.push({
          userId: author._id,
          lguId: author.lguId,
          imageUrl: getRandomItem(IMAGES),
          caption: getRandomItem(CAPTIONS),
          bagSnapshot: snapshotItems,
          verificationCount: getRandomInt(0, 50),
          verifiedItemCount: getRandomInt(0, snapshotCount),
          createdAt: postDate,
        });
      }
      postsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      await PostModel.insertMany(postsData);
      console.log(`✅ Created Posts`);
    }

    // 6. SEED MODULES & QUIZZES
    console.log('📚 Seeding Educational Modules...');
    const fireSafetyModule = await ModuleModel.create({
      title: 'Fire Safety',
      description: 'Prevention and EDITH.',
      logo: '🔥',
      content: [{ text: 'Exit Drills In The Home', imageUrl: '' }],
    });
    await QuizModel.create({
      moduleId: fireSafetyModule._id,
      questions: [
        {
          questionText: 'Smell smoke?',
          choices: [{ id: 1, text: 'Evacuate' }],
          correctAnswer: 1,
        },
      ],
    });
    console.log('✅ Modules seeded');

    // 7. CREATE CONTENT REPORTS
    console.log('🚩 Seeding Content Reports...');
    const allPosts = await PostModel.find();
    const REASONS = [
      'Misinformation',
      'Inappropriate content',
      'Impersonation',
      'Spam',
      'Fake verification',
    ];
    const reportStatuses = ['PENDING', 'RESOLVED', 'DISMISSED'];

    const reportsData = Array.from({ length: 20 }).map(() => {
      const reportedPost = getRandomItem(allPosts);
      const reporter = getRandomItem(
        createdCitizens.filter(
          (u: any) => u._id.toString() !== reportedPost.userId,
        ),
      );

      return {
        postId: reportedPost._id,
        reporterId: reporter._id,
        lguId: reportedPost.lguId,
        reason: getRandomItem(REASONS),
        status: getRandomItem(reportStatuses),
        createdAt: new Date(
          Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000,
        ),
      };
    });

    const createdReports = await ContentReportModel.insertMany(reportsData);
    console.log(`✅ Created ${createdReports.length} content reports`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
