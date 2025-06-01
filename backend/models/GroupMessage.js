import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
