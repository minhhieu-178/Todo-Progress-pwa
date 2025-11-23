import express from 'express';
import { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  forgotPassword, 
  deleteUser 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes (Ai cũng truy cập được) ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// QUAN TRỌNG: Route này KHÔNG ĐƯỢC có 'protect'
router.post('/forgot-password', forgotPassword); 

// --- Protected Routes (Phải đăng nhập mới dùng được) ---
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);

export default router;