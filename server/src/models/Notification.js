import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { 
      type: String,
      enum: ['COMMENT', 'ASSIGN', 'DEADLINE','ADDED_TO_BOARD','DELETED_FROM_BOARD','ADDED_TO_CARD', 'REMOVE_MEMBER_FROM_CARD', 'ATTACHMENT'],
      required: true,
    },
    targetUrl: { type: String },
    title: { type: String, required: true },
    message: { type: String },
    read: { type: Boolean, default: false },
    metadata: { 
      boardId: { type: String, ref: 'Board' },
      cardId: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);