import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import mongoose from 'mongoose';

import errorHandler from './middleware/errorHandler';
import routes from './routes/index';

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('DATABASE_URL is not set');
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
