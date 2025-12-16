import Board from '../models/Board.js';
import mongoose from 'mongoose';
import { createLog } from '../services/logService.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';

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

export const removeMemberFromCard = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Thiếu userId" });
  }
  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember)
      return res.status(403).json({ message: "Bạn không có quyền cập nhật Card trong Bảng này" });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: "Không tìm thấy List" });

    const card = list.cards.id(cardId);
    if (!card) return res.status(404).json({ message: "Không tìm thấy Card" });

    const inCard = card.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!inCard) {
      return res.status(400).json({ message: "User không nằm trong Card" });
    }
    card.members = card.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await board.save();

    if (req.user._id.toString() !== userId.toString()) {
      await NotificationService.create({
        recipientId: userId,
        senderId: req.user._id,
        type: "REMOVE_MEMBER_FROM_CARD",
        title: "Bạn bị xóa khỏi thẻ",
        message: `${req.user.name || req.user.email} đã xóa bạn khỏi thẻ "${card.title}"`,
        targetUrl: `/board/${board._id}`, 
      });
  }

    res.status(200).json({ message: "Xóa thành viên thành công", card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const addMemberToCard = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Thiếu userId' });
  }
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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    const alreadyInCard = card.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (alreadyInCard) {
      return res.status(400).json({ message: 'User đã có trong Card' });
    }

    card.members.push(userId);
    await board.save();


    if (req.user._id.toString() !== userId.toString()) {
      const user = await User.findById(userId); 
      
      await NotificationService.create({
        recipientId: userId,                 
        senderId: req.user._id,               
        type: "ADDED_TO_CARD",
        title: "Bạn được thêm vào thẻ",
        message: `${req.user.fullName || req.user.email} đã thêm bạn vào thẻ "${card.title}"`,
        targetUrl: `/board/${boardId}` 
      });
  }

    return res.status(200).json({
      message: "Thêm thành viên thành công",
      card
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


export const updateCard = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
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

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;             
    if (isCompleted !== undefined) card.isCompleted = isCompleted; 
    if (members !== undefined) card.members = members;

    await board.save();
    
    await board.populate({
      path: 'lists.cards.members', 
      select: 'fullName email avatar' 
    });
    const populatedList = board.lists.id(listId);
    const populatedCard = populatedList.cards.id(cardId);

    res.status(200).json(populatedCard);
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
    const card = sourceList.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Thẻ' });

    // 3. Clone dữ liệu thẻ (giữ nguyên _id và các thông tin khác)
    const cardData = card.toObject(); 

    // 4. Xóa thẻ khỏi nguồn
    sourceList.cards.pull(cardId);

    // 5. Chèn thẻ vào đích tại vị trí mới
    // Đảm bảo vị trí chèn hợp lệ (không vượt quá độ dài mảng)
    const insertIndex = (newPosition !== undefined && newPosition !== null) 
                        ? Math.min(newPosition, destList.cards.length) 
                        : destList.cards.length;
    
    destList.cards.splice(insertIndex, 0, cardData);

    const updateCardPositions = (list) => {
        list.cards.forEach((c, index) => {
            c.position = index; 
        });
    };

    if (sourceListId === destListId) {
        updateCardPositions(sourceList); 
    } else {
        updateCardPositions(sourceList);
        updateCardPositions(destList);
    }

    // 6. Lưu vào Database
    await board.save();

    // 7. Ghi Log
    let logContent;
    if (sourceListId === destListId) {
        logContent = `đã sắp xếp lại vị trí thẻ "${cardData.title}" trong danh sách "${sourceList.title}"`;
    } else {
        logContent = `đã di chuyển thẻ "${cardData.title}" từ "${sourceList.title}" sang "${destList.title}"`;
    }

    try {
        await createLog({
            userId: req.user._id,
            boardId: board._id,
            entityId: cardId,
            entityType: 'CARD',
            action: 'MOVE',     
            content: logContent 
        });
    } catch (logErr) {
        console.warn("Lỗi ghi log (không ảnh hưởng thao tác chính):", logErr.message);
    }
    
    res.status(200).json({ message: 'Di chuyển thành công' });

  } catch (error) {
    console.error("Move Card Error:", error);
    res.status(500).json({ message: 'Lỗi máy chủ: ' + error.message });
  }
};