import mongoose, {
  Document,
  HydratedDocument,
  Query,
  Schema,
  model,
} from "mongoose";
import Product from "./product";
import { Model } from "mongoose";

export interface Review extends Document {
  product: typeof mongoose.Schema.ObjectId;
  user: typeof mongoose.Schema.ObjectId;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

interface ReviewModel extends Model<Review> {
  calcAverageRatings(productId: typeof mongoose.Schema.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<Review>({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "Review must belong to a product"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  rating: {
    type: Number,
    min: [1, "Rating must be above 1"],
    max: [5, "Rating must be below 5"],
    required: true,
  },
  comment: {
    type: String,
    required: [true, "Review must have a comment"],
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

// index

// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre("save", function (next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
  next();
});

reviewSchema.post("save", function (this: HydratedDocument<Review>) {
  this.updated_at = new Date();
});

reviewSchema.pre(/^find/, function (this: Query<Review, Review>, next) {
  // this.populate({
  //   path: "product",
  //   select: "name ",
  // });
  this.populate({
    path: "user",
    select: "name username photo",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  // const stats = await this.aggregate([
  //   {
  //     $match: { product: productId },
  //   },
  //   {
  //     $group: {
  //       _id: "$product",
  //       ratingsQuantity: {
  //         $sum: 1,
  //       },
  //       ratingsAverage: {
  //         $avg: "$rating",
  //       },
  //     },
  //   },
  // ]);

  // if (stats.length > 0) {
  //   await Product.findByIdAndUpdate(productId, {
  //     ratingsQuantity: stats[0].ratingsQuantity,
  //     ratingsAverage: stats[0].ratingsAverage,
  //   });
  // } else {
  //   await Product.findByIdAndUpdate(productId, {
  //     ratingsQuantity: 0,
  //     ratingsAverage: 4.5,
  //   });
  // }
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        ratingsQuantity: {
          $sum: 1,
        },
        ratingsAverage: {
          $avg: "$rating",
        },
      },
    },
  ]);

  return console.log(stats);

  // if (stats.length > 0) {
  //   await Product.findByIdAndUpdate(productId, {
  //     ratingsQuantity: stats[0].ratingsQuantity,
  //     ratingsAverage: stats[0].ratingsAverage,
  //   });
  // } else {
  //   await Product.findByIdAndUpdate(productId, {
  //     ratingsQuantity: 0,
  //     ratingsAverage: 4.5,
  //   });
  // }
};

reviewSchema.post("save", function (this: HydratedDocument<Review>) {
  (this.constructor as ReviewModel).calcAverageRatings(this.product);
});

reviewSchema.pre(
  /^findOneAnd/,
  async function (this: Query<Review, Review> & { r: unknown }, next) {
    this.r = await this.findOne();
    next();
  }
);

reviewSchema.post(
  /findOneAnd/,
  async function (this: Query<Review, Review> & { r: Review }) {
    (this.r.constructor as ReviewModel).calcAverageRatings(this.r.product);
  }
);

export default model<Review>("Review", reviewSchema);
