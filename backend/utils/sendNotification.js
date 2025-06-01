import Notification from '../models/Notification.js';

export async function sendNotification(userId, type, message, meta = {}) {
  await Notification.create({
    user: userId,
    type,
    message,
    meta
  });
}
