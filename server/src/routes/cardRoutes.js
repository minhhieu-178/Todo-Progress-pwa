import express from 'express';
import { createCard, updateCard, deleteCard, moveCard, addMemberToCard, removeMemberFromCard, uploadAttachment, deleteAttachment } from '../controllers/cardController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();
router.use(protect);

router.post('/boards/:boardId/lists/:listId/cards', createCard);
router.put('/boards/:boardId/lists/:listId/cards/:cardId', updateCard);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId', deleteCard);
router.put('/boards/:boardId/cards/:cardId/move', moveCard);
router.post('/boards/:boardId/lists/:listId/cards/:cardId/members', addMemberToCard);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId/members', removeMemberFromCard);
router.post(
  '/boards/:boardId/lists/:listId/cards/:cardId/attachments',
  upload.single('file'), 
  uploadAttachment       
);
router.delete(
  '/boards/:boardId/lists/:listId/cards/:cardId/attachments/:attachmentId', 
  deleteAttachment
);
export default router;