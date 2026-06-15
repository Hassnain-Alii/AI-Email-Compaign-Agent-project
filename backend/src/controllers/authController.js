import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '30d',
  });
};

export const authGoogleCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

export const devLogin = async (req, res) => {
  let user = await User.findOne({ email: 'test@example.com' });
  if (!user) {
    user = await User.create({
      googleId: 'test-google-id',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Test+User',
    });
  }

  const token = generateToken(user._id);
  res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
};
