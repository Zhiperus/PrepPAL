import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { GO_BAG_ITEMS } from '../lib/seedData.js';
import ContentReportModel from '../models/contentReport.model.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
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

// These objects match the User Schema's 'location' structure exactly
const PH_LOCATIONS = [
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Quezon City',
    cityCode: '137404',
    barangay: 'Batasan Hills',
    barangayCode: '137404012',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Quezon City',
    cityCode: '137404',
    barangay: 'Diliman',
    barangayCode: '137404118',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Manila',
    cityCode: '133900',
    barangay: 'Tondo',
    barangayCode: '133901000',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Makati',
    cityCode: '137600',
    barangay: 'Poblacion',
    barangayCode: '137602012',
  },
  {
    region: 'NCR',
    province: 'Metro Manila',
    city: 'Taguig',
    cityCode: '137607',
    barangay: 'Fort Bonifacio',
    barangayCode: '137607005',
  },
  {
    region: 'IV-A',
    province: 'Laguna',
    city: 'Santa Rosa',
    cityCode: '043428',
    barangay: 'Balibago',
    barangayCode: '043428002',
  },
  {
    region: 'VII',
    province: 'Cebu',
    city: 'Cebu City',
    cityCode: '072217',
    barangay: 'Lahug',
    barangayCode: '072217042',
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
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455855/20250320-.org-disaster-go-bag_-121_v2_D-curved_bzstjc.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455853/Go-bag-2023-Sarah-Stierch-1-scaled_yye9po.webp',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455851/bugoutbags-2048px-8374_lqodub.webp',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455849/Fire-Go-Bag-_sq5kmz.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455847/Kids-Go-Bag-2-min_zjnwjn.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455845/bug-out-bag-full-horizontal_cq3ifh.webp',
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

    const hashedPassword = await bcrypt.hash('password', 10);

    // 3. CREATE USERS

    // 3a. LGU ADMINS (Generated directly from PH_LOCATIONS)
    const lguAdmins = PH_LOCATIONS.map((loc) => {
      const rawSlug = `Brgy. ${loc.barangay}`;
      const emailSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        email: `admin.${emailSlug}@prep.gov.ph`,
        password: hashedPassword,
        role: 'lgu',
        location: loc,
        householdName: `${rawSlug} Admin`,
        isEmailVerified: true,
        onboardingCompleted: true,
      };
    });

    // 3b. CITIZENS
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        location: PH_LOCATIONS.find((l) => l.barangay === 'Batasan Hills'),
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
        // [Corrected] No root barangayCode
        location: PH_LOCATIONS.find((l) => l.barangay === 'Fort Bonifacio'),
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
      location: null, // Super Admins don't have a specific location
      householdName: 'National HQ',
      isEmailVerified: true,
      onboardingCompleted: true,
    };

    // 3c. RANDOM CITIZENS
    const randomUsersData = Array.from({ length: 60 }).map((_, i) => {
      const location = getRandomItem(PH_LOCATIONS);

      return {
        email: `resident${i + 1}@example.com`,
        password: hashedPassword,
        householdName: `Resident ${i + 1}`,
        phoneNumber: `0917${getRandomInt(1000000, 9999999)}`,
        role: 'citizen',
        // [Corrected] No root barangayCode. Passed entire location object
        location: location,
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

    // 4. CREATE GO BAGS
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

    // 5. CREATE POSTS (Increased volume for analytics)
    const postsData = [];

    const eligibleAuthors = createdCitizens.filter(
      (u) => u.location && u.location.barangayCode,
    );

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
          barangayCode: author.location!.barangayCode,
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

    // 6. SEED MODULES & QUIZZES
    console.log('📚 Seeding Educational Modules...');

    const modulesData = [
      {
        title: 'Fire Safety & Prevention (BFP Philippines)',
        description:
          'A focused guide on the EDITH program, electrical hazards, and the P.A.S.S. method.',
        logo: '🔥',
        content: [
          {
            text: 'The BFP promotes the EDITH (Exit Drills In The Home) program to ensure every family member knows how to escape safely. You should identify at least two ways out of every room and designate a specific meeting place outside, like a neighbor’s gate. Practice these drills at night or in the dark to simulate real fire conditions, and remember that once you are out, you must never re-enter the building.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455247/people-crossing-road-during-fire-drill-evacuation-cartwright-gardens-bloomsbury-london-england-britain-uk-R7KCGK_qai33b.jpg',
            reference: 'BFP Fire Safety Guide: EDITH Program',
            referenceUrl: 'https://bfp.gov.ph/',
          },
          {
            text: 'Electrical issues, specifically "octopus wiring," remain a leading cause of fires in Filipino households. This happens when too many high-wattage appliances are plugged into a single outlet or extension cord, leading to overheating. Homeowners should regularly check for frayed wires and ensure they unplug appliances like electric fans and irons when not in use, particularly during the peak heat of the summer months.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455278/Octopus-300x200_vdcn3h.jpg',
            reference: 'RA 9514: The Fire Code of the Philippines',
            referenceUrl: 'https://bfp.gov.ph/resources/ra-9514/',
          },
          {
            text: 'To effectively extinguish a small fire, use the P.A.S.S. technique: Pull the pin, Aim the nozzle at the base of the fire, Squeeze the lever, and Sweep side-to-side. Always aim at the fuel source rather than the flames themselves to ensure the fire is fully put out. If the fire is spreading quickly or blocking your exit, abandon the extinguisher and evacuate immediately to prioritize your life.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455626/download_eb413abb-0d91-4f70-8cb2-0e382ea558b5_lmfczo.webp',
            reference: 'BFP National Fire Prevention Month Training',
            referenceUrl: 'https://bfp.gov.ph/fire-prevention-month/',
          },
        ],
        questions: [
          {
            q: 'When practicing the EDITH plan, what is the most important rule after escaping a burning building?',
            choices: [
              'Go back inside for your Go Bag',
              'Stay out and go to your designated meeting place',
              'Wait by the front door for the BFP',
              'Call your neighbors from inside the house',
            ],
            a: 1,
          },
          {
            q: 'What is the primary danger of "octopus wiring" in Filipino households?',
            choices: [
              'It increases your monthly electric bill',
              'It causes the lights to flicker only',
              'It leads to overheating and potential electrical fires',
              'It attracts lightning strikes',
            ],
            a: 2,
          },
          {
            q: 'During the P.A.S.S. method, where should you aim the fire extinguisher nozzle?',
            choices: [
              'At the very top of the flames',
              'At the person nearest to the fire',
              'At the smoke clouds',
              'At the base of the fire',
            ],
            a: 3,
          },
        ],
      },
      {
        title: 'Typhoon & Flood Readiness',
        description:
          'Essential protocols for navigating PAGASA wind signals and rising floodwaters.',
        logo: '⛈️',
        content: [
          {
            text: 'PAGASA issues Tropical Cyclone Wind Signals (TCWS) ranging from Signal 1 to Signal 5 to warn of incoming storm strength. It is equally important to monitor color-coded rainfall alerts; a "Red Warning" signals serious flooding is imminent and evacuation should be immediate. Even if wind signals are low, heavy rain can still trigger dangerous flash floods and landslides in vulnerable areas.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455392/577453265_1244659617697905_3058442703744152072_n_gmegt7.jpg',
            reference: 'PAGASA Revised Tropical Cyclone Wind Signal System',
            referenceUrl: 'https://www.pagasa.dost.gov.ph/',
          },
          {
            text: 'Flood safety begins with staying informed via battery-operated radios since power and mobile networks often fail during storms. If water begins to enter your home, the first priority is to turn off the main electrical switch to prevent accidental electrocution. Identify the highest point in your area or your local community evacuation center well before the water starts to rise.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455495/4_po8hen.webp',
            reference: 'NDRRMC Typhoon Safety Protocols',
            referenceUrl: 'https://ndrrmc.gov.ph/',
          },
        ],
        questions: [
          {
            q: 'What should you do immediately if floodwater begins to enter your home?',
            choices: [
              'Open all windows',
              'Turn off the main electrical switch',
              'Wait for the rain to stop',
              'Use a vacuum to remove the water',
            ],
            a: 1,
          },
          {
            q: 'Which government agency provides the official Tropical Cyclone Wind Signals in the Philippines?',
            choices: ['PHIVOLCS', 'DENR', 'PAGASA', 'DepEd'],
            a: 2,
          },
        ],
      },
      {
        title: 'Earthquake Preparedness (PHIVOLCS)',
        description:
          'Mastering the Drop, Cover, and Hold On technique and recognizing tsunami warning signs.',
        logo: '🌍',
        content: [
          {
            text: 'The Philippines is highly susceptible to earthquakes, making the "Drop, Cover, and Hold On" technique a vital survival skill. When shaking starts, drop to your knees, take cover under a sturdy table, and hold on until the movement stops. This position protects your head and neck from falling debris, which is the most common cause of injury during a quake.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/Drop_Cover_Hold_On_Cane_ENG_Blue_Orange_RGB_jiwzp4.png',
            reference: 'PHIVOLCS Earthquake Preparedness Guide',
            referenceUrl: 'https://www.phivolcs.dost.gov.ph/',
          },
          {
            text: 'After an earthquake, always use the stairs to evacuate and never the elevator, as power cuts can trap you between floors. If you are near the coastline, watch for natural tsunami signs such as the sea receding rapidly or a loud roaring sound from the ocean. If you notice these signs, move to higher ground immediately without waiting for an official siren.',
            imageUrl:
              'https://res.cloudinary.com/dm85mtqbe/image/upload/earthquake-people-and-evacuation-route-vector-49752543_ahmaed.avif',
            reference: 'Official PHIVOLCS Tsunami Warning Signs',
            referenceUrl: 'https://www.phivolcs.dost.gov.ph/',
          },
        ],
        questions: [
          {
            q: 'During an earthquake, what is the safest way to protect yourself if you are indoors?',
            choices: [
              'Run outside fast',
              'Drop, Cover, and Hold On under a table',
              'Stand near a window',
              'Take the elevator',
            ],
            a: 1,
          },
          {
            q: 'What should you do if you are near the coast and notice the sea receding after an earthquake?',
            choices: [
              'Pick up fish',
              'Take photos',
              'Immediately move to higher ground',
              'Stay and wait for a broadcast',
            ],
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

    // 7. CREATE CONTENT REPORTS
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
    const REPORT_STATUSES = ['PENDING', 'PENDING', 'RESOLVED', 'DISMISSED'];

    const reportsData = [];

    for (let i = 0; i < 50; i++) {
      const reportedPost = getRandomItem(allPosts);
      const possibleReporters = createdCitizens.filter(
        (u) => u._id.toString() !== reportedPost.userId.toString(),
      );

      if (possibleReporters.length > 0) {
        const reporter = getRandomItem(possibleReporters);
        reportsData.push({
          postId: reportedPost._id,
          reporterId: reporter._id,
          barangayCode: reportedPost.barangayCode,
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

    // 8. SEED QUESTION REPORTS
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

    for (let i = 0; i < 30; i++) {
      const targetQuiz = getRandomItem(allQuizzes);
      const targetQuestion = getRandomItem(targetQuiz.questions);
      const reporter = getRandomItem(createdCitizens);

      questionReportsData.push({
        quizId: targetQuiz._id,
        questionId: targetQuestion._id,
        reporterId: reporter._id,
        reason: getRandomItem(QUESTION_REPORT_REASONS),
        status: getRandomItem(['PENDING', 'PENDING', 'RESOLVED']),
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
