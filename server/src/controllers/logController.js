import { getLogsByBoard } from '../services/logService.js';
import Board from '../models/Board.js';

export const getBoardLogs = async (req, res) => {
  const { boardId } = req.params;

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Không có quyền xem log' });

    const logs = await getLogsByBoard(boardId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user._id }) 
      .sort({ createdAt: -1 }) 
      .limit(50) 
      .populate('userId', 'fullName avatar') 
      .populate('boardId', 'title');

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};