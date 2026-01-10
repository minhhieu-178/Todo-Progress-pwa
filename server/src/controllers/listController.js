import Board from '../models/Board.js';
import { createLog } from '../services/logService.js';
// @desc    Tạo List mới
// @route   POST /api/boards/:boardId/lists
export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, position,_id } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu tiêu đề List' });
    if (!_id) {
     return res.status(400).json({ message: 'Thiếu ID list (Client generation required)' });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    // Kiểm tra quyền thành viên
    if (!board.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const newPosition = position ?? board.lists.length;
    const newList = { _id:_id,title: title.trim(), position: newPosition, cards: [] };

    board.lists.push(newList);
    await board.save();

    const createdList = board.lists[board.lists.length - 1];

    await createLog({
      userId: req.user._id,
      boardId: board._id,
      entityId: createdList._id,
      entityType: 'LIST',
      action: 'CREATE',
      content: `đã thêm danh sách mới: "${title}"`,
      isOfflineSync: req.isOfflineReplay
    });
    
    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'CREATE_LIST',
        message: `Danh sách "${title}" đã được tạo`
      });
    }
    res.status(201).json(board.lists[board.lists.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật List (Đổi tên, sắp xếp lại)
// @route   PUT /api/boards/:boardId/lists/:listId
export const updateList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, position } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    if (!board.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    if (title) list.title = title.trim();
    if (position !== undefined) list.position = position;

    await board.save();
    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'UPDATE_LIST',
        message: 'Cấu trúc danh sách đã thay đổi'
      });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa List
// @route   DELETE /api/boards/:boardId/lists/:listId
export const deleteList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    if (!board.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });
    
    const listTitle = list.title;
    // Xóa list khỏi mảng
    board.lists.pull(listId);
    
    await board.save();

    await createLog({
      userId: req.user._id,
      boardId: boardId,
      entityId: listId,
      entityType: 'LIST',
      action: 'DELETE',
      content: `đã xóa danh sách "${listTitle}"`,
      isOfflineSync: req.isOfflineReplay
    });
    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'DELETE_LIST',
        message: 'Một danh sách đã bị xóa'
      });
    }
    res.json({ message: 'Đã xóa danh sách thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { newPosition } = req.body;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Board' });

    if (!board.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    board.lists.sort((a, b) => a.position - b.position);

    const currentIndex = board.lists.findIndex(l => l._id.toString() === listId);
    if (currentIndex === -1) return res.status(404).json({ message: 'Không tìm thấy List cần chuyển' });

    const listTitle = board.lists[currentIndex].title;

    const [movedList] = board.lists.splice(currentIndex, 1);
    board.lists.splice(newPosition, 0, movedList);

    board.lists.forEach((list, index) => {
      list.position = index;
    });

    await board.save();

    await createLog({
      userId: req.user._id,
      boardId: boardId,
      entityId: listId,
      entityType: 'LIST',
      action: 'MOVE_LIST',
      content: `đã thay đổi vị trí danh sách "${listTitle}"`,
      isOfflineSync: req.isOfflineReplay
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'MOVE_LIST',
        message: 'Thứ tự danh sách đã thay đổi'
      });
    }

    res.json(board.lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};