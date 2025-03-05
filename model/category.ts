import { Document, Schema, Model, model } from "mongoose";

export interface Category extends Document {
  name: string;
  description: string;
  images: [string];
  created_at: Date;
  updated_at: Date;
}

const categorySchema = new Schema<Category>({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  images: {
    type: [String],
  },
  description: {
    type: String,
    required: true,
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

categorySchema.pre("save", function (next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
  next();
});

export default model<Category>("Category", categorySchema);
