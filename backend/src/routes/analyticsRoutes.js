import express from 'express';
import {
  getDashboardAnalytics,
  getCampaignAnalytics,
  getEmailLogs
} from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/campaign/:id', protect, getCampaignAnalytics);
router.get('/logs', protect, getEmailLogs);

export default router;
