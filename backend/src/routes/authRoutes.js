import express from 'express';
import passport from 'passport';
import { authGoogleCallback, getUserProfile, devLogin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dev-login', devLogin);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authGoogleCallback
);

router.get('/profile', protect, getUserProfile);

export default router;
