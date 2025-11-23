import mongoose from 'mongoose';
import ListSchema from '../schemas/ListSchema.js';

const BoardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lists: [ListSchema],
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', BoardSchema);
export default Board;