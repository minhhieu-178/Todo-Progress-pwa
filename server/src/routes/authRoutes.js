import express from 'express';
import { 
  registerUser, 
  loginUser,
  forgotPassword, 
  requestChangePassword,
  confirmChangePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); 

router.post('/change-password-request', protect, requestChangePassword);
router.post('/change-password-confirm', protect, confirmChangePassword);

export default router;