import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    source: {
      boardId: {
        type: Schema.Types.ObjectId,
        ref: "Board",
      },
      cardId: {
        type: String,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "notifications",
  }
);

const Notification = model("Notification", NotificationSchema);

export default Notification;
