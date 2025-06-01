import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// Get all posts (most recent first)
router.get('/', authenticateJWT, async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('user', 'fullName profilePicture');
  res.json(posts);
});

// Create a new post
router.post('/', authenticateJWT, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required.' });
  const post = new Post({ user: req.user.userId, content });
  await post.save();
  await post.populate('user', 'fullName profilePicture');
  res.status(201).json(post);
});

// Delete post (only by owner)
router.delete('/:id', authenticateJWT, async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  await Comment.deleteMany({ post: post._id });
  res.json({ message: 'Post deleted.' });
});

// Get comments for a post
router.get('/:id/comments', authenticateJWT, async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('user', 'fullName profilePicture');
  res.json(comments);
});

// Add a comment to a post
router.post('/:id/comments', authenticateJWT, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required.' });
  const comment = new Comment({ post: req.params.id, user: req.user.userId, content });
  await comment.save();
  await comment.populate('user', 'fullName profilePicture');
  res.status(201).json(comment);
});

// Delete comment (only by owner)
router.delete('/comments/:commentId', authenticateJWT, async (req, res) => {
  const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, user: req.user.userId });
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  res.json({ message: 'Comment deleted.' });
});

export default router;
