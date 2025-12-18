import Comment from '../models/Comment.js';
import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';
import { createLog } from '../services/logService.js'; 

const handleMentions = async (content, boardId, cardId, senderId, senderName, io) => {
    try {
        //Lấy thông tin board và thành viên để check mention
        const board = await Board.findById(boardId).populate('members.user', 'fullName _id');
        if (!board) return;

        //Lọc ra các thành viên được nhắc đến
        const mentionedMembers = board.members.filter(m => 
            content.includes(`@${m.user.fullName}`) && m.user._id.toString() !== senderId.toString()
        );

        const notiPromises = mentionedMembers.map(async (m) => {
            const newNoti = await NotificationService.create({
                recipientId: m.user._id,
                senderId: senderId,
                type: 'MENTION',
                title: 'Bạn được nhắc đến',
                message: `${senderName} đã nhắc đến bạn trong một bình luận: "${content.substring(0, 50)}..."`,
                targetUrl: `/board/${boardId}?cardId=${cardId}`,
                metadata: { boardId, cardId }
            });

            if (io) {
                io.to(m.user._id.toString()).emit('NEW_NOTIFICATION', newNoti);
            }
        });

        await Promise.all(notiPromises);
    } catch (error) {
        console.error("Lỗi xử lý mention:", error);
    }
};

export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  const userId = req.user._id;
  const io = req.app.get('socketio');

  if (!content || !boardId || !cardId) return res.status(400).json({ message: 'Thiếu dữ liệu' });

  try {
    const comment = await Comment.create({ userId, boardId, cardId, content });
    const populatedComment = await comment.populate('userId', 'fullName email');

    //Real-time
    if (io) {
        io.to(boardId).emit('NEW_COMMENT', populatedComment); 
    }

    //Ghi log lại
    await createLog({
        userId,
        boardId,
        entityId: cardId,
        entityType: 'Card',
        action: 'COMMENT_CREATE',
        content: `đã bình luận: "${content.substring(0, 30)}..."`
    });

    //Xử lý mention và nofi
    await handleMentions(content, boardId, cardId, userId, req.user.fullName, io);

    res.status(201).json(populatedComment);
  } catch (error) { 
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
    if (comment.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Cấm' });

    comment.content = content;
    await comment.save();
    const updatedComment = await comment.populate('userId', 'fullName email');

    if (io) {
        io.to(comment.boardId.toString()).emit('UPDATE_COMMENT', updatedComment);
    }

    await createLog({
        userId,
        boardId: comment.boardId,
        entityId: comment.cardId,
        entityType: 'Card',
        action: 'COMMENT_UPDATE',
        content: `đã chỉnh sửa bình luận`
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const io = req.app.get('socketio');

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy' });
    if (comment.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Cấm' });

    const { boardId, cardId } = comment;
    await comment.deleteOne();

    if (io) {
        io.to(boardId.toString()).emit('DELETE_COMMENT', { commentId: id, cardId });
    }

    await createLog({
        userId,
        boardId,
        entityId: cardId,
        entityType: 'Card',
        action: 'COMMENT_DELETE',
        content: `đã xóa một bình luận`
    });

    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogsByBoard = async (req, res) => {
}

export const getCommentsForCard = async (req, res) => {
  const { cardId } = req.query;
  try {
    const comments = await Comment.find({ cardId }).populate('userId', 'fullName email').sort({ createdAt: 'asc' });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};