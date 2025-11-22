import Board from '../models/Board.js';
import User from '../models/User.js';

// @desc    Tạo Bảng (Board) mới
export const createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề Bảng là bắt buộc' });
  }
  try {
    const defaultLists = [
      { title: 'Việc cần làm', position: 0 },
      { title: 'Đang làm', position: 1 },
      { title: 'Đã xong', position: 2 },
    ];
    const board = await Board.create({
      title,
      ownerId: req.user._id,
      members: [req.user._id],
      lists: defaultLists,
    });
    res.status(201).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Lấy tất cả Bảng của user
export const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Lấy chi tiết 1 Bảng
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
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Cập nhật Bảng
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, members, lists } = req.body;
    const board = await Board.findById(id);

    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });
    if (board.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
    }

    if (title) board.title = title.trim();
    if (members) board.members = members;
    if (lists) board.lists = lists;

    const updatedBoard = await board.save();
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa Bảng
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);

    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });
    if (board.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    await board.deleteOne();
    res.json({ message: 'Đã xóa Bảng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo List mới
export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, position } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu tiêu đề List' });

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Không phải thành viên' });

    const newPosition = position ?? board.lists.length;
    const newList = { title: title.trim(), position: newPosition, cards: [] };

    board.lists.push(newList);
    await board.save();
    res.status(201).json(board.lists[board.lists.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật List
export const updateList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, position, cards } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    if (title) list.title = title.trim();
    if (position !== undefined) list.position = position;
    if (cards) list.cards = cards;

    await board.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thêm thành viên (Invite)
export const addMember = async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  try {
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    if (board.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không phải chủ Bảng' });
    }

    const userYz = await User.findOne({ email });
    if (!userYz) return res.status(404).json({ message: 'Người dùng chưa đăng ký' });

    if (board.members.includes(userYz._id)) {
      return res.status(400).json({ message: 'Đã là thành viên rồi' });
    }

    board.members.push(userYz._id);
    await board.save();

    const updatedBoard = await Board.findById(id)
      .populate('members', 'fullName email')
      .populate('ownerId', 'fullName email');
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};