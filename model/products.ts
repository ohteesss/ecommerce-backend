import mongoose, { Schema, Document, model } from "mongoose";

export interface Product extends Document {
  name: string;
  actual_price: number;
  price: number;
  discount: number;
  description: string;
  specifications: string[];
  images: string[];
  category_id: typeof mongoose.Schema.ObjectId;
  quantity: number;
  type: "product" | "service";
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<Product>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  actual_price: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
    default: "product",
  },
  description: {
    type: String,
    required: true,
  },
  specifications: [String],
  images: [String],
  category_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default model<Product>("Product", productSchema);
