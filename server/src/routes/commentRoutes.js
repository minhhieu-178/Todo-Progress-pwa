import express from 'express';
import { createComment, getCommentsForCard } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', createComment);
router.get('/', getCommentsForCard);

export default router;