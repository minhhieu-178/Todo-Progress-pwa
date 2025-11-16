import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
// Khởi tạo và cấu hình
dotenv.config();
const app = express();
app.use(express.json()); 
app.use(cors()); 

// Kết nối Database
connectDB();

// Định tuyến (Routing)
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

app.use('/api/auth', authRoutes); 
app.use('/api/boards', boardRoutes);
app.use('/api', cardRoutes);


// Khởi chạy Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});