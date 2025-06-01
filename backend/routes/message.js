import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (for selection)
router.get('/users', authenticateJWT, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.userId } }).select('_id fullName profilePicture');
  res.json(users);
});

// Get conversation with another user
router.get('/with/:otherUserId', authenticateJWT, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { from: req.user.userId, to: req.params.otherUserId },
      { from: req.params.otherUserId, to: req.user.userId }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// Send a message
router.post('/send', authenticateJWT, async (req, res) => {
  const { to, content } = req.body;
  if (!to || !content) return res.status(400).json({ message: 'Recipient and content required.' });
  const message = new Message({
    from: req.user.userId,
    to,
    content
  });
  await message.save();
  res.status(201).json(message);
});

export default router;
