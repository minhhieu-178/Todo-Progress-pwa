import express from 'express';
import { getBoardLogs, getMyLogs } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:boardId', protect, getBoardLogs);
router.get('/user/me', protect, getMyLogs);

export default router;
