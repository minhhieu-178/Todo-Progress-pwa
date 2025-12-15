import express from 'express';
import { getUserProfile, updateUserProfile, deleteUser,subscribePush } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);


router.post('/subscribe', subscribePush);
export default router;