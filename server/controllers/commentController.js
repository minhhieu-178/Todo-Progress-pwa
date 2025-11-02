import Comment from '../models/Comment.js';
import Board from '../models/Board.js';

// @desc    Tạo một bình luận (Comment) mới
// @route   POST /api/comments
// @access  Protected
export const createComment = async (req, res) => {
  const { content, boardId, cardId } = req.body;
  const userId = req.user._id;

  if (!content || !boardId || !cardId) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ nội dung' });
  }

  try {
    // 1. Kiểm tra xem user có phải là thành viên của Bảng không
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    }
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Bạn không có quyền bình luận trong Bảng này' });
    }


    // 2. Tạo bình luận
    const comment = await Comment.create({
      userId,
      boardId,
      cardId,
      content,
    });

    // 3. Trả về bình luận mới (kèm thông tin user)
    const populatedComment = await comment.populate('userId', 'fullName email');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Lấy tất cả bình luận (Comment) cho một Thẻ (Card)
// @route   GET /api/comments
// @access  Protected
export const getCommentsForCard = async (req, res) => {
  const { cardId, boardId } = req.query;
  const userId = req.user._id;

  if (!cardId || !boardId) {
    return res.status(400).json({ message: 'Cần có ID Bảng và ID Thẻ' });
  }

  try {
    // 1. Kiểm tra quyền thành viên 
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    }
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Bạn không có quyền xem bình luận này' });
    }

    // 2. Lấy bình luận
    const comments = await Comment.find({ cardId: cardId })
      .populate('userId', 'fullName email') 
      .sort({ createdAt: 'asc' }); 

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};