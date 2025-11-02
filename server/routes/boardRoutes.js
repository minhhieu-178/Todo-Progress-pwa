import express from 'express';
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  createList,
  updateList, } from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Áp dụng middleware 'protect' cho các route này
// Bất kỳ request nào đến /api/boards/
// 1. Phải đi qua 'protect' (xác thực token)
// 2. Sau đó mới chạy controller (createBoard hoặc getMyBoards)

router.route('/')
  .post(protect, createBoard)  // Tạo Bảng mới
  .get(protect, getMyBoards); // Lấy Bảng của tôi

router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);


router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);

  export default router;