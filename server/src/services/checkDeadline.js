import Board from '../models/Board.js';
import NotificationService from '../services/notificationService.js';
import { sendPushToUser } from '../services/pushService.js'; // Import hàm push

export const checkDeadlines = async (io) => {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const soonVN = new Date(nowVN.getTime() + 60 * 60 * 1000);

  // Lấy các trường cần thiết
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
            // 1. Tạo Notification trong DB
            const notif = await NotificationService.create({
              recipientId: memberId,
              senderId: "692b01acf7b1ebc930ad697e", // System ID
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

            // 2. Gửi qua Socket.io (Realtime nếu đang online)
            if (io) {
                io.to(memberId.toString()).emit('NEW_NOTIFICATION', notif);
            }

            // 3. Gửi Web Push (Hiện thông báo kể cả khi tắt tab)
            const pushPayload = {
                title: 'Deadline Sắp Đến!',
                body: `Thẻ "${card.title}" sắp hết hạn. Hãy kiểm tra ngay!`,
                url: `/board/${board._id}?cardId=${card._id}`, // Link để SW mở khi click
                type: 'DEADLINE'
            };
            
            // Gọi hàm push bất đồng bộ (không cần await để tránh block vòng lặp)
            sendPushToUser(memberId, pushPayload);

          } catch (err) {
            console.error("Lỗi xử lý deadline cho member:", memberId, err);
          }
        }
      }
    }
  }
  
  if (notifications.length > 0) {
      console.log(`Đã tạo ${notifications.length} thông báo deadline.`);
  }

  return notifications;
};