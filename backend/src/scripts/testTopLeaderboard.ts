import dotenv from 'dotenv';
import mongoose from 'mongoose';

import UserModel from '../models/user.model.js';

dotenv.config();

async function generateDummyUsers() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.DATABASE_URL || 'mongodb://localhost:27017/preppal';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await UserModel.deleteMany({});

    const dummyUsers = Array.from({ length: 75 }, (_, i) => ({
      email: `user${i + 1}@example.com`,
      password: 'hashedPassword123', // In real scenario, this would be hashed
      householdName: `Household ${i + 1}`,
      phoneNumber: `+63${String(i + 1).padStart(10, '0')}`,
      location: {
        region: ['NCR', 'Region 4A', 'Region 3'][i % 3],
        province: ['Metro Manila', 'Cavite', 'Laguna'][i % 3],
        city: [`City ${(i % 5) + 1}`][0],
        barangay: [`Barangay ${(i % 10) + 1}`][0],
      },
      householdInfo: {
        memberCount: Math.floor(Math.random() * 8) + 1,
        femaleCount: Math.floor(Math.random() * 4),
        dogCount: Math.floor(Math.random() * 3),
        catCount: Math.floor(Math.random() * 3),
      },
      role: i % 10 === 0 ? 'lgu' : 'citizen',
      onboardingCompleted: true,
      notification: {
        email: true,
        sms: false,
      },
      points: {
        goBag: Math.floor(Math.random() * 500) + 50,
        community: Math.floor(Math.random() * 400) + 30,
        modules: Math.floor(Math.random() * 300) + 20,
      },
      profileImage: `https://api.example.com/avatars/user${i + 1}.jpg`,
      profileImageId: `avatar_${i + 1}`,
      isEmailVerified: true,
      verificationToken: '',
      verificationTokenExpires: new Date(),
      resetPasswordToken: '',
      resetPasswordExpires: new Date(),
    }));

    // Insert dummy users
    const insertedUsers = await UserModel.insertMany(dummyUsers);
    console.log(`✅ Successfully created ${insertedUsers.length} dummy users`);

    // Test the aggregation pipeline
    console.log('\n📊 Testing Top 10 Leaderboard:');
    const leaderboard = await UserModel.aggregate([
      {
        $addFields: {
          totalPoints: {
            $add: [
              { $ifNull: ['$points.goBag', 0] },
              { $ifNull: ['$points.community', 0] },
              { $ifNull: ['$points.modules', 0] },
            ],
          },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          id: '$_id',
          householdName: 1,
          location: 1,
          points: 1,
          totalPoints: 1,
          profileImage: 1,
        },
      },
    ]);

    leaderboard.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.householdName} - ${
          user.totalPoints
        } points (Go Bag: ${user.points.goBag}, Community: ${
          user.points.community
        }, Modules: ${user.points.modules})`,
      );
    });

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

generateDummyUsers();
