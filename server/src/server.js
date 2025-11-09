import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';

// Khởi tạo và cấu hình
dotenv.config();
const app = express();
app.use(express.json()); // Cho phép server nhận JSON
app.use(cors()); // Cho phép cross-origin requests (để React gọi được API)

// Kết nối Database
connectDB();

// Định tuyến (Routing)
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

app.use('/api/auth', authRoutes); // Sử dụng authRoutes cho /api/auth
app.use('/api/boards', boardRoutes);

// (Chúng ta sẽ thêm các middleware xử lý lỗi sau)

// Khởi chạy Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});