import mongoose from 'mongoose';
import CardSchema from './Card.js'; 

const { Schema, model } = mongoose;

const ListSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: Number,
    default: 1
  },
  cards: [CardSchema], 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const List = model('List', ListSchema);

export default List;
