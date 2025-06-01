import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for the user
router.get('/', authenticateJWT, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Delete a notification
router.delete('/:id', authenticateJWT, async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  res.json({ message: 'Notification deleted.' });
});

export default router;
