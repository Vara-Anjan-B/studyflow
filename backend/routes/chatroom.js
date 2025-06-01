import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import ChatRoom from '../models/ChatRoom.js';
import GroupMessage from '../models/GroupMessage.js';

const router = express.Router();

// List all rooms the user is a member of
router.get('/', authenticateJWT, async (req, res) => {
  const rooms = await ChatRoom.find({ members: req.user.userId });
  res.json(rooms);
});

// Create a group chat room
router.post('/', authenticateJWT, async (req, res) => {
  const { name, memberIds } = req.body;
  if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ message: 'Name and members required.' });
  }
  // Always include creator as a member
  const room = new ChatRoom({ name, members: [req.user.userId, ...memberIds] });
  await room.save();
  res.status(201).json(room);
});

// Get all messages from a room
router.get('/:roomId/messages', authenticateJWT, async (req, res) => {
  const messages = await GroupMessage.find({ room: req.params.roomId }).sort({ createdAt: 1 }).populate('from', 'fullName profilePicture');
  res.json(messages);
});

export default router;