import express from 'express';
import { 
  registerUser, 
  loginUser,
  forgotPassword, 

  updateUserProfile, 
   
  deleteUser,
  requestChangePassword,
  confirmChangePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); 


router.put('/profile', protect, updateUserProfile);

router.delete('/profile', protect, deleteUser);
router.post('/change-password-request', protect, requestChangePassword);
router.post('/change-password-confirm', protect, confirmChangePassword);


export default router;