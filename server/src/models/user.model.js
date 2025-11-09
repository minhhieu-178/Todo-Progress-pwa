import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {   
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,   
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  pushSubscriptions: [
    {
      endpoint: String,
      keys: { 
        p256dh: String,
        auth: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = model('User', UserSchema);

export default User;
