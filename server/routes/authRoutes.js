import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Đăng ký người dùng mới
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

export default router;