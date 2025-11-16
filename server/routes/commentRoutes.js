import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        boardId: {
            type: Schema.Types.ObjectId,
            ref: 'Board',
            required: true,
        },
        cardId: {
            type: Schema.Types.ObjectId,
            ref: 'Card',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        edited: {
            type: Boolean,
            default: false,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Comment = model('Comment', commentSchema);

export default Comment;
