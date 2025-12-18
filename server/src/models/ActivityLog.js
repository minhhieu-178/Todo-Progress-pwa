import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityType: { 
    type: String, 
    enum: ['BOARD', 'LIST', 'CARD', 'COMMENT', 'MEMBER'], 
    required: true 
  },
  action: { 
    type: String, 
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'MOVE', 
      'ADD_MEMBER', 'REMOVE_MEMBER',
      'CREATE_CARD', 'UPDATE_CARD', 'DELETE_CARD', 
      'COMMENT_CREATE', 'COMMENT_UPDATE', 'COMMENT_DELETE',
      'MENTION'
    ],
    required: true 
  },
  content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('ActivityLog', ActivityLogSchema);