import mongoose, { Document, Schema, model } from "mongoose";

export interface Review extends Document {
  product_id: typeof mongoose.Schema.ObjectId;
  user_id: typeof mongoose.Schema.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<Review>({
  product_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "Review must belong to a product"],
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, "Review must have a comment"],
  },
});
