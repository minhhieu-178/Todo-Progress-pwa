import mongoose from 'mongoose';
import CardSchema from './CardSchema.js';

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    position: { type: Number, required: true },
    cards: [CardSchema],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default ListSchema;