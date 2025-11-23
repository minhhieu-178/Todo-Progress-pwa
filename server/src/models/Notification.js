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
      enum: ['COMMENT', 'ASSIGN', 'DEADLINE'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    read: { type: Boolean, default: false },
    metadata: { 
      boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
      cardId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);