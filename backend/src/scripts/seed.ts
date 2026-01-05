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

    // 3. CREATE USERS AND LGUS
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

    // 3a. Specific Users (For Login)
    const mainUsers = [
      {
        email: 'iorie@example.com',
        password: hashedPassword,
        householdName: 'Chua Household',
        role: 'citizen',
        lguId: manilaId,
        points: { goBag: 50, community: 10, modules: 5 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iorie',
      },
      {
        email: 'kyle@example.com',
        password: hashedPassword,
        householdName: 'The Dev Cave',
        role: 'citizen',
        lguId: manilaId,
        points: { goBag: 80, community: 150, modules: 20 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle',
      },
      {
        email: 'jarence@example.com',
        password: hashedPassword,
        householdName: 'Design Studio',
        role: 'citizen',
        lguId: qcId,
        points: { goBag: 30, community: 5, modules: 0 },
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarence',
      },
    ];

    // 3b. Admins and Super Admins
    const adminUsers = [
      {
        email: 'super@test.com',
        password: hashedPassword,
        role: 'super_admin',
        lguId: null, // Sees everything
        householdName: 'Global HQ',
      },
      {
        email: 'admin.manila@test.com',
        password: hashedPassword,
        role: 'admin',
        lguId: manilaId, // Only sees Manila data
        householdName: 'Manila City Hall',
      },
      {
        email: 'admin.qc@test.com',
        password: hashedPassword,
        role: 'admin',
        lguId: qcId, // Only sees QC data
        householdName: 'QC City Hall',
      },
    ];

    // 3c. Generate Random Users
    const randomUsersData = Array.from({ length: 20 }).map((_, i) => ({
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
      householdName: `Resident ${i + 1}`,
      phoneNumber: `0917${getRandomInt(1000000, 9999999)}`,
      role: 'citizen',
      lguId: i % 2 === 0 ? manilaId : qcId,
      onboardingCompleted: true,
      points: {
        goBag: getRandomInt(10, 100),
        community: getRandomInt(0, 50),
        modules: getRandomInt(0, 10),
      },
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${
        i + 1
      }`,
    }));

    // Insert All Users
    const allUsers = await UserModel.create([
      ...mainUsers,
      ...adminUsers,
      ...randomUsersData,
    ]);
    console.log(`✅ Created ${allUsers.length} users`);

    // 4. CREATE GO BAGS FOR ALL USERS
    const goBagDocs = allUsers.map((user) => {
      // Randomly decide which items this user has "packed" (between 5 and all items)
      const packedCount = getRandomInt(5, createdItems.length);
      const packedItems = getRandomSubset(createdItems, packedCount);

      return {
        userId: user._id,
        imageUrl: getRandomItem(IMAGES),
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
        lguId: author.lguId,
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

    // 6. SEED MODULES AND QUIZZES (Replace logo string with the correct react-icons keys)
    // 6A. Fire Safety Module and Quiz
    const fireSafetyModule = await ModuleModel.create({
      title: 'Fire Safety & Prevention (BFP Philippines)',
      description:
        'A comprehensive guide on preventing household fires, understanding electrical hazards, and mastering emergency response protocols.',
      logo: '🔥',
      content: [
        {
          text: 'In the Philippines, the Bureau of Fire Protection (BFP) promotes the EDITH (Exit Drills In The Home) program to save lives. A proper fire escape plan requires every family member to know at least two ways out of every room. Since fires often occur at night, it is crucial to practice these drills in the dark. Families should also designate a "meeting place" outside—like a specific tree or neighbor’s gate—where everyone can be accounted for. Remember, once you get out, stay out; never re-enter a burning building for belongings.',
          imageUrl:
            'https://images.unsplash.com/photo-1599700403969-fcf019771e8c?q=80&w=1000',
          reference: 'BFP Fire Safety Guide: EDITH Program',
          referenceUrl: 'https://bfp.gov.ph/',
        },
        {
          text: 'Electrical issues remain the leading cause of residential fires in Filipino households, often categorized as "octopus wiring." This occurs when too many high-wattage appliances are plugged into a single outlet or extension cord, leading to overheating and sparks. The BFP and Meralco advise checking for frayed wires, avoiding the use of damaged plugs, and ensuring that circuit breakers are not frequently tripping. Always unplug appliances like electric fans and irons when not in use, especially during the summer months when heat levels are at their peak.',
          imageUrl:
            'https://images.unsplash.com/photo-1580983218765-f663bec07b37?q=80&w=1000',
          reference: 'RA 9514: The Fire Code of the Philippines',
        },
        {
          text: 'Effective fire suppression starts with the correct use of a Portable Fire Extinguisher using the P.A.S.S. technique. First, Pull the pin to break the tamper seal. Second, Aim low, pointing the nozzle at the base of the fire—not the flames—to extinguish the fuel source. Third, Squeeze the lever slowly to release the extinguishing agent. Finally, Sweep the nozzle from side to side until the fire appears out. If the fire is too large or spreading toward your exit, abandon the extinguisher and evacuate immediately to prioritize your safety.',
          imageUrl:
            'https://images.unsplash.com/photo-1606202427441-268e0d4e330a?q=80&w=1000',
          reference: 'BFP National Fire Prevention Month Training',
          referenceUrl: 'https://bfp.gov.ph/fire-prevention-month/',
        },
      ],
    });
    await QuizModel.create({
      moduleId: fireSafetyModule._id,
      questions: [
        {
          questionText:
            'When practicing the EDITH plan, what is the most important rule after escaping a burning building?',
          choices: [
            { id: 1, text: 'Go back inside for your Go Bag' },
            {
              id: 2,
              text: 'Stay out and go to your designated meeting place',
            },
            { id: 3, text: 'Wait by the front door for the BFP' },
            { id: 4, text: 'Call your neighbors from inside the house' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'What is the primary danger of "octopus wiring" in Filipino households?',
          choices: [
            { id: 1, text: 'It increases your monthly electric bill' },
            { id: 2, text: 'It causes the lights to flicker only' },
            {
              id: 3,
              text: 'It leads to overheating and potential electrical fires',
            },
            { id: 4, text: 'It attracts lightning strikes' },
          ],
          correctAnswer: 3,
        },
        {
          questionText:
            'During the P.A.S.S. method, where should you aim the fire extinguisher nozzle?',
          choices: [
            { id: 1, text: 'At the very top of the flames' },
            { id: 2, text: 'At the person nearest to the fire' },
            { id: 3, text: 'At the smoke clouds' },
            { id: 4, text: 'At the base of the fire' },
          ],
          correctAnswer: 4,
        },
      ],
    });

    // 6B. Typhoon Safety Module and Quiz
    const typhoonModule = await ModuleModel.create({
      title: 'Typhoon & Flood Readiness',
      description:
        'Understanding PAGASA wind signals and essential safety protocols for the Philippine typhoon season.',
      logo: 'FaWind',
      content: [
        {
          text: 'In the Philippines, PAGASA issues Tropical Cyclone Wind Signals (TCWS) to warn the public of incoming threats. Signal No. 1 means winds are expected within 36 hours, while Signal No. 5 indicates a super typhoon with extreme danger. It is vital to understand that these signals refer to wind speed, but heavy rain and flooding can occur even at lower signal levels. Always monitor the "Red Warning" rainfall alerts, which signal a high risk of serious flooding and the immediate need for evacuation in low-lying areas.',
          imageUrl:
            'https://images.unsplash.com/photo-1545048702-793eec75f20c?q=80&w=1000',
          reference: 'PAGASA Revised Tropical Cyclone Wind Signal System',
          referenceUrl: 'https://www.pagasa.dost.gov.ph/',
        },
        {
          text: 'Flood safety begins with elevation and communication. If you live in a flood-prone area, identify the highest point in your home or the nearest community evacuation center before the water starts to rise. Keep a battery-operated radio tuned to local news, as mobile networks may fail during a storm. Ensure your Go Bag is placed in an easy-to-reach, elevated spot. If water enters your home, turn off the main electricity switch immediately to prevent accidental electrocution, which is a leading cause of death during Philippine floods.',
          imageUrl:
            'https://images.unsplash.com/photo-1511055392925-d93540e163b0?q=80&w=1000',
          reference: 'NDRRMC Typhoon Safety Protocols',
        },
      ],
    });
    await QuizModel.create({
      moduleId: typhoonModule._id,
      questions: [
        {
          questionText:
            'What should you do immediately if floodwater begins to enter your home?',
          choices: [
            { id: 1, text: 'Open all windows to let water flow' },
            { id: 2, text: 'Turn off the main electrical switch' },
            { id: 3, text: 'Wait for the rain to stop before moving' },
            { id: 4, text: 'Use a vacuum to remove the water' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'Which government agency provides the official Tropical Cyclone Wind Signals in the Philippines?',
          choices: [
            { id: 1, text: 'PHIVOLCS' },
            { id: 2, text: 'DENR' },
            { id: 3, text: 'PAGASA' },
            { id: 4, text: 'DepEd' },
          ],
          correctAnswer: 3,
        },
      ],
    });

    // 6C. Earthquake Safety Module and Quiz
    const earthquakeModule = await ModuleModel.create({
      title: 'Earthquake Preparedness (PHIVOLCS)',
      description:
        'Mastering the Drop, Cover, and Hold On technique and preparing your household for seismic activity.',
      logo: 'FaHouseDamage',
      content: [
        {
          text: 'The Philippines is located along the Pacific Ring of Fire, making it highly susceptible to earthquakes. PHIVOLCS emphasizes the "Drop, Cover, and Hold On" method as the most effective survival tactic during shaking. Drop to your hands and knees to prevent being knocked over. Cover your head and neck under a sturdy table or desk. Hold On to your shelter until the shaking stops. If no shelter is available, move away from windows, heavy furniture, and hanging objects that could fall and cause injury.',
          imageUrl:
            'https://images.unsplash.com/photo-1590001158193-790411ef1f0c?q=80&w=1000',
          reference: 'PHIVOLCS Earthquake Preparedness Guide',
          referenceUrl: 'https://www.phivolcs.dost.gov.ph/',
        },
        {
          text: 'After the shaking stops, the danger is not over. Be prepared for aftershocks, which can further damage weakened structures. Evacuate the building using stairs—never use elevators, as power cuts may trap you inside. Check yourself and others for injuries, but do not move seriously injured people unless they are in immediate danger. If you are near the coastline and notice the sea receding or hear a loud "roaring" sound from the ocean, move to higher ground immediately, as these are signs of an impending tsunami.',
          imageUrl:
            'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1000',
          reference: 'Official PHIVOLCS Tsunami Warning Signs',
        },
      ],
    });
    await QuizModel.create({
      moduleId: earthquakeModule._id,
      questions: [
        {
          questionText:
            'During an earthquake, what is the safest way to protect yourself if you are indoors?',
          choices: [
            { id: 1, text: 'Run outside as fast as possible' },
            { id: 2, text: 'Drop, Cover, and Hold On under a sturdy table' },
            { id: 3, text: 'Stand near a window to see what is happening' },
            { id: 4, text: 'Take the elevator to the ground floor' },
          ],
          correctAnswer: 2,
        },
        {
          questionText:
            'What should you do if you are near the coast and notice the sea receding after an earthquake?',
          choices: [
            { id: 1, text: 'Go to the shore to pick up fish' },
            { id: 2, text: 'Take photos of the phenomenon' },
            { id: 3, text: 'Immediately move to higher ground' },
            { id: 4, text: 'Stay where you are and wait for a broadcast' },
          ],
          correctAnswer: 3,
        },
      ],
    });

    console.log('✅ All Modules and Quizzes seeded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
