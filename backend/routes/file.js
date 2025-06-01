import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateJWT } from '../middleware/auth.js';
import File from '../models/File.js';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.resolve('uploads/files');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/', authenticateJWT, async (req, res) => {
  const files = await File.find({ user: req.user.userId }).sort({ uploadedAt: -1 });
  res.json(files);
});

router.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const file = new File({
    user: req.user.userId,
    filename: `/uploads/files/${req.file.filename}`,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
  await file.save();
  res.status(201).json(file);
});

router.get('/download/:id', authenticateJWT, async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, user: req.user.userId });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  const filePath = path.resolve(`.${file.filename}`);
  res.download(filePath, file.originalname);
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  const file = await File.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  const filePath = path.resolve(`.${file.filename}`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ message: 'File deleted.' });
});

export default router;