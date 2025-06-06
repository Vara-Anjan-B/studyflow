import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';
import { addActivity } from '../utils/addActivity.js';

// Register
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      emailVerifyToken,
      isVerified: false,
    });
    await user.save();

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerifyToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your StudyFlow email',
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.fullName},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>If you did not register, you can ignore this email.</p>
      `,
    });

    await addActivity(user._id, 'register');
    return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    await addActivity(user._id, 'login');
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        social: user.social,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your StudyFlow password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.fullName},</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  await addActivity(user._id, 'forgot_password');
  res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await addActivity(user._id, 'reset_password');
  res.json({ message: 'Password has been reset. You can now log in.' });
};

// Email Verification
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ emailVerifyToken: token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification link.' });
  }
  user.isVerified = true;
  user.emailVerifyToken = undefined;
  await user.save();
  await addActivity(user._id, 'verify_email');
  res.json({ message: 'Email verified! You can now log in.' });
};
