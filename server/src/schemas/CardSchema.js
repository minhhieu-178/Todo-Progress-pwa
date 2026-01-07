import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    position: { type: Number, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isCompleted: { type: Boolean, default: false },
    labels: [{ type: String }],
    
    attachments: [{
      name: String,       
      url: String,        
      publicId: String,  
      
      type: { type: String },       
      
      uploadedAt: { type: Date, default: Date.now }
    }],
    
  },
  { timestamps: true, _id: false }
);

export default CardSchema;