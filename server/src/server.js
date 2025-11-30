import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
<<<<<<< HEAD
=======
import searchRoutes from './routes/searchRoutes.js';
import logRoutes from './routes/logRoutes.js';
>>>>>>> 64904fe (thêm activity log (model, service, route))

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
<<<<<<< HEAD
=======
app.use('/api/search', searchRoutes);
app.use('/api/logs', logRoutes);
>>>>>>> 64904fe (thêm activity log (model, service, route))

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));