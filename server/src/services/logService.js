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