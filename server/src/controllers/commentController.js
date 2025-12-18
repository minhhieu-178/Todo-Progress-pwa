import Comment from '../models/Comment.js';
import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';
import { createLog } from '../services/logService.js'; 

const handleMentions = async (content, boardId, cardId, senderId, senderName, io) => {
    let mentionedUserIds = [];
    try {
        const board = await Board.findById(boardId).populate('members', 'fullName _id email avatar');
        if (!board) return [];

        const normalizedContent = content.replace(/\u00A0/g, ' ');

        const mentionedMembers = board.members.filter(m => 
            m && m.fullName &&
            normalizedContent.includes(`@${m.fullName}`) && 
            m._id.toString() !== senderId.toString()
        );

        const notiPromises = mentionedMembers.map(async (m) => {
            mentionedUserIds.push(m._id.toString()); 

            const newNoti = await NotificationService.create({
                recipientId: m._id,
                senderId: senderId,
                type: 'MENTION',
                title: 'Bạn được nhắc tên',
                message: `${senderName} đã nhắc đến bạn trong một bình luận`,
                targetUrl: `/board/${boardId}?cardId=${cardId}`,
                metadata: { boardId, cardId }
            });

            if (io) io.to(m._id.toString()).emit('NEW_NOTIFICATION', newNoti);
        });

        await Promise.all(notiPromises);
    } catch (error) {
        console.error("Lỗi handleMentions:", error);
    }
    return mentionedUserIds; 
};

const handleCardNotifications = async (boardId, cardId, senderId, senderName, content, excludeIds, io) => {
    try {
        const board = await Board.findById(boardId);
        if (!board) return;

        let targetCard = null;
        for (const list of board.lists) {
            const found = list.cards.find(c => c._id.toString() === cardId.toString());
            if (found) { targetCard = found; break; }
        }

        if (!targetCard || !targetCard.members) return;

        const recipients = targetCard.members.filter(memberId => 
            memberId.toString() !== senderId.toString() && 
            !excludeIds.includes(memberId.toString())
        );

        const notiPromises = recipients.map(async (recipientId) => {
            const newNoti = await NotificationService.create({
                recipientId: recipientId,
                senderId: senderId,
                type: 'COMMENT',
                title: 'Bình luận mới',
                message: `${senderName} đã thêm 1 bình luận vào thẻ "${targetCard.title}"`,
                targetUrl: `/board/${boardId}?cardId=${cardId}`,
                metadata: { boardId, cardId }
            });

            if (io) io.to(recipientId.toString()).emit('NEW_NOTIFICATION', newNoti);
        });

        await Promise.all(notiPromises);

    } catch (error) {
        console.error("Lỗi handleCardNotifications:", error);
    }
};

export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  const userId = req.user._id;
  const io = req.app.get('socketio');

  if (!content || !boardId || !cardId) return res.status(400).json({ message: 'Thiếu dữ liệu' });

  try {
    const comment = await Comment.create({ userId, boardId, cardId, content });
    const populatedComment = await comment.populate('userId', 'fullName email avatar');
    
    if (io) io.to(boardId).emit('NEW_COMMENT', populatedComment); 

    await createLog({
        userId, boardId,
        entityId: cardId, entityType: 'COMMENT',
        action: 'COMMENT_CREATE',
        content: `đã bình luận: "${content.substring(0, 30)}..."`
    });

    const mentionedIds = await handleMentions(content, boardId, cardId, userId, req.user.fullName, io);
    
    await handleCardNotifications(boardId, cardId, userId, req.user.fullName, content, mentionedIds, io);

    res.status(201).json(populatedComment);
  } catch (error) { res.status(500).json({ message: error.message }); }
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

    // Log
    await createLog({
        userId, boardId: comment.boardId,
        entityId: comment.cardId, entityType: 'COMMENT',
        action: 'COMMENT_UPDATE',
        content: `đã chỉnh sửa bình luận`
    });

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

    //Log
    await createLog({
        userId, boardId,
        entityId: cardId, entityType: 'COMMENT',
        action: 'COMMENT_DELETE',
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
      .sort({ createdAt: 'asc' })
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};