import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boardId: { type: String, required: true, ref: 'Board' }, 
  entityId: { type: String, required: true },
  entityType: { 
    type: String, 
    enum: ['BOARD', 'LIST', 'CARD', 'COMMENT', 'MEMBER'], 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['CREATE', 'UPDATE', 'DELETE', 'MOVE', 'ADD_MEMBER', 'REMOVE_MEMBER'], 
    required: true 
  },
  content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('ActivityLog', ActivityLogSchema);