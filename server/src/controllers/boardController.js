import Board from '../models/Board.js';

// @desc    Tạo Bảng (Board) mới
// @route   POST /api/boards
// @access  Protected
export const createBoard = async (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề Bảng là bắt buộc' });
  }

  try {
    // Tạo các danh sách mặc định khi tạo Bảng mới
    const defaultLists = [
      { title: 'Việc cần làm', position: 0 },
      { title: 'Đang làm', position: 1 },
      { title: 'Đã xong', position: 2 },
    ];

    const board = await Board.create({
      title,
      ownerId: req.user._id, // Lấy từ middleware 'protect'
      members: [req.user._id], // Chủ sở hữu cũng là thành viên đầu tiên
      lists: defaultLists, // Thêm các list mặc định
    });

    res.status(201).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Lấy tất cả Bảng (Board) mà user là thành viên
// @route   GET /api/boards
// @access  Protected
export const getMyBoards = async (req, res) => {
  try {
    // Tìm tất cả Bảng mà mảng 'members' CÓ CHỨA ID của user hiện tại
    // Đây chính là truy vấn Multikey Index
    const boards = await Board.find({ members: req.user._id })
                              .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
                              
    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, members, lists } = req.body;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Board' });
    }
    if (board.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa Board này' });
    }
    if (title) board.title = title.trim();
    if (members) board.members = members;
    if (lists) board.lists = lists;

    const updatedBoard = await board.save();
    res.json(updatedBoard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Board' });
    }

    if (board.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa Bảng này' });
    }

    await board.deleteOne();
    res.json({ message: 'Đã xóa Bảng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Không có quyền truy cập Bảng này' });
    }

    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, position } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Thiếu tiêu đề List' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Board' });
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Không phải thành viên' });
    }

    const newPosition = position ?? board.lists.length;

    const newList = {
      title: title.trim(),
      position: newPosition,
      cards: [],
    };

    board.lists.push(newList);
    await board.save();

    res.status(201).json(board.lists[board.lists.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const updateList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, position, cards } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Board' });
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Không phải thành viên' });
    }

    const list = board.lists.id(listId);
    if (!list) {
      return res.status(404).json({ message: 'Không tìm thấy List' });
    }

    if (title) list.title = title.trim();
    if (position !== undefined) list.position = position;
    if (cards) list.cards = cards;

    await board.save();
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};