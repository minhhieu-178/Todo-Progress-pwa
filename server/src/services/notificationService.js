import Notification from "../models/Notification.js";

class NotificationService {
  async create({ recipientId, senderId, type, title, message, targetUrl, metadata }) {
    const noti = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      targetUrl,
      metadata,
    });
    return noti;
  }
}

export default new NotificationService();
