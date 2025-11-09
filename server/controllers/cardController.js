import Board from '../models/Board.js';
import mongoose from 'mongoose';

/**
 * @desc   Tạo 1 Card mới trong List
 * @route  POST /api/boards/:boardId/lists/:listId/cards
 * @access Protected
 */
export const createCard = async (req, res) => {
  const { title } = req.body;
  const { boardId, listId } = req.params;

  if (!title) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề cho Card' });
  }

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember)
      return res.status(403).json({ message: 'Bạn không có quyền tạo Card trong Bảng này' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    const newCard = {
      _id: new mongoose.Types.ObjectId(),
      title,
      position: list.cards.length,
      members: [],
    };

    list.cards.push(newCard);
    await board.save();

    res.status(201).json(newCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};



/**
 * @desc   Cập nhật Card (title, members, v.v)
 * @route  PUT /api/boards/:boardId/lists/:listId/cards/:cardId
 * @access Protected
 */
export const updateCard = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { title, members } = req.body;

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember)
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật Card trong Bảng này' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    const card = list.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Card' });

    if (title) card.title = title;
    if (members) card.members = members;

    await board.save();
    res.status(200).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};



/**
 * @desc   Xóa Card khỏi List
 * @route  DELETE /api/boards/:boardId/lists/:listId/cards/:cardId
 * @access Protected
 */
export const deleteCard = async (req, res) => {
  const { boardId, listId, cardId } = req.params;

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember)
      return res.status(403).json({ message: 'Bạn không có quyền xóa Card trong Bảng này' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    const card = list.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Card' });

    // Xóa card khỏi mảng cards
    card.deleteOne();

    await board.save();
    res.status(200).json({ message: 'Đã xóa Card thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};




// @desc    Di chuyển một Card (thay đổi List hoặc vị trí trong List)
// @route   PUT /api/cards/:cardId/move
// @access  Protected
export const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { boardId, sourceListId, destListId, newPosition } = req.body;

  try {
    // 1. Tìm Board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    }

    // 2. Kiểm tra user có phải là thành viên không
    const isMember = board.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Bạn không có quyền di chuyển Thẻ trong Bảng này' });
    }

    // 3. Tìm List nguồn và List đích
    const sourceList = board.lists.id(sourceListId);
    const destList = board.lists.id(destListId);
    if (!sourceList || !destList) {
      return res.status(404).json({ message: 'Không tìm thấy List nguồn hoặc đích' });
    }

    // 4. Lấy Card cần di chuyển
    const cardToMove = sourceList.cards.id(cardId);
    if (!cardToMove) {
      return res.status(404).json({ message: 'Không tìm thấy Thẻ trong List nguồn' });
    }

    // 5. Xóa Card khỏi List nguồn
    sourceList.cards.pull(cardId);

    // 6. Thêm Card vào List đích (theo vị trí mới)
    // newPosition có thể là vị trí được truyền từ frontend
    const cardObject = cardToMove.toObject(); // Chuyển thành object thuần túy
    destList.cards.splice(newPosition ?? destList.cards.length, 0, cardObject);

    // 7. Cập nhật lại position cho tất cả Card trong cả hai List
    sourceList.cards.forEach((c, index) => (c.position = index));
    destList.cards.forEach((c, index) => (c.position = index));

    // 8. Lưu thay đổi
    await board.save();

    res.status(200).json({ message: 'Di chuyển Thẻ thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
