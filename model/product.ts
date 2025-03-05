import mongoose, { Schema, Document, model, Query } from "mongoose";
import { Review } from "./review";

export interface Product extends Document {
  name: string;
  price: number;
  discount: number;
  description: string;
  specifications: string[];
  images: string[];
  category: typeof mongoose.Schema.ObjectId;
  user: typeof mongoose.Schema.ObjectId;
  quantity: number;
  type: "product" | "service";
  created_at: Date;
  updated_at: Date;
  reviews: Review[];
  ratingsQuantity: number;
  ratingsAverage: number;
}

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
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
    specifications: {
      type: [String],
      required: true,
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals
productSchema.virtual("actual_price").get(function (this: Product) {
  return this.price - (this.discount || 0);
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "Product",
  localField: "_id",
});

productSchema.pre(/^find/, function (this: Query<Product, Product>, next) {
  this.populate({
    path: "category",
    select: "name",
  });

  this.populate({
    path: "user",
    select: "username",
  });
  next();
});

productSchema.pre("save", function (next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
  next();
});

const Product = model<Product>("Product", productSchema);

export default Product;
