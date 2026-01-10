import mongoose from 'mongoose';
import ListSchema from '../schemas/ListSchema.js';

const BoardSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lists: [ListSchema],
    background: { 
      type: String, 
      default: '#f9fafb' 
    },
  },
  { timestamps: true, _id: false }
);

const Board = mongoose.model('Board', BoardSchema);
export default Board;