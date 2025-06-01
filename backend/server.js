import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/notification.js';
import taskRoutes from './routes/task.js';
import postRoutes from './routes/post.js';
import fileRoutes from './routes/file.js';
import habitRoutes from './routes/habit.js';
import messageRoutes from './routes/message.js';
import chatRoomRoutes from './routes/chatroom.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.resolve('uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatrooms', chatRoomRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'StudyFlow API is running' });
});

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production!
    methods: ['GET', 'POST']
  }
});

// Socket.IO real-time group messaging
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('sendGroupMessage', async ({ roomId, from, content }) => {
    // Save to DB
    const GroupMessage = (await import('./models/GroupMessage.js')).default;
    const msg = new GroupMessage({
      room: roomId,
      from,
      content
    });
    await msg.save();
    await msg.populate('from', 'fullName profilePicture');
    // Emit to all in room
    io.to(roomId).emit('newGroupMessage', msg);
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const { host, port, name: dbName } = mongoose.connection;
    console.log(`MongoDB connected successfully!`);
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`Database: ${dbName}`);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
