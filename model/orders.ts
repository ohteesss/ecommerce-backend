import mongoose, { Schema, model, Document } from "mongoose";
import User, { UserType } from "./user";
import Product from "./product";
import AppError from "../utils/appError";

export interface OrderItem {
  product: typeof mongoose.Schema.ObjectId;
  seller: typeof mongoose.Schema.ObjectId;
  quantity: number;
}
export interface Order extends Document {
  user: string | UserType;
  name: string;
  email: string;
  campus: typeof mongoose.Schema.ObjectId;
  order_items: OrderItem[];
  shipping_address: string;
  // payment_method: string;
  items_price: number;
  shipping_price?: number;
  total_price: number;
  status: "pending" | "escrow_hold" | "completed" | "cancelled" | "disputed";
  created_at: Date;
  paid_at: Date;
  updated_at: Date;
}

const orderSchema = new Schema<Order>({
  user: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus",
  },
  order_items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  shipping_address: {
    type: String,
    required: true,
  },
  // payment_method: {
  //   type: String,
  //   required: true,
  // },
  items_price: {
    type: Number,
    required: true,
  },
  shipping_price: {
    type: Number,
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
  created_at: {
    type: Date,
  },
  paid_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function () {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
});

orderSchema.pre("save", async function (this, next) {
  if (this.user) {
    const user = await User.findById(this.user);
    if (!user) return next(new AppError("User not found", 404));
    this.name = user?.name;
    this.email = user?.email;
    this.campus = user?.campus;
  }
});

orderSchema.pre("save", async function () {
  const order = this as Order;
  if (order.status === "escrow_hold") {
    order.paid_at = new Date();
  }

  // on complete order reduce the stock of the product
  // if (order.status === "escrow_hold") {
  if (order.status === "pending") {
    order.order_items.forEach(async (item) => {
      const product = await Product.findById(item.product)
        .select("stock")
        .lean();
      if (product) {
        await Product.findByIdAndUpdate(item.product, {
          quantity: product.quantity - item.quantity,
        });
      }
    });
  }
  if (order.status === "cancelled") {
    order.order_items.forEach(async (item) => {
      const product = await Product.findById(item.product)
        .select("stock")
        .lean();
      if (product) {
        await Product.findByIdAndUpdate(item.product, {
          quantity: product.quantity + item.quantity,
        });
      }
    });
  }
});

const Order = model<Order>("Order", orderSchema);

export default Order;
