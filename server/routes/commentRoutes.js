import express from 'express';
import { createComment, getCommentsForCard } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Bảo vệ tất cả route bên dưới

router.post('/', createComment);
router.get('/', getCommentsForCard);

export default router;