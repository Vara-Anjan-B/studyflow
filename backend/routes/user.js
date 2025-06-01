import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
  getActivityLog,
  updateNotificationPrefs
} from '../controllers/userController.js';
import { upload } from '../middleware/upload.js';
import Task from '../models/Task.js';
import Post from '../models/Post.js';
import File from '../models/File.js';
import Habit from '../models/Habit.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.post('/profile/picture', authenticateJWT, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/delete', authenticateJWT, deleteAccount);
router.get('/activity', authenticateJWT, getActivityLog);
router.put('/notification-prefs', authenticateJWT, updateNotificationPrefs);
router.get('/stats', authenticateJWT, async (req, res) => {
  const [tasks, posts, files, habits] = await Promise.all([
    Task.countDocuments({ user: req.user.userId }),
    Post.countDocuments({ user: req.user.userId }),
    File.countDocuments({ user: req.user.userId }),
    Habit.countDocuments({ user: req.user.userId }),
  ]);
  res.json({ tasks, posts, files, habits });
});
router.get('/search', authenticateJWT, async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json([]);
  const users = await User.find({
    $or: [
      { fullName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  })
    .select('_id fullName email profilePicture')
    .limit(10);
  res.json(users);
});

export default router;
