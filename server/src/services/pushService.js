import webPush from 'web-push';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Cần import Model User để xóa sub lỗi

dotenv.config();

webPush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@example.com', // Fallback nếu chưa set env
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushToUser = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        return;
    }

    // Lọc các subscription trùng endpoint để tránh spam
    const uniqueSubscriptions = [];
    const endpoints = new Set();
    
    for (const sub of user.pushSubscriptions) {
      if (!endpoints.has(sub.endpoint)) {
        endpoints.add(sub.endpoint);
        uniqueSubscriptions.push(sub);
      }
    }

    const notifications = uniqueSubscriptions.map(sub => {
      return webPush.sendNotification(sub, JSON.stringify(payload))
        .catch(async (err) => {
          // Nếu subscription không còn hiệu lực (người dùng đã clear cache hoặc gỡ browser)
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log('Subscription expired, removing endpoint:', sub.endpoint);
            // Xóa sub hỏng khỏi DB
            await User.findByIdAndUpdate(userId, {
                $pull: { pushSubscriptions: { endpoint: sub.endpoint } }
            });
          } else {
            console.error('Push error:', err);
          }
        });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error sending push to user:', error);
  }
};