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
  // --- SỬA: Lấy thêm description, dueDate, isCompleted từ body ---
  const { title, description, dueDate, members, isCompleted } = req.body;

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

    // --- SỬA: Cập nhật các trường mới ---
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description; // Lưu mô tả
    if (dueDate !== undefined) card.dueDate = dueDate;             // Lưu deadline
    if (isCompleted !== undefined) card.isCompleted = isCompleted; // Lưu trạng thái hoàn thành
    if (members !== undefined) card.members = members;

    await board.save();
    
    // Trả về card đã update
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



export const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { boardId, sourceListId, destListId, newPosition } = req.body;

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    // 1. Tìm List nguồn và List đích
    const sourceList = board.lists.id(sourceListId);
    const destList = board.lists.id(destListId);
    if (!sourceList || !destList) return res.status(404).json({ message: 'Lỗi dữ liệu List' });

    // 2. Tìm Card trong List nguồn
    const cardToMove = sourceList.cards.id(cardId);
    if (!cardToMove) return res.status(404).json({ message: 'Không tìm thấy Thẻ' });

    // 3. CLONE dữ liệu thẻ sang dạng Object thường (QUAN TRỌNG)
    const cardData = cardToMove.toObject(); 

    // 4. Xóa thẻ ở nguồn
    sourceList.cards.pull(cardId);

    // 5. Chèn thẻ vào đích
    const insertIndex = (newPosition !== undefined && newPosition !== null) 
                        ? newPosition 
                        : destList.cards.length;
    
    destList.cards.splice(insertIndex, 0, cardData);

    // 6. Lưu
    await board.save();

    res.status(200).json({ message: 'Di chuyển thành công' });
  } catch (error) {
    console.error("Move Card Error:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};