import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const BoardSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  lists: [ListSchema], 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BoardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Board = model('Board', BoardSchema);

export default Board;
