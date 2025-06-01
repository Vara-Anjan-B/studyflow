import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  completedDates: [{ type: Date }],
  createdAt: { type: Date, default: Date.now }
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
