import express from 'express';
import { createBoard, getMyBoards, getBoardById, updateBoard, deleteBoard, createList, updateList, addMember } from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBoard)  // Tạo Bảng mới
  .get(protect, getMyBoards); // Lấy Bảng của tôi

router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);

router.put('/:id/members', protect, addMember);
export default router;