import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  await Notification.updateOne({ _id: id, user: req.user.userId }, { $set: { read: true } });
  res.json({ success: true });
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.userId, read: false }, { $set: { read: true } });
  res.json({ success: true });
};
