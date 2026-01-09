import Notification from "../models/Notification.js";
import { sendPushToUser } from "./pushService.js";
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
    const pushPayload = {
        title: title,
        body: message,
        url: targetUrl,
        type: type
    };
    
    // Gửi push cho người nhận (không dùng await để không làm chậm request chính)
    sendPushToUser(recipientId, pushPayload);
    return noti;
  }
}

export default new NotificationService();
