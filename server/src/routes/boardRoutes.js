import express from 'express';
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  getDashboardStats,
  getAllUpcomingTasks,
  addMember,
  removeMember
} from '../controllers/boardController.js';

import { createList, updateList, deleteList, moveList } from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route gốc: Tạo board, Lấy danh sách board
router.route('/')
  .post(protect, createBoard)
  .get(protect, getMyBoards);

router.get('/deadlines/all', protect, getAllUpcomingTasks);
router.get('/stats', protect, getDashboardStats);

// Route xử lý Board theo ID
router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

// Route xử lý thành viên trong Board
router.put('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

// --- Route cho List (trỏ vào listController) ---
router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);
router.delete('/:boardId/lists/:listId', protect, deleteList); 

export default router;