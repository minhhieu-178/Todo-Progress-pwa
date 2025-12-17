import Board from '../models/Board.js';
import mongoose from 'mongoose';
import { createLog } from '../services/logService.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { v2 as cloudinary } from 'cloudinary';
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

    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'CREATE_CARD',
        message: `Thẻ "${title}" đã được tạo mới`
      });
    }
    

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

    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
          action: 'REMOVE_MEMBER_CARD',
          cardId: cardId
      });
  }
    if (req.user._id.toString() !== userId.toString()) {
      try {
        const actorName = req.user.fullName || req.user.email;
        const io = req.app.get('socketio');
        
        const newNoti = await NotificationService.create({
            recipientId: userId,
            senderId: req.user._id,
            type: "REMOVE_MEMBER_FROM_CARD",
            title: "Bạn bị xóa khỏi thẻ",
            message: `${actorName} đã xóa bạn khỏi thẻ "${card.title}"`,
            targetUrl: `/board/${board._id}?cardId=${cardId}`,
            metadata: { boardId, cardId }
        });

        if (io) {
            const notiPayload = newNoti.toObject ? newNoti.toObject() : newNoti;
            io.to(userId.toString()).emit('NEW_NOTIFICATION', notiPayload);
        }
      } catch (error) {
         console.error("Lỗi gửi thông báo removeMemberFromCard:", error.message);
      }
    }

    res.status(200).json({ message: "Xóa thành viên thành công", card });
  } catch (error) {
    console.error("Lỗi removeMemberFromCard:", error);
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
    const updatedBoard = await Board.findOneAndUpdate(
      {
        _id: boardId,
        "lists._id": listId,
        "lists.cards._id": cardId,
        members: req.user._id 
      },
      {
        $addToSet: { "lists.$[list].cards.$[card].members": userId }
      },
      {
        arrayFilters: [{ "list._id": listId }, { "card._id": cardId }],
        new: true 
      }
    );

    if (!updatedBoard) {
      return res.status(404).json({ message: 'Không tìm thấy Bảng/Thẻ hoặc bạn không có quyền.' });
    }

    let targetCard = null;
    for (const list of updatedBoard.lists) {
      if (list._id.toString() === listId) {
        targetCard = list.cards.find(c => c._id.toString() === cardId);
        break;
      }
    }

    if (targetCard) {

      const io = req.app.get('socketio');
      if (io) {
          io.to(boardId).emit('BOARD_UPDATED', { 
              action: 'ADD_MEMBER_CARD',
              cardId: cardId
          });
      }
      
      if (req.user._id.toString() !== userId.toString()) {
        try {
          const actorName = req.user.fullName || req.user.email;
          
          const newNoti = await NotificationService.create({
            recipientId: userId,
            senderId: req.user._id,
            type: "ADDED_TO_CARD",
            title: "Bạn được thêm vào thẻ",
            message: `${actorName} đã thêm bạn vào thẻ "${targetCard.title}"`,
            targetUrl: `/board/${boardId}?cardId=${cardId}`,
            metadata: { boardId, cardId }
          });

          const io = req.app.get('socketio');
          if (io) {
              const notiData = newNoti.toObject ? newNoti.toObject() : newNoti;
              
              io.to(userId.toString()).emit('NEW_NOTIFICATION', notiData);
              console.log(`Socket sent to user ${userId}`);
          }

        } catch (err) {
          console.error("Notification/Socket error:", err.message);
        }
      }

      return res.status(200).json({
        message: "Thêm thành viên thành công",
        card: targetCard
      });
    }

    return res.status(404).json({ message: 'Lỗi không xác định khi lấy thẻ.' });

  } catch (error) {
    console.error("Lỗi addMemberToCard:", error);
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
    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'UPDATE_CARD',
        cardId: cardId,
        message: 'Thông tin thẻ đã thay đổi'
      });
    }
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

    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', { 
        action: 'DELETE_CARD',
        message: 'Một thẻ vừa bị xóa'
      });
    }

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

      const sourceList = board.lists.id(sourceListId);
    const destList = board.lists.id(destListId);
    if (!sourceList || !destList) return res.status(404).json({ message: 'Lỗi dữ liệu List' });

    const card = sourceList.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Thẻ' });

    const cardData = card.toObject(); 

    sourceList.cards.pull(cardId);


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

    await board.save();

    const io = req.app.get('socketio');
    if (io) {
        io.to(boardId).emit('BOARD_UPDATED', { 
            message: 'Danh sách thẻ đã thay đổi',
            action: 'MOVE_CARD'
        });
    }

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

export const uploadAttachment = async (req, res) => {
  const { boardId, listId, cardId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Chưa chọn file để upload' });
  }

  const fixedName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });

    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ message: 'Không tìm thấy List' });

    const card = list.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Card' });

    const newAttachment = {
      name: fixedName,
      url: req.file.path,          
      publicId: req.file.filename,
      type: req.file.mimetype,
    };

    card.attachments.push(newAttachment);
    await board.save();

    const savedAttachment = card.attachments[card.attachments.length - 1];

    const io = req.app.get('socketio');
    const actorName = req.user.fullName || req.user.email;

    const notificationPromises = card.members.map(async (memberId) => {
        if (memberId.toString() !== req.user._id.toString()) {
            
            const noti = await NotificationService.create({
                recipientId: memberId,
                senderId: req.user._id,
                type: "ATTACHMENT", 
                title: "Tệp đính kèm mới",
                message: `${actorName} đã đính kèm "${newAttachment.name}" vào thẻ "${card.title}"`,
                targetUrl: `/board/${boardId}?cardId=${cardId}`,
                metadata: { boardId, cardId, fileUrl: newAttachment.url }
            });

            if (io) {
                io.to(memberId.toString()).emit('NEW_NOTIFICATION', noti);
            }
        }
    });

    await Promise.all(notificationPromises);

    if (io) {
        io.to(boardId).emit('BOARD_UPDATED', {
            action: 'UPLOAD_ATTACHMENT',
            cardId: cardId,
            message: 'Có tệp mới được tải lên'
        });
    }

    res.status(200).json(savedAttachment);

  } catch (error) {
    console.error("Lỗi upload attachment:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const deleteAttachment = async (req, res) => {
  const { boardId, listId, cardId, attachmentId } = req.params;

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Không tìm thấy Bảng' });
    
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const list = board.lists.id(listId);
    const card = list.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Không tìm thấy Thẻ' });

    const attachment = card.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Không tìm thấy tệp đính kèm' });

    if (attachment.publicId) {
       let resourceType = 'raw';
       if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
           resourceType = 'image';
       } else if (attachment.type.startsWith('video/')) {
           resourceType = 'video';
       }

       await cloudinary.uploader.destroy(attachment.publicId, { 
           resource_type: resourceType 
       });
    }

    card.attachments.pull(attachmentId);
    await board.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(boardId).emit('BOARD_UPDATED', {
        action: 'DELETE_ATTACHMENT',
        cardId: cardId,
        message: 'Đã xóa tệp đính kèm'
      });
    }

    res.status(200).json({ message: 'Xóa tệp thành công', attachmentId });

  } catch (error) {
    console.error("Lỗi xóa attachment:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};