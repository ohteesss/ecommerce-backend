import mongoose, { Document, Schema, model } from "mongoose";

export interface Chat extends Document {
  seller_id: typeof mongoose.Schema.ObjectId;
  buyer_id: typeof mongoose.Schema.ObjectId;
  message: string;
  created_at: Date;
}

const chatSchema = new Schema<Chat>({
  seller_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  buyer_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default model<Chat>("Chat", chatSchema);
