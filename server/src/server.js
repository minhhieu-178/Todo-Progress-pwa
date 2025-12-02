import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- Import User Routes
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import cron from 'node-cron';
import { checkDeadlines } from '../services/checkDeadline.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API đang chạy...'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <--- Đăng ký /api/users
app.use('/api/boards', boardRoutes);
app.use('/api', cardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

cron.schedule('*/5 * * * *', async () => {
  console.log('Running cron job: check deadlines');
  try {
    const notifications = await checkDeadlines();
    console.log(`Created ${notifications.length} notifications`);
  } catch (err) {
    console.error('Cron job error:', err);
  }
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));