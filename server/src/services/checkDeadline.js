import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';

export const checkDeadlines = async (io) => {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const soonVN = new Date(nowVN.getTime() + 60 * 60 * 1000);

  const boards = await Board.find({}, 'lists.cards.title lists.cards.dueDate lists.cards.members lists.cards.isCompleted');

  const notifications = [];

  for (const board of boards) {
    if (!board.lists) continue; 
    
    for (const list of board.lists) {
      if (!list.cards) continue;

      for (const card of list.cards) {
        if (card.isCompleted) continue; 
        if (!card.dueDate || card.dueDate < nowVN || card.dueDate > soonVN) continue;

        for (const memberId of card.members) {
          try {
            const notif = await NotificationService.create({
              recipientId: memberId,
              senderId: "692b01acf7b1ebc930ad697e", // 
              type: 'DEADLINE',
              title: 'Nhắc nhở deadline',
              message: `Thẻ "${card.title}" sắp hết hạn!`,
              targetUrl: `/board/${board._id}?cardId=${card._id}`,
              metadata: {
                boardId: board._id,
                listId: list._id,
                cardId: card._id,
                dueDate: card.dueDate,
              },
            });
            
            notifications.push(notif);

            if (io) {
                io.to(memberId.toString()).emit('NEW_NOTIFICATION', notif);
                console.log(`Đã gửi socket deadline tới user ${memberId}`);
            }
          } catch (err) {
            console.error("Lỗi tạo noti deadline:", err);
          }
        }
      }
    }
  }

  return notifications;
};