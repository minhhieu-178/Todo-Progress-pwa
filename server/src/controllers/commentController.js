import Comment from '../models/Comment.js';
import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';
import { createLog } from '../services/logService.js'; 

// Hàm xử lý Mention
const handleMentions = async (content, boardId, cardId, senderId, senderName, io) => {
    try {
        const board = await Board.findById(boardId).populate('members', 'fullName _id email');
        
        if (!board) return;

        
        const normalizedContent = content.replace(/\u00A0/g, ' ');

        const mentionedMembers = board.members.filter(member => {
            return member && 
                   member.fullName && 
                   normalizedContent.includes(`@${member.fullName}`) && 
                   member._id.toString() !== senderId.toString();
        });

        const notiPromises = mentionedMembers.map(async (recipient) => {
            try {
                const newNoti = await NotificationService.create({
                    recipientId: recipient._id,
                    senderId: senderId,
                    type: 'MENTION',
                    title: 'Bạn được nhắc đến',
                    message: `${senderName} đã nhắc đến bạn trong một bình luận`, // Rút gọn message để tránh lỗi cắt chuỗi phức tạp
                    targetUrl: `/board/${boardId}?cardId=${cardId}`,
                    metadata: { boardId, cardId }
                });

                if (io) {
                    io.to(recipient._id.toString()).emit('NEW_NOTIFICATION', newNoti);
                }
            } catch (err) {
                console.error(`Lỗi gửi noti mention tới ${recipient.email}:`, err);
            }
        });

        await Promise.all(notiPromises);
    } catch (error) {
        console.error("Lỗi xử lý mention:", error);
    }
};

export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  
  if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const io = req.app.get('socketio');

  if (!content || !boardId || !cardId) return res.status(400).json({ message: 'Thiếu dữ liệu' });

  try {
    const comment = await Comment.create({ userId, boardId, cardId, content });
    const populatedComment = await comment.populate('userId', 'fullName email avatar'); 

    if (io) io.to(boardId).emit('NEW_COMMENT', populatedComment); 

    createLog({
        userId, 
        boardId,
        entityId: cardId, 
        entityType: 'COMMENT', 
        action: 'CREATE',   
        content: `đã bình luận: "${content.substring(0, 30)}..."`
    }).catch(err => console.error("Lỗi ghi log comment:", err));

    await handleMentions(content, boardId, cardId, userId, req.user.fullName, io);

    res.status(201).json(populatedComment);
  } catch (error) { 
      console.error(error);
      res.status(500).json({ message: error.message }); 
  }
};

export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const io = req.app.get('socketio');

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy' });
    if (comment.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Không có quyền' });

    comment.content = content;
    await comment.save();
    const updatedComment = await comment.populate('userId', 'fullName email avatar');

    if (io) io.to(comment.boardId.toString()).emit('UPDATE_COMMENT', updatedComment);

    
    res.json(updatedComment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const io = req.app.get('socketio');

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy' });
    if (comment.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Không có quyền' });

    const { boardId, cardId } = comment;
    await comment.deleteOne();

    if (io) io.to(boardId.toString()).emit('DELETE_COMMENT', { commentId: id, cardId });

    await createLog({
        userId, 
        boardId,
        entityId: cardId, 
        entityType: 'COMMENT', 
        action: 'DELETE',      
        content: `đã xóa bình luận`
    });

    res.json({ message: 'Đã xóa' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getCommentsForCard = async (req, res) => {
  const { cardId } = req.query;
  try {
    const comments = await Comment.find({ cardId })
        .populate('userId', 'fullName email avatar') 
        .sort({ createdAt: 'asc' });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};