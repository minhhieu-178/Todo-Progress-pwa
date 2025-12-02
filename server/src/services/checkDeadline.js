import Card from '../models/Card.js';
import Notification from '../models/Notification.js';

export const checkDeadlines = async (userId = null) => {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000); 

  const query = {
    isCompleted: false,
    dueDate: { $lte: soon, $gte: now }
  };
  if (userId) query.members = userId;

  const cards = await Card.find(query).select('title dueDate members');

  const notifications = [];
  for (const card of cards) {
    for (const memberId of card.members) {
      // nếu check riêng cho user, chỉ tạo 1 notification
      if (userId && memberId.toString() !== userId) continue;

      const notif = await Notification.create({
        user: memberId,
        type: 'DEADLINE_SOON',
        message: `Card "${card.title}" sắp hết hạn!`,
        card: card._id
      });
      notifications.push(notif);
    }
  }

  return notifications;
};
