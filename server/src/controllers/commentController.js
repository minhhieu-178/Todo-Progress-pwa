import Comment from '../models/Comment.js';
import Board from '../models/Board.js';

export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  const userId = req.user._id;

  if (!content || !boardId || !cardId) return res.status(400).json({ message: 'Thiếu dữ liệu' });

  try {
    const comment = await Comment.create({ userId, boardId, cardId, content });
    const populatedComment = await comment.populate('userId', 'fullName email');
    res.status(201).json(populatedComment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getCommentsForCard = async (req, res) => {
  const { cardId } = req.query;
  if (!cardId) return res.status(400).json({ message: 'Thiếu Card ID' });

  try {
    const comments = await Comment.find({ cardId }).populate('userId', 'fullName email').sort({ createdAt: 'asc' });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};