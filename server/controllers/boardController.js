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