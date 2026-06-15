import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailWorker } from './src/services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, './.env') });

const startWorker = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Worker connected to MongoDB');
    
    emailWorker.on('completed', (job) => {
      console.log(`Job ${job.id} COMPLETED`);
    });

    emailWorker.on('failed', (job, err) => {
      console.error(`Job ${job.id} FAILED:`, err.message);
    });

    console.log('Worker is running and waiting for jobs...');
  } catch (err) {
    console.error('Worker startup failed:', err);
  }
};

startWorker();
