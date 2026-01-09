import Board from '../models/Board.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js'
import { createLog } from '../services/logService.js';
import { randomUUID } from 'crypto';
export const createBoard = async (req, res) => {
  // Nhận thêm 'lists' từ body
  const { title, _id, lists } = req.body;

  if (!title) return res.status(400).json({ message: 'Tiêu đề Bảng là bắt buộc' });
  if (!_id) {
     return res.status(400).json({ message: 'Thiếu ID Bảng (Client generation required)' });
  }

  try {
    let initialLists = lists;
    
    if (!initialLists || initialLists.length === 0) {
        initialLists = []; 
    }

    const board = await Board.create({
      _id: _id, 
      title,
      ownerId: req.user._id,
      members: [req.user._id],
      lists: initialLists,
    });
    
    await createLog({
      userId: req.user._id,
      boardId: board._id,
      entityId: board._id,
      entityType: 'BOARD',
      action: 'CREATE_BOARD',
      content: `đã tạo bảng dự án "${board.title}"`
    });

    res.status(201).json(board);
  } catch (error) {
    console.error(error);
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
      .populate('members', 'fullName email avatar') 
      .populate('ownerId', 'fullName email avatar') 
      .populate({
        path: 'lists.cards.members',
        select: 'fullName email avatar' 
      });
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

    if (board.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    const notificationPromises = board.members.map(async (memberId) => {
        if (memberId.toString() !== req.user._id.toString()) {
            return NotificationService.create({
                recipientId: memberId,
                senderId: req.user._id,
                type: "BOARD_DELETED",
                title: "Bảng đã bị xóa",
                message: `Chủ bảng ${req.user.fullName || req.user.email} đã xóa bảng "${board.title}"`,
                targetUrl: `/`, 
            });
        }
    });

    try {
        await Promise.all(notificationPromises);
    } catch (err) {
        console.error("Lỗi gửi thông báo xóa bảng:", err);
    }

    const io = req.app.get('socketio');
    if (io) {
        io.to(id).emit('BOARD_DELETED', { 
            message: `Bảng "${board.title}" đã bị xóa bởi chủ sở hữu.`,
            boardId: id
        });
    }

    await createLog({
      userId: req.user._id,
      boardId: board._id,
      entityId: board._id,
      entityType: 'BOARD',
      action: 'DELETE_BOARD',
      content: `đã xóa bảng dự án "${board.title}"`
    });

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

    const updatedBoard = await Board.findById(id)
      .populate('members', 'fullName email avatar')
      .populate('ownerId', 'fullName email avatar');

    const io = req.app.get('socketio'); 
    
    try {
      const newNoti = await NotificationService.create({
        recipientId: userYz._id,
        senderId: board.ownerId,
        type: "ADDED_TO_BOARD",
        title: "Được thêm vào nhóm",
        message: `${req.user.fullName} đã thêm bạn vào bảng "${board.title}"`,
        targetUrl: `/board/${id}`,
      });

      if (io) {

          io.to(userYz._id.toString()).emit('NEW_NOTIFICATION', newNoti);
          io.to(userYz._id.toString()).emit('ADDED_TO_BOARD', updatedBoard);


          io.to(id).emit('BOARD_UPDATED', { 
            action: 'ADD_MEMBER_BOARD',
            board: updatedBoard 
          });
      }

    } catch (err) {
      console.error("Notification error:", err.message);
    }

    await createLog({
      userId: req.user._id,
      boardId: board._id,
      entityId: userYz._id, 
      entityType: 'BOARD',
      action: 'ADD_MEMBER',
      content: `đã thêm thành viên "${userYz.fullName}" vào bảng`
    });

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  const { id, userId } = req.params; 
  try {
    const board = await Board.findById(id);
    const removedUser = await User.findById(userId).select('fullName email');
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    if (board.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Bạn không phải chủ Bảng' });
    if (userId === board.ownerId.toString()) return res.status(400).json({ message: 'Không thể xóa chủ sở hữu' });

    board.members = board.members.filter(memberId => memberId.toString() !== userId);

    if (board.lists && board.lists.length > 0) {
        board.lists.forEach(list => {
            if (list.cards && list.cards.length > 0) {
                list.cards.forEach(card => {
                    if (card.members && card.members.includes(userId)) {
                        card.members = card.members.filter(
                            m => m.toString() !== userId
                        );
                    }
                });
            }
        });
    }

    await board.save();

    await createLog({
    userId: req.user._id,          
    boardId: board._id,
    entityId: userId,             
    entityType: 'USER',
    action: 'REMOVE_MEMBER',
    content: `xóa thành viên ${removedUser?.fullName || removedUser?.email || 'không xác định'} khỏi bảng "${board.title}"`
  });

    const io = req.app.get('socketio');
    if (io) {
      io.to(id).emit('BOARD_UPDATED', { 
          action: 'REMOVE_MEMBER_BOARD',
          message: 'Danh sách thành viên bảng đã thay đổi'
      });
  }
    const updatedBoard = await Board.findById(id)
      .populate('members', 'fullName email avatar') 
      .populate('ownerId', 'fullName email avatar');
    res.json(updatedBoard);
    try {
      const newNoti = await NotificationService.create({
        recipientId: userId,
        senderId: board.ownerId,
        type: "DELETED_FROM_BOARD",
        title: "Bị xóa khỏi bảng",
        message: `Bạn đã bị xóa khỏi Bảng ${board.title}`,
        targetUrl: `/board/${id}`,
      });

      const io = req.app.get('socketio');
      if (io) {
        io.to(userId).emit('NEW_NOTIFICATION', newNoti);
      }

    } catch (err) {
      console.error("Notification error:", err.message);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const boards = await Board.find({ 
      members: req.user._id 
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    let upcomingDeadlines = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    boards.forEach(board => {
      if (board.lists && board.lists.length > 0) {
        board.lists.forEach(list => {
          if (list.cards && list.cards.length > 0) {
            list.cards.forEach(card => {
              totalTasks++;

              if (card.isCompleted) {
                completedTasks++;
              } else {
                inProgressTasks++;

                if (card.dueDate) {
                    const deadline = new Date(card.dueDate);
                    if (deadline < now) {
                        overdueTasks++;
                    } else {
                        upcomingDeadlines.push({
                            taskId: card._id,
                            taskTitle: card.title,
                            boardId: board._id,
                            deadline: deadline,
                            projectName: board.title
                        });
                    }
                }
              }
            });
          }
        });
      }
    });

    upcomingDeadlines.sort((a, b) => a.deadline - b.deadline);
    const topUpcoming = upcomingDeadlines.slice(0, 5);

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      upcomingDeadlines: topUpcoming
    });

  } catch (error) {
    console.error("Lỗi getDashboardStats:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};


export const getAllUpcomingTasks = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id });
    
    let allDeadlines = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    boards.forEach(board => {
      if (board.lists?.length > 0) {
        board.lists.forEach(list => {
          if (list.cards?.length > 0) {
            list.cards.forEach(card => {
              if (!card.isCompleted && card.dueDate) {
                const deadline = new Date(card.dueDate);
                allDeadlines.push({
                    taskId: card._id,
                    taskTitle: card.title,
                    boardId: board._id,
                    boardTitle: board.title,
                    deadline: deadline,
                    isOverdue: deadline < now 
                });
              }
            });
          }
        });
      }
    });

    allDeadlines.sort((a, b) => a.deadline - b.deadline);

    res.json(allDeadlines);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch trình' });
  }
};