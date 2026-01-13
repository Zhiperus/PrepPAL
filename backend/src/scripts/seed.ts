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
import QuestionReportModel from '../models/questionReport.model.js';
import QuizModel from '../models/quiz.model.js';
import QuizAttemptModel from '../models/quizAttempt.model.js';
import UserModel from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || '';

// --- UTILS ---
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = <T>(arr: T[], size: number): T[] => {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};

// --- DATA CONSTANTS ---

const PH_LOCATIONS = [
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Quezon City',
    barangay: 'Batasan Hills',
  },
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
    region: 'VII',
    province: 'Cebu',
    city: 'Cebu City',
    barangay: 'Lahug',
  },
];

const CAPTIONS = [
  'Just updated my kit! 🎒 #Ready',
  'Safety first. Ready for the typhoon season.',
  'Finally bought a proper flashlight. 🔦',
  'Checking expiration dates on my canned goods today.',
  'Added a whistle and mask to my bag.',
  'My Go Bag is finally 100% complete! Feels good.',
  'Hope I never have to use this, but glad I have it.',
  'Reminder: Check your batteries every 6 months!',
  'Packing light but essential. Rate my setup?',
  'Got this new multi-tool, highly recommend it.',
  'Preparing for the worst, hoping for the best. 🙏',
  'Family safety is priority #1.',
  'Reviewing my checklist... seems I missed water.',
  'Don’t forget your important documents in a waterproof bag!',
  'Water supply refreshed. 💧',
  'Staying alert with the heavy rains coming. Stay safe everyone!',
  'Just finished the Fire Safety module. Learned a lot!',
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

// --- SEED FUNCTION ---

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
      QuestionReportModel.deleteMany({}),
      QuizAttemptModel.deleteMany({}),
    ]);
    console.log('🧹 Database cleared');

    // 2. SEED CATALOG ITEMS
    const createdItems = await GoBagItemModel.insertMany(GO_BAG_ITEMS);
    console.log(`✅ Created ${createdItems.length} catalog items`);

    // 3. CREATE LGUs (Per Barangay)
    // The Location data lives HERE now
    const lguData = PH_LOCATIONS.map((loc) => ({
      name: `Brgy. ${loc.barangay}`,
      region: loc.region,
      province: loc.province,
      city: loc.city,
      barangay: loc.barangay,
    }));

    const createdLgus = await LguModel.insertMany(lguData);
    console.log(`✅ Created ${createdLgus.length} Barangay LGUs`);

    const getLguId = (barangayName: string) => {
      const match = createdLgus.find((l) => l.name.includes(barangayName));
      return match?._id || null;
    };

    const hashedPassword = await bcrypt.hash('password', 10);

    // 4. CREATE USERS

    // 4a. LGU ADMINS (CLEAN - No Location, No Points)
    const lguAdmins = createdLgus.map((lgu: any) => {
      const rawSlug = lgu.name;
      const emailSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        email: `admin.${emailSlug}@prep.gov.ph`,
        password: hashedPassword,
        role: 'lgu',
        lguId: lgu._id,
        householdName: `${lgu.name} Admin`,
        // CLEAN OBJECT: No location, no points, no householdInfo
        isEmailVerified: true,
        onboardingCompleted: true,
      };
    });

    // 4b. CITIZENS (Have Location & Points defaults)
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        lguId: getLguId('Batasan Hills'),
        location: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Taguig',
          barangay: 'Fort Bonifacio',
        },
        points: { goBag: 50, community: 10, modules: 5 },
        householdInfo: { memberCount: 4, femaleCount: 2, pets: 1 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
        isEmailVerified: true,
        onboardingCompleted: true,
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        lguId: getLguId('Fort Bonifacio'),
        location: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Taguig',
          barangay: 'Fort Bonifacio',
        },
        points: { goBag: 80, community: 150, modules: 20 },
        householdInfo: { memberCount: 1, femaleCount: 0, pets: 0 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle',
        isEmailVerified: true,
        onboardingCompleted: true,
      },
    ];

    const superAdmin = {
      email: 'super@prep.gov.ph',
      password: hashedPassword,
      role: 'super_admin',
      lguId: null,
      householdName: 'National HQ',
      isEmailVerified: true,
      onboardingCompleted: true,
    };

    // 4c. RANDOM CITIZENS
    const randomUsersData = Array.from({ length: 60 }).map((_, i) => {
      const location = getRandomItem(PH_LOCATIONS);
      const userLguId = getLguId(location.barangay);

      return {
        email: `resident${i + 1}@example.com`,
        password: hashedPassword,
        householdName: `Resident ${i + 1}`,
        phoneNumber: `0917${getRandomInt(1000000, 9999999)}`,
        role: 'citizen',
        lguId: userLguId,
        location: location, // Location is required for Citizens
        onboardingCompleted: true,
        householdInfo: {
          memberCount: getRandomInt(1, 6),
          femaleCount: getRandomInt(0, 3),
          pets: getRandomInt(0, 2),
        },
        points: {
          goBag: getRandomInt(10, 100),
          community: getRandomInt(0, 50),
          modules: getRandomInt(0, 10),
        },
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=Resident${i}`,
      };
    });

    // Create All Users
    // Mongoose Discriminators will handle the schema differences based on 'role'
    const createdUsers = await UserModel.create([
      superAdmin,
      ...lguAdmins,
      ...mainUsers,
      ...randomUsersData,
    ]);

    const createdCitizens = createdUsers.filter((u) => u.role === 'citizen');
    console.log(
      `✅ Created ${createdUsers.length} Users (${lguAdmins.length} Admins, ${createdCitizens.length} Citizens)`,
    );

    // 5. CREATE GO BAGS
    const goBagDocs = createdCitizens.map((user) => {
      const packedCount = getRandomInt(3, createdItems.length);
      const packedItems = getRandomSubset(createdItems, packedCount);

      return {
        userId: user._id,
        imageUrl: getRandomItem(IMAGES),
        items: packedItems.map((i) => i.id.toString()),
        lastUpdated: new Date(
          Date.now() - getRandomInt(0, 60) * 24 * 60 * 60 * 1000,
        ),
      };
    });

    await GoBagModel.insertMany(goBagDocs);
    console.log(`✅ Created ${goBagDocs.length} Go Bags`);

    // 6. CREATE POSTS (Increased volume for analytics)
    const postsData = [];
    const eligibleAuthors = createdCitizens.filter((u) => u.lguId);

    if (eligibleAuthors.length > 0) {
      for (let i = 0; i < 200; i++) {
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
      console.log(`✅ Created ${postsData.length} Community Posts`);
    }

    // 7. SEED MODULES & QUIZZES
    console.log('📚 Seeding Educational Modules...');

    const modulesData = [
      {
        title: 'Earthquake Readiness',
        description: 'Drop, Cover, and Hold strategies.',
        logo: '🌋',
        content: [
          {
            text: 'If you are indoors, stay there. Get under a desk.',
            imageUrl: '',
          },
        ],
        questions: [
          {
            q: 'What is the first thing to do?',
            choices: ['Run', 'Drop', 'Scream'],
            a: 1,
          },
          {
            q: 'Where should you hide?',
            choices: ['Under a table', 'Near a window', 'Elevator'],
            a: 0,
          },
        ],
      },
      {
        title: 'Typhoon Survival',
        description: 'Preparing your home for heavy storms.',
        logo: '🌀',
        content: [
          { text: 'Secure loose items outside your home.', imageUrl: '' },
        ],
        questions: [
          {
            q: 'When should you evacuate?',
            choices: ['During the eye', 'When told by LGU', 'Never'],
            a: 1,
          },
        ],
      },
      {
        title: 'Basic First Aid',
        description: 'Treating minor cuts and burns.',
        logo: '🩹',
        content: [{ text: 'Clean cuts with soap and water.', imageUrl: '' }],
        questions: [
          {
            q: 'Best treatment for minor burns?',
            choices: ['Butter', 'Ice', 'Cool Water'],
            a: 2,
          },
        ],
      },
    ];

    for (const mod of modulesData) {
      const newMod = await ModuleModel.create({
        title: mod.title,
        description: mod.description,
        logo: mod.logo,
        content: mod.content,
      });

      await QuizModel.create({
        moduleId: newMod._id,
        questions: mod.questions.map((q, idx) => ({
          questionText: q.q,
          choices: q.choices.map((c, i) => ({ id: i, text: c })),
          correctAnswer: q.a,
        })),
      });
    }
    console.log(`✅ Created ${modulesData.length} Modules with Quizzes`);

    // 8. CREATE CONTENT REPORTS (Increased volume)
    console.log('🚩 Seeding Content Reports...');

    const allPosts = await PostModel.find();
    const REPORT_REASONS = [
      'Misinformation',
      'Inappropriate content',
      'Impersonation',
      'Spam',
      'Harassment',
      'Fake verification image',
    ];
    // Weighted towards PENDING so the dashboard has work to do
    const REPORT_STATUSES = ['PENDING', 'PENDING', 'RESOLVED', 'DISMISSED'];

    const reportsData = [];

    // Create ~50 reports
    for (let i = 0; i < 50; i++) {
      const reportedPost = getRandomItem(allPosts);
      // Ensure reporter is different from author
      const possibleReporters = createdCitizens.filter(
        (u) => u._id.toString() !== reportedPost.userId.toString(),
      );

      if (possibleReporters.length > 0) {
        const reporter = getRandomItem(possibleReporters);
        reportsData.push({
          postId: reportedPost._id,
          reporterId: reporter._id,
          lguId: reportedPost.lguId, // Crucial for LGU Admin filtering
          reason: getRandomItem(REPORT_REASONS),
          status: getRandomItem(REPORT_STATUSES),
          createdAt: new Date(
            Date.now() - getRandomInt(0, 10) * 24 * 60 * 60 * 1000,
          ),
        });
      }
    }

    const createdReports = await ContentReportModel.insertMany(reportsData);
    console.log(`✅ Created ${createdReports.length} Content Reports`);

    // 9. SEED QUESTION REPORTS
    console.log('❓ Seeding Question Reports...');

    const allQuizzes = await QuizModel.find();
    const QUESTION_REPORT_REASONS = [
      'Inaccurate answer key',
      'Typo in question text',
      'Confusing choices',
      'Image not loading',
      'Outdated information',
    ];

    const questionReportsData = [];

    // Create ~30 question reports
    for (let i = 0; i < 30; i++) {
      const targetQuiz = getRandomItem(allQuizzes);

      // Pick a random question from the quiz's questions array
      const targetQuestion = getRandomItem(targetQuiz.questions);

      const reporter = getRandomItem(createdCitizens);

      questionReportsData.push({
        quizId: targetQuiz._id,
        questionId: targetQuestion._id, // References the subdocument ID
        reporterId: reporter._id,
        reason: getRandomItem(QUESTION_REPORT_REASONS),
        status: getRandomItem(['PENDING', 'PENDING', 'RESOLVED']), // Weighted to Pending
        createdAt: new Date(
          Date.now() - getRandomInt(0, 15) * 24 * 60 * 60 * 1000,
        ),
      });
    }

    const createdQuestionReports = await QuestionReportModel.insertMany(
      questionReportsData,
    );
    console.log(`✅ Created ${createdQuestionReports.length} Question Reports`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
