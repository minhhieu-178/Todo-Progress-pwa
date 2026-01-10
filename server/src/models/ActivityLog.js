import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boardId: { type: String, ref: 'Board', required: false },
  entityId: { type: String, required: true },
  entityType: { 
    type: String, 
    enum: ['BOARD', 'LIST', 'CARD', 'USER', 'COMMENT', 'MEMBER'], 
    required: true 
  },
  action: { 
    type: String, 
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'MOVE', 
      'ADD_MEMBER', 'REMOVE_MEMBER', 'CREATE_BOARD', 'DELETE_BOARD',
      'ADD_MEMBER_TO_CARD', 'REMOVE_MEMBER_FROM_CARD', 
      'CREATE_CARD', 'UPDATE_CARD', 'DELETE_CARD', 'MOVE_LIST',
      'UPLOAD_ATTACHMENT', 'DELETE_ATTACHMENT',
      'COMMENT_CREATE', 'COMMENT_UPDATE', 'COMMENT_DELETE',
      'MENTION'
    ],
    required: true 
  },
  content: { type: String, required: true },
  isOfflineSync: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ActivityLog', ActivityLogSchema);