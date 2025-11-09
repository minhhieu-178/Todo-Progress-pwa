import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  boardId: {
    type: Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },

  cardId: {
    type: String, 
    required: true,
  },
  content: { 
    type: String,
    required: true
  },
},
    {
    timestamps: true, 
    collection: "comments", 
  }
);

const Comment = model('Comment', CommentSchema);

export default Comment;
