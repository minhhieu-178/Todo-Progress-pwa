import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import { createServer } from 'http'; 
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import logRoutes from './routes/logRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { checkDeadlines } from './services/checkDeadline.js';
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app); 
const io = new Server(httpServer, {   
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('User connected socket:', socket.id);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} đã vào phòng nhận thông báo`);
    }
  });

  socket.on('join_board_room', (boardId) => {
    if (boardId) {
      socket.join(boardId);
      console.log(`Socket ${socket.id} đã vào xem board ${boardId}`);
    }
  });

  socket.on('leave_board_room', (boardId) => {
    socket.leave(boardId);
  });
});

app.get('/', (req, res) => res.send('API đang chạy...'));
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', cardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);

cron.schedule('*/10 * * * *', async () => {
  console.log('Running cron job: check deadlines');
  try {
    const notifications = await checkDeadlines();
    console.log(`Created ${notifications.length} notifications`);
  } catch (err) {
    console.error('Cron job error:', err);
  }
});


const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));