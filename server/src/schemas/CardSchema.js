import mongoose from 'mongoose';

// LƯU Ý: Đây là Schema, KHÔNG PHẢI Model
const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
    },
    position: {
      type: Number,
      required: true,
    },
    // Gán thành viên cho thẻ (tham chiếu đến User)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true } // Tự động thêm createdAt/updatedAt cho Card
);

export default CardSchema;