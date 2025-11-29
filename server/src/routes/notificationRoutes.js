import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getUserNotifications, 
  markRead, 
  markAllRead 
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect); 
router.get('/', getUserNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;