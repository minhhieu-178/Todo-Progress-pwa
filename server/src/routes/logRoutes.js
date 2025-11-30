import express from 'express';
import { getBoardLogs } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:boardId', protect, getBoardLogs);

export default router;
