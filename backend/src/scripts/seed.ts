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
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455855/20250320-.org-disaster-go-bag_-121_v2_D-curved_bzstjc.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455853/Go-bag-2023-Sarah-Stierch-1-scaled_yye9po.webp',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455851/bugoutbags-2048px-8374_lqodub.webp',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455849/Fire-Go-Bag-_sq5kmz.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455847/Kids-Go-Bag-2-min_zjnwjn.jpg',
  'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768455845/bug-out-bag-full-horizontal_cq3ifh.webp',
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
    logo: '🌀',
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
  {
    title: 'Basic First Aid & Wound Care',
    description:
      'Bite-sized life-saving skills for treating minor injuries and medical emergencies at home.',
    logo: '🩹',
    content: [
      {
        text: 'For minor cuts and abrasions, the priority is to stop the bleeding by applying firm, direct pressure with a clean cloth. Once the bleeding is controlled, wash the wound thoroughly with clean running water and mild soap to prevent infection. Avoid using hydrogen peroxide or alcohol directly on the open wound, as these can damage the tissue; instead, apply a thin layer of antibiotic ointment and cover it with a sterile bandage.',
        imageUrl:
          'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768456808/getty_rm_photo_of_applying_gauze_to_wound_dvyeix.webp',
        reference: 'Philippine Red Cross: First Aid Handbook',
        referenceUrl: 'https://redcross.org.ph/',
      },
      {
        text: 'When treating minor (first-degree) burns, immediately run cool—not cold—tap water over the affected area for at least 10 to 15 minutes to reduce heat and swelling. Do not apply butter, toothpaste, or ice, as these traditional "remedies" can actually worsen the burn or cause infection. If blisters form, do not pop them, as they serve as a natural barrier against bacteria; simply cover the area loosely with a clean, non-stick bandage.',
        imageUrl:
          'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768456882/images_sejlbb.jpg',
        reference: 'DOH Health Advisory: Burn Management',
        referenceUrl: 'https://doh.gov.ph/',
      },
      {
        text: 'In cases of fainting or heat exhaustion—common during the Philippine summer—move the person to a cool, shaded area and lie them flat on their back with their legs slightly elevated. Loosen any tight clothing and provide sips of water or an oral rehydration solution if they are conscious. If the person does not regain consciousness within a minute or shows signs of heat stroke (such as high body temperature and confusion), call 911 or local emergency services immediately.',
        imageUrl:
          'https://res.cloudinary.com/dm85mtqbe/image/upload/v1768456967/heat-stroke-first-aid_o8un9u.webp',
        reference: 'NDRRMC First Aid Protocols for Heat Emergencies',
        referenceUrl: 'https://ndrrmc.gov.ph/',
      },
    ],
    questions: [
      {
        q: 'What is the correct first step for treating a minor burn?',
        choices: [
          'Apply toothpaste to the area',
          'Run cool tap water over it for 10-15 minutes',
          'Put ice directly on the skin',
          'Pop any blisters that appear',
        ],
        a: 1,
      },
      {
        q: 'When cleaning a minor cut, what should you use to wash the wound?',
        choices: [
          'Alcohol directly on the open cut',
          'Hydrogen peroxide only',
          'Clean running water and mild soap',
          'Vinegar and salt',
        ],
        a: 2,
      },
      {
        q: 'What is the best position for a person who has fainted?',
        choices: [
          'Sitting upright in a chair',
          'Lying flat with legs slightly elevated',
          'Standing up to regain balance',
          'Lying face down',
        ],
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
