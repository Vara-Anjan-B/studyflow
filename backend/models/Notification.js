import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g. 'profile_update', 'password_change'
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
