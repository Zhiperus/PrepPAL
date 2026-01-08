import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import mongoose from 'mongoose';

import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  .then(async () => {
    console.log('✅ MongoDB connected');
    // // initialize goBagItems
    // const goBagItemService = new GoBagItemService();
    // await goBagItemService.initializeDefaultItems();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
