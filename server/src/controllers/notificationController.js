import Notification from "../models/Notification.js";

export const getUserNotifications = async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification
    .find({ recipientId: userId })
    .sort({ createdAt: -1 });

  res.json(notifications);
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  res.json(updated);
};

export const markAllRead = async (req, res) => {
  const userId = req.user._id;
  await Notification.updateMany({ recipientId: userId }, { isRead: true });
  res.json({ success: true });
};
