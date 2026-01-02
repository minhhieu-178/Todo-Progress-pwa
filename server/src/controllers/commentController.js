import Comment from '../models/Comment.js';
import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';
import { createLog } from '../services/logService.js'; 

// Hàm xử lý Mention
const handleMentions = async (content, boardId, cardId, senderId, senderName, io) => {
    try {
        // Populate để lấy thông tin user trong mảng members
        // Lưu ý: Nếu schema Board của bạn là members: [{ user: ObjectId }], dòng này đúng.
        // Nếu schema là members: [ObjectId], hãy đổi thành .populate('members', 'fullName _id')
        const board = await Board.findById(boardId).populate({
            path: 'members.user',
            select: 'fullName _id'
        });
        
        if (!board) return;

        // Lọc thành viên được nhắc (thêm ?. để tránh crash nếu user null)
        const mentionedMembers = board.members.filter(m => {
            const memberUser = m.user || m; // Fallback nếu cấu trúc khác
            return memberUser && 
                   memberUser.fullName && 
                   content.includes(`@${memberUser.fullName}`) && 
                   memberUser._id.toString() !== senderId.toString();
        });

        const notiPromises = mentionedMembers.map(async (m) => {
            const recipient = m.user || m; // Lấy đúng object user
            
            const newNoti = await NotificationService.create({
                recipientId: recipient._id,
                senderId: senderId,
                type: 'MENTION',
                title: 'Bạn được nhắc đến',
                message: `${senderName} đã nhắc đến bạn trong comment: "${content.substring(0, 50)}..."`,
                targetUrl: `/board/${boardId}?cardId=${cardId}`,
                metadata: { boardId, cardId }
            });

            if (io) {
                io.to(recipient._id.toString()).emit('NEW_NOTIFICATION', newNoti);
            }
        });

        await Promise.all(notiPromises);
    } catch (error) {
        console.error("Lỗi mention:", error);
        // Không throw error để tránh chặn luồng tạo comment chính
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

    // Real-time
    if (io) io.to(boardId).emit('NEW_COMMENT', populatedComment); 

    // Log hoạt động (Đã sửa enum cho khớp Schema)
    await createLog({
        userId, 
        boardId,
        entityId: cardId, // Có thể để id comment hoặc id card tùy logic hiển thị
        entityType: 'COMMENT', // Sửa từ 'Card' -> 'COMMENT' (hoặc 'CARD')
        action: 'CREATE',      // Sửa từ 'COMMENT_CREATE' -> 'CREATE'
        content: `đã bình luận: "${content.substring(0, 30)}..."`
    });

    // Xử lý mention
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
    const updatedComment = await comment.populate('userId', 'fullName email');

    if (io) io.to(comment.boardId.toString()).emit('UPDATE_COMMENT', updatedComment);

    // Log (Đã sửa enum)
    await createLog({
        userId, 
        boardId: comment.boardId,
        entityId: comment.cardId, 
        entityType: 'COMMENT',  // Sửa thành COMMENT
        action: 'UPDATE',       // Sửa thành UPDATE
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

    // Log (Đã sửa enum)
    await createLog({
        userId, 
        boardId,
        entityId: cardId, 
        entityType: 'COMMENT', // Sửa thành COMMENT
        action: 'DELETE',      // Sửa thành DELETE
        content: `đã xóa bình luận`
    });

    res.json({ message: 'Đã xóa' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getCommentsForCard = async (req, res) => {
  const { cardId } = req.query;
  try {
    const comments = await Comment.find({ cardId }).populate('userId', 'fullName email').sort({ createdAt: 'asc' });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};