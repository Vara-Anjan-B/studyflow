import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/.+\@.+\..+/, 'Invalid email'] },
    password: { type: String, required: true, minlength: 8, select: false },
    isVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    bio: { type: String, maxlength: 300, default: '' },
    social: { type: Object, default: {} },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    activityLog: [{
      action: String,
      timestamp: { type: Date, default: Date.now },
      meta: Object
    }],
    notificationPrefs: {
      accountActivity: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      passwordChange: { type: Boolean, default: true }
    },
  },
  { versionKey: false }
);

const User = mongoose.model('User', userSchema, 'users2');

export default User;
