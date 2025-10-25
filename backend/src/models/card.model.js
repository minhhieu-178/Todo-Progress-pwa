import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CardSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: " "
  },
  dueDate: {
    type: Date
  },
  position: {
    type: Number,
    default: 1
  },
  comments: [CommentSchema], 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Card = model('Card', CardSchema);

export default Card;
