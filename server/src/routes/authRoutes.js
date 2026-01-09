import express from 'express';
import { 
  registerUser, 
  loginUser,
  logoutUser, 
  verifyEmailOtp,
  forgotPassword, 
  requestChangePassword,
  confirmChangePassword,
  refreshAccessToken
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email-otp', verifyEmailOtp);
router.get('/logout', logoutUser); 
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword); 

router.post('/change-password-request', protect, requestChangePassword);
router.post('/change-password-confirm', protect, confirmChangePassword);

export default router;