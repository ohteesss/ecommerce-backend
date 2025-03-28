import mongoose, { Schema, Document, model, Query } from "mongoose";
import { Review } from "./review";
import slugify from "slugify";

export interface ProductType extends Document {
  name: string;
  slug: string;
  price: number;
  discount: number;
  // actual_price = price - discount
  actual_price: number;
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
  campus: typeof mongoose.Schema.ObjectId;
  ratingsQuantity: number;
  ratingsAverage: number;
}

const productSchema = new Schema<ProductType>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
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
    campus: {
      type: mongoose.Schema.ObjectId,
      ref: "Campus",
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
productSchema.virtual("actual_price").get(function (this: ProductType) {
  return this.price - (this.discount || 0);
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "Product",
  localField: "_id",
});

productSchema.pre("save", async function (next) {
  let slug = slugify(this.name, { lower: true });
  if ((await Product.find({ slug }).countDocuments()) > 0) {
    this.slug = `${slug}-${
      (await Product.find({ slug }).countDocuments()) + 1
    }`;
  } else {
    this.slug = slug;
  }
  next();
});

productSchema.pre(
  /^find/,
  function (this: Query<ProductType, ProductType>, next) {
    this.populate({
      path: "category",
      select: "name",
    });

    this.populate({
      path: "user",
      select: "username",
    });
    next();
  }
);

productSchema.pre("save", function (next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
  next();
});

const Product = model<ProductType>("Product", productSchema);

export default Product;
