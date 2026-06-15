import express from 'express';
import {
  getRecipients,
  addRecipient,
  updateRecipient,
  removeRecipient,
  bulkDeleteRecipients,
  exportRecipientsCSV,
  uploadRecipientsCSV,
  uploadMiddleware,
} from '../controllers/recipientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getRecipients).post(protect, addRecipient);
router.post('/bulk-delete', protect, bulkDeleteRecipients);
router.get('/export', protect, exportRecipientsCSV);
router.post('/upload', protect, uploadMiddleware, uploadRecipientsCSV);
router.route('/:id').put(protect, updateRecipient).delete(protect, removeRecipient);

export default router;

