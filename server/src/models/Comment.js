import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boardId: { type: String, ref: 'Board', required: true },
    cardId: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;