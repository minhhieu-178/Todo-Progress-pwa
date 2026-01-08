import ActivityLog from '../models/ActivityLog.js';

export const createLog = async ({ userId, boardId, entityId, entityType, action, content }) => {
  try {
    await ActivityLog.create({
      userId,
      boardId,
      entityId,
      entityType,
      action,
      content
    });
  } catch (error) {
    console.error("Lỗi ghi log:", error);
  }
};

export const getLogsByBoard = async (boardId, limit = 50) => {
  return await ActivityLog.find({ boardId })
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 }) 
    .limit(limit);
};

export const getLogsByUser = async (userId, limit = 50) => {
  return await ActivityLog.find({ userId })
    .populate('userId', 'fullName email') // Populate thông tin người dùng
    .populate('boardId', 'title')         // Populate tên bảng để hiển thị
    .sort({ createdAt: -1 })
    .limit(limit);
};