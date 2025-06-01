import User from '../models/User.js';
import { addActivity } from '../utils/addActivity.js';
import { sendNotification } from '../utils/sendNotification.js';

// Get current user's profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password -emailVerifyToken -resetPasswordToken -resetPasswordExpires');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// Update current user's profile
export const updateProfile = async (req, res) => {
  const { fullName, bio, social, profilePicture, notificationPrefs } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (social !== undefined) user.social = social;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (notificationPrefs !== undefined) user.notificationPrefs = {
    ...user.notificationPrefs,
    ...notificationPrefs
  };

  await user.save();
  await addActivity(user._id, 'update_profile');
  await sendNotification(user._id, 'profile_update', 'Your profile was updated.');

  res.json({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    bio: user.bio,
    social: user.social,
    profilePicture: user.profilePicture,
    notificationPrefs: user.notificationPrefs,
    createdAt: user.createdAt,
  });
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.profilePicture = `/uploads/${req.file.filename}`;
  await user.save();

  await addActivity(user._id, 'update_profile', { profilePicture: user.profilePicture });

  res.json({ profilePicture: user.profilePicture, message: 'Profile picture updated.' });
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Your account has been deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Get activity log
export const getActivityLog = async (req, res) => {
  const user = await User.findById(req.user.userId).select('activityLog');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user.activityLog.slice(-20).reverse());
};

// Update notification preferences
export const updateNotificationPrefs = async (req, res) => {
  const { notificationPrefs } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.notificationPrefs = {
    ...user.notificationPrefs,
    ...notificationPrefs
  };

  await user.save();
  res.json({ notificationPrefs: user.notificationPrefs });
};
