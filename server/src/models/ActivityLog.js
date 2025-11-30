import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    boardId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Board', 
      required: true 
    },
    entityId: { 
      type: mongoose.Schema.Types.ObjectId 
    },
    entityType: { 
      type: String, 
      enum: ['CARD', 'LIST', 'BOARD', 'COMMENT'],
      default: 'CARD'
    },
    action: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);