import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import cookieParser from 'cookie-parser'; //Doc cookie
import helmet from 'helmet'; //Bao mat header
import mongoSanitize from 'express-mongo-sanitize'; //NoSQL Injection
import xss from 'xss-clean'; //Xss input
import hpp from 'hpp'; //Spam tham so
import rateLimit from 'express-rate-limit'; //Gioi han request

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import logRoutes from './routes/logRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { checkDeadlines } from './services/checkDeadline.js';

dotenv.config();
connectDB();

const app = express();


app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], 
  credentials: true, // Cho phép nhận cookie/token
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Quá nhiều request từ IP này, vui lòng thử lại sau.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser()); 
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());


app.get('/', (req, res) => res.send('API đang chạy...'));
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', cardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes);


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
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));