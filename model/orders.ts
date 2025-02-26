import { Schema, model, Document } from "mongoose";

export interface Order extends Document {
  user: string;
  order_items: string[];
  shipping_address: string;
  payment_method: string;
  items_price: number;
  shipping_price: number;
  total_price: number;
  status: "pending" | "escrow_hold" | "completed" | "cancelled";
  paid_at: Date;
  updated_at: Date;
}

const orderSchema = new Schema<Order>({
  user: {
    type: String,
    required: true,
  },
  order_items: [String],
  shipping_address: {
    type: String,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  items_price: {
    type: Number,
    required: true,
  },
  shipping_price: {
    type: Number,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    required: true,
    default: "pending",
  },
  paid_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default model<Order>("Order", orderSchema);
