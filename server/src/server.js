import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import logRoutes from './routes/logRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API đang chạy...'));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', cardRoutes); // Lưu ý route này ko có prefix /cards vì trong file route đã định nghĩa dài
app.use('/api/comments', commentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));