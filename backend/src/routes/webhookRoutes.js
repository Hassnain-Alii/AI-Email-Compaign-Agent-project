import express from 'express';
import { handleSendGridWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Public route for SendGrid webhooks
router.post('/sendgrid', handleSendGridWebhook);

export default router;
