import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get all tasks for the logged-in user
router.get('/', authenticateJWT, async (req, res) => {
  const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// Create a new task
router.post('/', authenticateJWT, async (req, res) => {
  const { title, description, dueDate } = req.body;
  const task = new Task({
    user: req.user.userId,
    title,
    description,
    dueDate
  });
  await task.save();
  res.status(201).json(task);
});

// Update a task
router.put('/:id', authenticateJWT, async (req, res) => {
  const { title, description, completed, dueDate } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    { title, description, completed, dueDate, updatedAt: Date.now() },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json(task);
});

// Delete a task
router.delete('/:id', authenticateJWT, async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ message: 'Task deleted.' });
});

export default router;