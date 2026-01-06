import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';
import Module from '../models/module.model.js';
import Quiz from '../models/quiz.model.js';
import QuizAttempt from '../models/quizAttempt.model.js';

dotenv.config();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  try {
    const mongoUri =
      process.env.DATABASE_URL || 'mongodb://localhost:27017/preppal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find users to seed attempts for
    const users = await UserModel.find().limit(20).lean();
    if (!users || users.length === 0) {
      console.error('No users found. Run user seeding first.');
      process.exit(1);
    }

    // Create modules
    const modulesData = Array.from({ length: 6 }, (_, i) => ({
      title: `Module ${i + 1}`,
      description: `Auto-seeded module ${i + 1}`,
      contentUrl: `https://example.com/module/${i + 1}`,
      createdAt: new Date(),
    }));

    const createdModules = await Module.insertMany(modulesData);
    console.log(`Created ${createdModules.length} modules`);

    // Create quizzes (one per module) with 5 questions each
    const quizzesData = createdModules.map((m, idx) => {
      const questions = Array.from({ length: 5 }, (__, qIdx) => {
        const correct = `A${qIdx + 1}`;
        return {
          questionText: `Q${qIdx + 1} for module ${idx + 1}`,
          choices: ['A1', 'A2', 'A3', 'A4'],
          correctAnswer: correct,
        };
      });

      return {
        moduleId: m._id,
        questions,
      };
    });

    const createdQuizzes = await Quiz.insertMany(quizzesData as any);
    console.log(`Created ${createdQuizzes.length} quizzes`);

    // For a subset of users, create randomized attempts across quizzes
    const usersToSeed = users.slice(0, 12);
    const allAttempts: any[] = [];

    for (const user of usersToSeed) {
      // choose 2-5 quizzes for this user
      const quizCount = randInt(2, Math.min(5, createdQuizzes.length));
      const chosen = [...createdQuizzes]
        .sort(() => 0.5 - Math.random())
        .slice(0, quizCount);

      for (const quiz of chosen) {
        // create 1-3 attempts per quiz
        const attemptCount = randInt(1, 3);
        for (let a = 0; a < attemptCount; a++) {
          // create answers where some are correct depending on randomness
          const answers = (quiz.questions || []).map((q: any, qi: number) => {
            // probability of correct increases with attempt index (simulate improvement)
            const pCorrect = Math.min(
              0.4 + 0.3 * a + Math.random() * 0.3,
              0.95,
            );
            const chooseCorrect = Math.random() < pCorrect;
            return {
              answer: chooseCorrect
                ? q.correctAnswer
                : q.choices[randInt(0, q.choices.length - 1)],
              correctAnswer: q.correctAnswer,
            };
          });

          allAttempts.push({
            quizId: quiz._id,
            userId: user._id,
            answers,
          });
        }
      }
    }

    if (allAttempts.length > 0) {
      const inserted = await QuizAttempt.insertMany(allAttempts as any);
      console.log(`Inserted ${inserted.length} quiz attempts`);
    } else {
      console.log('No attempts to insert');
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Error seeding quizzes/attempts:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
