import dotenv from 'dotenv';
import mongoose from 'mongoose';

import UserRepository from '../repositories/user.repository.js';
import UserService from '../services/user.service.js';

dotenv.config();

async function testTopLeaderboardEndpoint() {
  try {
    const mongoUri =
      process.env.DATABASE_URL || 'mongodb://localhost:27017/preppal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const userService = new UserService();

    // Test with limit 5
    console.log('📊 Testing getTopLeaderboard(5):');
    console.log('-----------------------------------');
    const result = await userService.getTopLeaderboard(5);

    console.log(`Total Users in DB: ${result.totalUsers}`);
    console.log(`Users Returned: ${result.users.length}\n`);

    result.users.forEach(
      (user: {
        rank: number;
        householdName: string;
        id: string;
        totalPoints: number;
        points: { goBag: number; community: number; modules: number };
        location: { city: string; province: string };
      }) => {
        console.log(`${user.rank}. ${user.householdName} (${user.id})`);
        console.log(
          `   Total Points: ${user.totalPoints} (Go Bag: ${user.points.goBag}, Community: ${user.points.community}, Modules: ${user.points.modules})`,
        );
        console.log(
          `   Location: ${user.location.city}, ${user.location.province}`,
        );
        console.log('');
      },
    );

    console.log('-----------------------------------');
    console.log('✅ Endpoint test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testTopLeaderboardEndpoint();
