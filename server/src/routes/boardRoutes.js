import express from 'express';
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  createList,
  updateList,
  addMember,
  removeMember // <--- Import thêm
} from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBoard)
  .get(protect, getMyBoards);

router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

router.post('/:boardId/lists', protect, createList);
router.put('/:boardId/lists/:listId', protect, updateList);

router.put('/:id/members', protect, addMember);
// --- Thêm route Xóa thành viên ---
router.delete('/:id/members/:userId', protect, removeMember); 

export default router;