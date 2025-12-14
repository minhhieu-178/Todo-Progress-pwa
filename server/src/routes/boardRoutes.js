import express from 'express';
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  getDashboardStats,
<<<<<<< HEAD
=======
  getAllUpcomingTasks,
>>>>>>> duchieu
  addMember,
  removeMember
} from '../controllers/boardController.js';
// --- Import mới từ listController ---
import { createList, updateList, deleteList } from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBoard)
  .get(protect, getMyBoards);

<<<<<<< HEAD
=======
router.get('/deadlines/all', protect, getAllUpcomingTasks);
>>>>>>> duchieu
router.get('/stats', protect, getDashboardStats);

router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

router.put('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

// --- Route cho List (trỏ vào listController) ---
router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);
router.delete('/:boardId/lists/:listId', protect, deleteList);

router.put('/:id/members', protect, addMember);
// --- Thêm route Xóa thành viên ---
router.delete('/:id/members/:userId', protect, removeMember); 

export default router;