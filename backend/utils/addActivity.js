import User from '../models/User.js';

export async function addActivity(userId, action, meta = {}) {
  await User.findByIdAndUpdate(userId, {
    $push: {
      activityLog: {
        action,
        timestamp: new Date(),
        meta
      }
    }
  });
}