import { Queue, Worker } from 'bullmq';
import sgMail from '@sendgrid/mail';
import Redis from 'ioredis';
import EmailLog from '../models/EmailLog.js';
import Recipient from '../models/Recipient.js';
import Campaign from '../models/Campaign.js';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const redisConnection = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    });

export const emailQueue = new Queue('email-sending', {
  connection: redisConnection,
});

const sendEmailJob = async (job) => {
  const { recipientId, campaignId, email, subject, content, isHtml, fromEmail } = job.data;
  const isDirect = recipientId?.toString().startsWith('direct-');

  try {
    const msg = {
      to: email,
      from: fromEmail || process.env.FROM_EMAIL || 'sender@example.com',
      subject: subject,
      text: content.replace(/<[^>]*>?/gm, ''),
      html: isHtml ? content : undefined,
      customArgs: {
        campaignId: campaignId.toString(),
        recipientId: recipientId.toString(),
      },
    };

    if (process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.includes('your_')) {
      const [response] = await sgMail.send(msg);
      
      await EmailLog.create({
        recipientId: isDirect ? undefined : recipientId,
        directEmail: isDirect ? email : undefined,
        campaignId,
        status: 'sent',
        sentAt: new Date(),
        responseCode: response.statusCode
      });
    } else {
      // Mock sending for development
      console.log(`[MOCK] To: ${email} | Sub: ${subject}`);
      await EmailLog.create({ 
        status: 'sent', 
        recipientId: isDirect ? undefined : recipientId,
        campaignId, 
        sentAt: new Date(), 
        responseCode: 200, 
        isMock: true 
      });
    }
  } catch (error) {
    const responseCode = error.response?.statusCode || error.code;
    
    await EmailLog.create({
      recipientId: isDirect ? undefined : recipientId,
      directEmail: isDirect ? email : undefined,
      campaignId,
      status: 'failed',
      error: error.message,
      responseCode: responseCode
    });
    throw error;
  }
};

export const emailWorker = new Worker('email-sending', sendEmailJob, {
  connection: redisConnection,
  limiter: { max: 10, duration: 1000 },
});

emailWorker.on('completed', (job) => console.log(`Job ${job.id} done.`));
emailWorker.on('failed', (job, err) => console.error(`Job ${job.id} failed: ${err.message}`));
