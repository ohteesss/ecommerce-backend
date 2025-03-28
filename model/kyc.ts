import mongoose, { model, Query, Schema } from "mongoose";
import User from "./user";

export interface KYCType {
  user: typeof mongoose.Schema.ObjectId;
  document_type: string;
  document_image: string;
  brand_name?: string;
  brand_description?: string;
  brand_logo?: string;
  phone: string;
  campus: typeof mongoose.Schema.ObjectId;
  status?: "SUBMITTED" | "APPROVED" | "REJECTED";
  created_at: Date;
  updated_at: Date;
}

const kycSchema = new Schema<KYCType>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  document_type: {
    type: String,
    required: true,
  },
  document_image: {
    type: String,
    required: true,
  },
  brand_name: {
    type: String,
  },
  brand_description: {
    type: String,
  },
  brand_logo: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus",
    required: true,
  },
  status: {
    type: String,
    enum: ["SUBMITTED", "APPROVED", "REJECTED"],
    default: "SUBMITTED",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

kycSchema.post("save", async function (doc: KYCType) {
  console.log(doc);
  await User.findByIdAndUpdate(doc.user, { KYCStatus: "SUBMITTED" });
});

kycSchema.post(/findOneAndUpdate/, async function (doc, next) {
  console.log(doc);
  if (doc.status !== "APPROVED") return next();
  await User.findByIdAndUpdate(doc.user, {
    KYCStatus: "APPROVED",
    brand_description: doc.brand_description,
    brand_logo: doc.brand_logo,
    username: doc.brand_name,
    roles: ["user", "seller"],
    phone: doc.phone,
    campus: doc.campus,
  });
});

const KYC = model<KYCType>("KYC", kycSchema);

export default KYC;
