import Board from '../models/Board.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js'

export const createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Tiêu đề Bảng là bắt buộc' });
  try {
    const defaultLists = [
      { title: 'Việc cần làm', position: 0, isDefault: true }, 
      { title: 'Đang làm', position: 1, isDefault: true },     
      { title: 'Đã xong', position: 2, isDefault: true },      
    ];
    const board = await Board.create({
      title,
      ownerId: req.user._id,
      members: [req.user._id],
      lists: defaultLists,
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id)
      .populate('members', 'fullName email')
      .populate('ownerId', 'fullName email');

    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    const isMember = board.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Không có quyền truy cập' });

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const board = await Board.findById(id);

    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });
    if (board.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Không có quyền' });

    if (title) board.title = title.trim();
    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });
    if (board.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Không có quyền xóa' });

    await board.deleteOne();
    res.json({ message: 'Đã xóa Bảng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  try {
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    if (board.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Bạn không phải chủ Bảng' });

    const userYz = await User.findOne({ email });
    if (!userYz) return res.status(404).json({ message: 'Người dùng chưa đăng ký' });
    if (board.members.includes(userYz._id)) return res.status(400).json({ message: 'Đã là thành viên rồi' });

    board.members.push(userYz._id);
    await board.save();
    try {
      await NotificationService.create({
        recipientId: userYz._id,
        senderId: board.ownerId,
        type: "ADDED_TO_BOARD",
        title: "Được thêm vào nhóm",
        message: `Bạn đã được thêm vào Bảng ${board.title}`,
        targetUrl: `/boards/${id}`,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }
    const updatedBoard = await Board.findById(id)
      .populate('members', 'fullName email')
      .populate('ownerId', 'fullName email');
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  const { id, userId } = req.params; 
  try {
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    if (board.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Bạn không phải chủ Bảng' });
    if (userId === board.ownerId.toString()) return res.status(400).json({ message: 'Không thể xóa chủ sở hữu' });

    board.members = board.members.filter(memberId => memberId.toString() !== userId);
    await board.save();
    const updatedBoard = await Board.findById(id).populate('members', 'fullName email').populate('ownerId', 'fullName email');
    res.json(updatedBoard);
    try {
      await NotificationService.create({
        recipientId: userId,
        senderId: board.ownerId,
        type: "DELETED_FROM_BOARD",
        title: "Bị xóa khỏi bảng",
        message: `Bạn đã bị xóa khỏi Bảng ${board.title}`,
        targetUrl: `/boards/${id}`,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};