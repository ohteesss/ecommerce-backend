import mongoose, { Schema, model } from "mongoose";

type Esrow = {
  order_id: typeof mongoose.Schema.ObjectId;
  seller_id: typeof mongoose.Schema.ObjectId;
  buyer_id: typeof mongoose.Schema.ObjectId;
  amount: number;
  status: "held" | "released" | "disputed";
  created_at: Date;
  updated_at: Date;
};

const escrowSchema = new Schema<Esrow>({
  order_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
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
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "held",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default model<Esrow>("Escrow", escrowSchema);
