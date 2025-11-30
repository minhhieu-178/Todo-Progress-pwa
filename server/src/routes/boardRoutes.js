import express from 'express';
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
<<<<<<< HEAD
=======
  createList,
  updateList,
  deleteList,
>>>>>>> 39929d12d5c05eb2b0a999378e59d851dea2c221
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

router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

router.put('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

// --- Route cho List (trỏ vào listController) ---
router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);
<<<<<<< HEAD
router.delete('/:boardId/lists/:listId', protect, deleteList); // Thêm tính năng xóa list
=======
router.delete('/:boardId/lists/:listId', protect, deleteList);

router.put('/:id/members', protect, addMember);
// --- Thêm route Xóa thành viên ---
router.delete('/:id/members/:userId', protect, removeMember); 
>>>>>>> 39929d12d5c05eb2b0a999378e59d851dea2c221

export default router;