import express from 'express';
import { createComment, getCommentsForCard, updateComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', createComment);
router.get('/', getCommentsForCard);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment); 

export default router;