import express from 'express';
import { createCard, updateCard, deleteCard, moveCard, addMemberToCard, removeMemberFromCard } from '../controllers/cardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/boards/:boardId/lists/:listId/cards', createCard);
router.put('/boards/:boardId/lists/:listId/cards/:cardId', updateCard);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId', deleteCard);
router.put('/boards/:boardId/cards/:cardId/move', moveCard);
router.put('boards/:boardId/cards/:cardId/members', addMemberToCard);
router.delete('boards/:boardId/cards/:cardId/members/:UserId', removeMemberFromCard);

export default router;