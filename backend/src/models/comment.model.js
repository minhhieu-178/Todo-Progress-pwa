import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = model('Comment', CommentSchema);

export default CommentSchema;
