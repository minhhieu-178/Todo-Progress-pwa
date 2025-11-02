import mongoose from 'mongoose';
import CardSchema from './CardSchema.js'; // Import schema Card

// LƯU Ý: Đây là Schema, KHÔNG PHẢI Model
const ListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: Number,
      required: true,
    },
    // Nhúng mảng các Card
    cards: [CardSchema],
  },
  { timestamps: true }
);

export default ListSchema;