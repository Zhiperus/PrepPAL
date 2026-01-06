import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';
import UserService from '../services/user.service.js';

dotenv.config();

async function run() {
  try {
    const mongoUri =
      process.env.DATABASE_URL || 'mongodb://localhost:27017/preppal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Try to find a dummy user
    let user = await UserModel.findOne({ email: 'user1@example.com' }).lean();
    if (!user) {
      user = await UserModel.findOne().lean();
    }

    if (!user) {
      console.error(
        'No users found in DB. Run the seed/testTopLeaderboard script first.',
      );
      process.exit(1);
    }

    const userId = (user as any)._id.toString();
    console.log(`Using user: ${(user as any).email} (${userId})\n`);

    const userService = new UserService();
    const stats = await userService.getUserStats(userId);

    console.log('User stats:');
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
