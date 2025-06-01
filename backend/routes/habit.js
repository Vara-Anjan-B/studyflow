import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Habit from '../models/Habit.js';

const router = express.Router();

// Get all habits for the user
router.get('/', authenticateJWT, async (req, res) => {
  const habits = await Habit.find({ user: req.user.userId });
  res.json(habits);
});

// Create a habit
router.post('/', authenticateJWT, async (req, res) => {
  const { name } = req.body;
  const habit = new Habit({ user: req.user.userId, name });
  await habit.save();
  res.status(201).json(habit);
});

// Mark habit as completed for today
router.post('/:id/complete', authenticateJWT, async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const habit = await Habit.findOne({ _id: req.params.id, user: req.user.userId });
  if (!habit) return res.status(404).json({ message: 'Habit not found.' });
  if (!habit.completedDates.some(d => new Date(d).getTime() === today.getTime())) {
    habit.completedDates.push(today);
    await habit.save();
  }
  res.json(habit);
});

// Delete a habit
router.delete('/:id', authenticateJWT, async (req, res) => {
  await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  res.json({ message: 'Habit deleted.' });
});

export default router;
