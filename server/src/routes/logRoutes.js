import express from 'express';
import { getBoardLogs, getMyLogs} from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyLogs);
router.get('/:boardId', protect, getBoardLogs);

export default router;
