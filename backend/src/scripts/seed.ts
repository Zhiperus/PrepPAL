import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import your models
import { GO_BAG_ITEMS } from '../lib/seedData.js';
import ContentReportModel from '../models/contentReport.model.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import ModuleModel from '../models/module.model.js';
import PostModel from '../models/post.model.js';
import QuestionReportModel from '../models/questionReport.model.js';
import QuizModel from '../models/quiz.model.js';
import QuizAttemptModel from '../models/quizAttempt.model.js';
import RatingModel from '../models/rating.model.js';
import UserModel from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || '';

// --- CONFIGURATION ---
const TARGET_LOCATION = {
  region: 'V', // Bicol Region
  province: 'Albay',
  city: 'Camalig',
  cityCode: '050502000', // Actual PSGC
  barangay: 'Barangay 6 (Pob.)',
  barangayCode: '050502051', // Actual PSGC
};

// Realistic "Go Bag" Images (Authentic photos)
const REALISTIC_BAG_IMAGES = [
  'https://aarp.widen.net/content/waj0amhnsw/jpeg/20250320-.org-disaster-go-bag_-121_v2_D-curved.jpg?crop=true&anchor=84,65&q=80&color=ffffffff&u=lywnjt&w=1841&h=1058',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHyKnQZDCq2rNuzonCL9XQ9VWNpOPEhzNWYw&s',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', // Tactical backpack
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', // Military gear
  'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&w=800&q=80', // Hiking pack
];

// Realistic Captions for the Feed
const FEED_CAPTIONS = [
  'Mayon is acting up again, refreshed my grab bag just in case! 🌋 ',
  'Barangay meeting said we need more water storage. Done! 💧',
  'Ready for the rainy season. Stay safe neighbors! ☔',
  'Finally completed my first aid kit. 🩹',
  'Does anyone have extra batteries? I have extra canned goods to trade. 🔋',
  'Evacuation simulation was helpful. Bag is packed! 🏃‍♂️',
  'Check your expiration dates everyone! 📅',
  'Preparedness is the key. #CamaligReady 🇵🇭',
];

// High-Quality Module Content
const PROPER_MODULES = [
  {
    title: 'Earthquake Preparedness',
    description:
      'Essential survival strategies before, during, and after an earthquake.',
    logo: '🌋',
    content: [
      {
        text: 'DURING SHAKING: Drop, Cover, and Hold On. Do not run outside while the ground is shaking.',
        imageUrl:
          'https://images.unsplash.com/photo-1590422502687-73b378129712?auto=format&fit=crop&w=800&q=80',
      },
      {
        text: 'AFTER SHAKING: Check for gas leaks. If you smell rotten eggs, open windows and leave.',
        imageUrl: '',
      },
    ],
    questions: [
      {
        q: 'What is the most recommended action during an earthquake?',
        choices: [
          'Run outside',
          'Drop, Cover, and Hold On',
          'Stand in a doorway',
        ],
        a: 1,
      },
      {
        q: 'If you are in bed when it strikes?',
        choices: ['Roll to floor', 'Cover head with pillow', 'Run to CR'],
        a: 1,
      },
      {
        q: 'What to check for immediately after?',
        choices: ['Facebook updates', 'Gas leaks', 'Pets'],
        a: 1,
      },
    ],
  },
  {
    title: 'Typhoon Safety',
    description: 'Understanding signals and evacuation protocols.',
    logo: '🌀',
    content: [
      {
        text: 'SIGNAL NO 3: Destructive winds (89-117 kph). Evacuate if you are in a low-lying area.',
        imageUrl:
          'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&w=800&q=80',
      },
      {
        text: 'PREPARATION: Secure loose roofing and store 3 days of water.',
        imageUrl: '',
      },
    ],
    questions: [
      {
        q: 'How much water per person per day?',
        choices: ['1 Liter', '4 Liters (1 Gallon)', '10 Liters'],
        a: 1,
      },
      {
        q: 'When to evacuate?',
        choices: ['When water rises', 'During the eye', 'When advised by LGU'],
        a: 2,
      },
    ],
  },
  {
    title: 'Fire Safety (PASS)',
    description: 'How to use a fire extinguisher correctly.',
    logo: '🔥',
    content: [
      {
        text: 'Remember P.A.S.S.: Pull, Aim, Squeeze, Sweep.',
        imageUrl:
          'https://images.unsplash.com/photo-1505494200-a5061b47480a?auto=format&fit=crop&w=800&q=80',
      },
    ],
    questions: [
      {
        q: 'What does "P" stand for?',
        choices: ['Push', 'Pull', 'Panic'],
        a: 1,
      },
      {
        q: 'Where do you aim?',
        choices: ['Top of flames', 'Base of fire', 'Middle'],
        a: 1,
      },
    ],
  },
];

// --- UTILS ---
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], size: number): T[] =>
  arr
    .slice()
    .sort(() => 0.5 - Math.random())
    .slice(0, size);

