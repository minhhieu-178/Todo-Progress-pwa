import express from 'express';
import { registerUser, loginUser, updateUserProfile, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect , updateUserProfile);
router.post('/forgot-pasword', forgotPassword);

export default router;