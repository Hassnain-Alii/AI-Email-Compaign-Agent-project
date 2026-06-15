import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  generateEmail,
  sendCampaign,
  getVerifiedSenders,
} from '../controllers/campaignController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createCampaign).get(protect, getCampaigns);
router
  .route('/:id')
  .get(protect, getCampaignById)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

router.get('/senders/verified', protect, getVerifiedSenders);
router.post('/:id/duplicate', protect, duplicateCampaign);
router.post('/:id/generate', protect, generateEmail);
router.post('/:id/send', protect, sendCampaign);

export default router;
