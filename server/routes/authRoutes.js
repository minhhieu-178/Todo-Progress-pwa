import express from 'express';
import { registerUser, loginUser, updateUserProfile, forgotPassword, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect , updateUserProfile);
router.delete('/profile', protect, deleteUser);
router.post('/forgot-password', forgotPassword);

export default router;