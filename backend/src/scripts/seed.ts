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

    // 3a. Specific Users
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        lguId: qcId, // Batasan is in QC
        points: { goBag: 50, community: 10, modules: 5 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
        location: TARGET_LOCATION,
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        lguId: null, // Taguig (No seeded LGU)
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
        location: TARGET_LOCATION,
      },
    ];

    // 3b. LGUs and Super Admins
    const adminsToCreate = [
      {
        email: 'super@test.com',
        password: hashedPassword,
        role: 'super_admin',
        lguId: null,
        householdName: 'Global HQ',
      },
      {
        email: 'lgu.manila@test.com',
        password: hashedPassword,
        role: 'lgu',
        lguId: manilaId,
        householdName: 'Manila City Hall',
      },
      {
        email: 'lgu.qc@test.com',
        password: hashedPassword,
        role: 'lgu',
        lguId: qcId,
        householdName: 'QC City Hall',
      },
    ];

    // 3c. Generate Random Users
    const randomUsersData = Array.from({ length: 40 }).map((_, i) => {
      const isTarget = Math.random() > 0.5;
      const location = isTarget ? TARGET_LOCATION : getRandomItem(PH_LOCATIONS);

      // Assign LGU ID ONLY if in seeded cities
      let userLguId = null;
      if (location.city === 'Manila') userLguId = manilaId;
      if (location.city === 'Quezon City') userLguId = qcId;

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
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i + 1}`,
      };
    });

    // Insert All Users
    const citizensToCreate = [...mainUsers, ...randomUsersData];
    const createdCitizens = await UserModel.create(citizensToCreate);
    const createdAdmins = await UserModel.create(adminsToCreate);

    console.log(
      `✅ Created ${createdCitizens.length} citizens and ${createdAdmins.length} admins`,
    );

    // 4. CREATE GO BAGS
    const goBagDocs = createdCitizens.map((user) => {
      const packedCount = getRandomInt(5, createdItems.length);
      const packedItems = getRandomSubset(createdItems, packedCount);

      return {
        userId: user._id,
        imageUrl: getRandomItem(IMAGES),
        // Simple string IDs as requested
        items: packedItems.map((i) => i._id.toString()),
        lastUpdated: new Date(),
      };
    });

    const goBags = await GoBagModel.insertMany(goBagDocs);
    console.log(`✅ Created ${goBags.length} user go-bags`);

    // 5. CREATE POSTS (100 Entries)
    const postsData = [];
    const TOTAL_POSTS = 100;

    // FIX: Filter for authors who HAVE an LGU ID.
    // If author.lguId is null, PostModel validation fails.
    const eligibleAuthors = createdCitizens.filter((u) => u.lguId);

    if (eligibleAuthors.length > 0) {
      for (let i = 0; i < TOTAL_POSTS; i++) {
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
          lguId: author.lguId, // Guaranteed to exist now
          imageUrl: getRandomItem(IMAGES),
          caption: getRandomItem(CAPTIONS),
          bagSnapshot: snapshotItems,
          verificationCount: getRandomInt(0, 50),
          verifiedItemCount: getRandomInt(0, snapshotCount),
          createdAt: postDate,
        });
      }

      postsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const createdPosts = await PostModel.insertMany(postsData);
      console.log(`✅ Created ${createdPosts.length} posts`);
    } else {
      console.log('⚠️ No eligible authors for posts found (skipping posts)');
    }

    // 6. SEED MODULES AND QUIZZES
    console.log('📚 Seeding Educational Modules...');

    // --- Module 1: Fire Safety ---
    const fireSafetyModule = await ModuleModel.create({
      title: 'Fire Safety & Prevention (BFP Philippines)',
      description:
        'A comprehensive guide on preventing household fires and EDITH drills.',
      logo: '🔥',
      content: [
        {
          text: 'EDITH (Exit Drills In The Home) saves lives. Know two ways out of every room.',
          imageUrl:
            'https://images.unsplash.com/photo-1599700403969-fcf019771e8c?q=80&w=1000',
        },
        {
          text: 'Never leave cooking unattended. Grease fires cannot be put out with water—use a lid to smother it.',
          imageUrl:
            'https://images.unsplash.com/photo-1506459392231-1593959c8699?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: fireSafetyModule._id,
      questions: [
        {
          questionText: 'What is the first thing to do when you smell smoke?',
          choices: [
            { id: 1, text: 'Hide under the bed' },
            { id: 2, text: 'Alert others and evacuate' },
            { id: 3, text: 'Look for your phone' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'Which class of fire extinguisher is best for electrical fires?',
          choices: [
            { id: 1, text: 'Class A (Water)' },
            { id: 2, text: 'Class C (Dry Chemical)' },
            { id: 3, text: 'A bucket of sand' },
          ],
          correctAnswer: 2,
        },
      ],
    });

    // --- Module 2: Earthquake Preparedness ---
    const earthquakeModule = await ModuleModel.create({
      title: 'Earthquake Preparedness (PHIVOLCS)',
      description:
        'Mastering the Drop, Cover, and Hold On technique and understanding fault lines.',
      logo: '🏚️',
      content: [
        {
          text: 'Drop, Cover, and Hold On. Stay away from windows and heavy furniture.',
          imageUrl:
            'https://images.unsplash.com/photo-1590001158193-790411ef1f0c?q=80&w=1000',
        },
        {
          text: 'After the shaking stops, expect aftershocks. Check yourself for injuries before moving.',
          imageUrl:
            'https://images.unsplash.com/photo-1457530378978-8bac673b8062?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: earthquakeModule._id,
      questions: [
        {
          questionText: 'What is the golden rule during an earthquake?',
          choices: [
            { id: 1, text: 'Run outside immediately' },
            { id: 2, text: 'Duck, Cover, and Hold' },
            { id: 3, text: 'Stand in a doorway' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'If you are outside during an earthquake, where should you go?',
          choices: [
            { id: 1, text: 'Inside the nearest building' },
            { id: 2, text: 'Under a tree' },
            { id: 3, text: 'An open area away from buildings and power lines' },
          ],
          correctAnswer: 3,
        },
      ],
    });

    // --- Module 3: Typhoon & Flood Safety ---
    const typhoonModule = await ModuleModel.create({
      title: 'Typhoon & Flood Survival (PAGASA)',
      description:
        'Understanding Signal numbers, storm surges, and evacuation protocols.',
      logo: '🌀',
      content: [
        {
          text: 'Monitor PAGASA updates. Signal No. 3 means winds of 89-117 kph are expected within 18 hours.',
          imageUrl:
            'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?q=80&w=1000',
        },
        {
          text: 'Avoid wading in floodwaters to prevent Leptospirosis and electrocution.',
          imageUrl:
            'https://images.unsplash.com/photo-1548685913-fe6678b0d1e2?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: typhoonModule._id,
      questions: [
        {
          questionText:
            'What should you do if your area is under Signal No. 4?',
          choices: [
            { id: 1, text: 'Go surfing' },
            { id: 2, text: 'Evacuate to a safe designated center immediately' },
            { id: 3, text: 'Reinforce windows with tape' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'Which disease is commonly contracted from wading in flood water?',
          choices: [
            { id: 1, text: 'Dengue' },
            { id: 2, text: 'Leptospirosis' },
            { id: 3, text: 'Malaria' },
          ],
          correctAnswer: 2,
        },
      ],
    });

    // --- Module 4: Basic First Aid ---
    const firstAidModule = await ModuleModel.create({
      title: 'Basic First Aid & Life Support',
      description:
        'Essential skills for treating wounds, burns, and CPR basics.',
      logo: '🩹',
      content: [
        {
          text: 'For minor burns, run cool (not ice cold) tap water over the burn for 10-20 minutes.',
          imageUrl:
            'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=1000',
        },
        {
          text: 'The universal sign for choking is clutching the throat with both hands.',
          imageUrl:
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: firstAidModule._id,
      questions: [
        {
          questionText:
            'What is the ratio of chest compressions to rescue breaths in CPR?',
          choices: [
            { id: 1, text: '15 compressions : 1 breath' },
            { id: 2, text: '30 compressions : 2 breaths' },
            { id: 3, text: '10 compressions : 5 breaths' },
          ],
          correctAnswer: 2,
        },
        {
          questionText: 'How do you stop severe bleeding?',
          choices: [
            { id: 1, text: 'Apply direct pressure with a clean cloth' },
            { id: 2, text: 'Wash it with soap immediately' },
            { id: 3, text: 'Put ice on it' },
          ],
          correctAnswer: 1,
        },
      ],
    });

    // --- Module 5: Volcanic Eruption ---
    const volcanoModule = await ModuleModel.create({
      title: 'Volcanic Eruption Safety',
      description: 'Preparing for ashfall and knowing the danger zones.',
      logo: '🌋',
      content: [
        {
          text: 'During ashfall, stay indoors and close all windows and doors. Wear an N95 mask if you must go out.',
          imageUrl:
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000',
        },
        {
          text: 'Volcanic ash is heavy and can collapse roofs. Clean it immediately after the ashfall stops.',
          imageUrl:
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: volcanoModule._id,
      questions: [
        {
          questionText:
            'What type of face mask is recommended for volcanic ash?',
          choices: [
            { id: 1, text: 'Cloth mask' },
            { id: 2, text: 'Surgical mask' },
            { id: 3, text: 'N95 mask' },
          ],
          correctAnswer: 3,
        },
        {
          questionText: 'Why should you avoid driving during heavy ashfall?',
          choices: [
            { id: 1, text: 'It is illegal' },
            {
              id: 2,
              text: 'Ash can clog engines and reduce visibility to zero',
            },
            { id: 3, text: 'The road gets too hot' },
          ],
          correctAnswer: 2,
        },
      ],
    });

    // --- Module 6: Emergency Comms ---
    const commsModule = await ModuleModel.create({
      title: 'Emergency Communication',
      description:
        'How to use radios, whistles, and keep contact during disasters.',
      logo: '📻',
      content: [
        {
          text: 'Whistle Code: 3 blasts means "I need help". 1 blast means "Where are you?".',
          imageUrl:
            'https://images.unsplash.com/photo-1595180017122-3866299d9d30?q=80&w=1000',
        },
        {
          text: 'Save your phone battery. Text, don’t call, as SMS uses less network bandwidth.',
          imageUrl:
            'https://images.unsplash.com/photo-1526040652367-ac003a0475fe?q=80&w=1000',
        },
      ],
    });

    await QuizModel.create({
      moduleId: commsModule._id,
      questions: [
        {
          questionText:
            'What is the international distress signal using a whistle?',
          choices: [
            { id: 1, text: '1 long blast' },
            { id: 2, text: '3 short blasts' },
            { id: 3, text: 'Continuous blowing' },
          ],
          correctAnswer: 2,
        },
        {
          questionText: 'Why is texting better than calling during a disaster?',
          choices: [
            { id: 1, text: 'It is cheaper' },
            {
              id: 2,
              text: 'It is more likely to go through on congested networks',
            },
            { id: 3, text: 'It takes less time to type' },
          ],
          correctAnswer: 2,
        },
      ],
    });

    console.log('✅ All Modules and Quizzes seeded');
    console.log('✅ All Modules and Quizzes seeded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