const seedCamalig = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. WIPE CLEAN
    await Promise.all([
      UserModel.deleteMany({}),
      PostModel.deleteMany({}),
      GoBagItemModel.deleteMany({}),
      GoBagModel.deleteMany({}),
      ModuleModel.deleteMany({}),
      QuizModel.deleteMany({}),
      ContentReportModel.deleteMany({}),
      QuestionReportModel.deleteMany({}),
      QuizAttemptModel.deleteMany({}),
      RatingModel.deleteMany({}),
    ]);
    console.log('🧹 Database Wiped');

    // 2. SEED CATALOG
    const createdItems = await GoBagItemModel.insertMany(GO_BAG_ITEMS);
    console.log(`✅ Catalog populated`);

    const hashedPassword = await bcrypt.hash('password', 10);

    // 3. CREATE USERS

    // 3a. SUPER ADMIN (National Level) - ADDED THIS
    await UserModel.create({
      email: 'super@prep.gov.ph',
      password: hashedPassword,
      role: 'super_admin',
      location: null, // Super Admins don't have a specific location
      householdName: 'National HQ',
      isEmailVerified: true,
      onboardingCompleted: true,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Super',
    });
    console.log('✅ Created Super Admin (super@prep.gov.ph)');

    // 3d. Filler Citizens (All in Camalig for Leaderboard density)
    const randomUsersData = Array.from({ length: 40 }).map((_, i) => ({
      email: `resident${i}@example.com`,
      password: hashedPassword,
      householdName: `Resident ${i}`,
      role: 'citizen',
      location: TARGET_LOCATION, // <--- EVERYONE is in Camalig
      householdInfo: {
        memberCount: 4,
        femaleCount: 2,
        pets: 1,
      },
      isEmailVerified: true,
      onboardingCompleted: true,
      points: {
        goBag: getRandomInt(20, 100),
        community: getRandomInt(0, 50),
        modules: getRandomInt(0, 30),
      },
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=Resident${i}`,
    }));

    const randomUsers = await UserModel.insertMany(randomUsersData);
    const allCitizens = [...randomUsers];

    console.log(
      `✅ Created ${allCitizens.length} Citizens in Barangay 6 (Pob.), Camalig`,
    );

    // 4. CREATE GO BAGS
    const goBagDocs = allCitizens.map((user) => {
      // Iorie gets an empty bag for demo purposes
      if (user.email === 'iorie@example.com') {
        return {
          userId: user._id,
          items: [],
          imageUrl: 'https://placehold.co/600x400?text=No+Photo+Yet',
          lastUpdated: new Date(),
        };
      }

      // Everyone else gets random items
      const count = getRandomInt(5, 15);
      const items = getRandomSubset(createdItems, count).map((i) => i._id);

      return {
        userId: user._id,
        items: items,
        imageUrl: getRandomItem(REALISTIC_BAG_IMAGES),
        lastUpdated: new Date(),
      };
    });

    await GoBagModel.insertMany(goBagDocs);
    console.log(`✅ Created Go Bags`);

    // 5. CREATE COMMUNITY POSTS
    const postsData = [];
    for (let i = 0; i < 50; i++) {
      const author = getRandomItem(allCitizens);
      const snapshotItems = getRandomSubset(createdItems, 3).map((item) => ({
        itemId: item._id,
        name: item.name,
        category: item.category,
      }));

      postsData.push({
        userId: author._id,
        barangayCode: TARGET_LOCATION.barangayCode,
        imageUrl: getRandomItem(REALISTIC_BAG_IMAGES),
        caption: getRandomItem(FEED_CAPTIONS),
        bagSnapshot: snapshotItems,
        verificationCount: getRandomInt(0, 20),
        createdAt: new Date(
          Date.now() - getRandomInt(0, 14) * 24 * 60 * 60 * 1000,
        ),
      });
    }
    const createdPosts = await PostModel.insertMany(postsData);
    console.log(`✅ Created ${createdPosts.length} Feed Posts`);

    // 6. MODULES & QUIZZES
    for (const mod of PROPER_MODULES) {
      const newMod = await ModuleModel.create({
        title: mod.title,
        description: mod.description,
        logo: mod.logo,
        content: mod.content,
      });

      if (mod.questions.length > 0) {
        await QuizModel.create({
          moduleId: newMod._id,
          questions: mod.questions.map((q) => ({
            questionText: q.q,
            choices: q.choices.map((c, i) => ({ id: i, text: c })),
            correctAnswer: q.a,
          })),
        });
      }
    }
    console.log(`✅ Created Proper Modules`);

    // 7. REPORTS (For Admin Demo)
    const reportsData = [];
    for (let i = 0; i < 8; i++) {
      const post = getRandomItem(createdPosts);
      const reporter = getRandomItem(
        allCitizens.filter((u) => u._id !== post.userId),
      );
      reportsData.push({
        postId: post._id,
        reporterId: reporter._id,
        barangayCode: TARGET_LOCATION.barangayCode,
        reason: i % 2 === 0 ? 'Spam / Irrelevant' : 'Fake Photo',
        status: 'PENDING',
        createdAt: new Date(),
      });
    }
    await ContentReportModel.insertMany(reportsData);
    console.log(`✅ Created 8 Pending Reports`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedCamalig();
