import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- Import User Routes
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

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
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));