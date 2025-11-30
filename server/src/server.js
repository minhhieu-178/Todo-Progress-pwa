import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- Import User Routes
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
<<<<<<< HEAD
import searchRoutes from './routes/searchRoutes.js';
import logRoutes from './routes/logRoutes.js';
=======
<<<<<<< HEAD
import logRoutes from './routes/logRoutes.js';
=======
>>>>>>> 39929d12d5c05eb2b0a999378e59d851dea2c221
>>>>>>> duchieu
import notificationRoutes from './routes/notificationRoutes.js';

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
<<<<<<< HEAD
app.use('/api/search', searchRoutes);
app.use('/api/logs', logRoutes);
=======
<<<<<<< HEAD
app.use('/api/logs', logRoutes);
=======
>>>>>>> 39929d12d5c05eb2b0a999378e59d851dea2c221
>>>>>>> duchieu
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));