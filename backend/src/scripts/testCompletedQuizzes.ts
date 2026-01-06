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

    // pick a user
    let user = await UserModel.findOne({ email: 'user1@example.com' }).lean();
    if (!user) user = await UserModel.findOne().lean();
    if (!user) {
      console.error('No users in DB');
      process.exit(1);
    }

    const userId = (user as any)._id.toString();
    const service = new UserService();

    console.log('\n📘 Checking quizzes with default minScore(70):');
    const passed = await service.getUserCompletedQuizzes(userId);
    console.log(JSON.stringify(passed, null, 2));

    console.log('\n📘 Checking quizzes with minScore(0) (attempted):');
    const attempted = await service.getUserCompletedQuizzes(userId, 0);
    console.log(JSON.stringify(attempted.slice(0, 10), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
