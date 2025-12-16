import Comment from '../models/Comment.js';
import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js'; 

export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  const userId = req.user._id;

  if (!content || !boardId || !cardId) return res.status(400).json({ message: 'Thiếu dữ liệu' });

  try {
    const comment = await Comment.create({ userId, boardId, cardId, content });
    const populatedComment = await comment.populate('userId', 'fullName email');

    try {
        const board = await Board.findById(boardId);
        
        if (board) {
            let cardTitle = "Thẻ";
            let cardMembers = [];
            
            for (const list of board.lists) {
                const card = list.cards.id(cardId);
                if (card) {
                    cardTitle = card.title;
                    cardMembers = card.members; 
                    break;
                }
            }

            const notificationPromises = cardMembers.map(async (memberId) => {
                if (memberId.toString() !== userId.toString()) { 
                    await NotificationService.create({
                        recipientId: memberId,
                        senderId: userId,
                        type: 'COMMENT',
                        title: 'Bình luận mới',
                        message: `${req.user.fullName || req.user.email} đã bình luận trong thẻ "${cardTitle}"`,
                        targetUrl: `/board/${boardId}?cardId=${cardId}`, 
                        metadata: { boardId, cardId }
                    });
                }
            });

            await Promise.all(notificationPromises);
        }
    } catch (notiError) {
        console.error("Lỗi gửi thông báo comment:", notiError);
    }

    res.status(201).json(populatedComment);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

export const getCommentsForCard = async (req, res) => {
  const { cardId } = req.query;
  if (!cardId) return res.status(400).json({ message: 'Thiếu Card ID' });

  try {
    const comments = await Comment.find({ cardId }).populate('userId', 'fullName email').sort({ createdAt: 'asc' });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};