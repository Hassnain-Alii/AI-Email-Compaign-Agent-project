import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';

import connectDB from './config/db.js';
import './config/passport.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import recipientRoutes from './routes/recipientRoutes.js';
import listRoutes from './routes/listRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

dotenv.config();

connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 200, 
});
app.use('/api', limiter);
app.get('/', (req, res) => res.send('AI Email Campaign Agent API is running...'));

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
