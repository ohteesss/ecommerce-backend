import argon2 from "argon2";
import mongoose, { Document, Query, Schema, model } from "mongoose";
import {
  ALLOWED_LOGIN_ATTEMPTS,
  OTP_EXPIRY,
  TIME_TO_NEXT_ATTEMPT,
} from "../constant";
import cryptoUpdate from "../utils/cryptoUpdate";
import { Review } from "./review";

export interface UserType extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  roles: ["admin" | "user" | "seller" | "delivery"];
  photo: string;

  campus: typeof mongoose.Schema.ObjectId;
  brand_logo: string;
  brand_description: string;
  phone: string;

  isBrand: boolean;
  KYCStatus?: "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
  wallet_balance: string;
  passwordResetToken?: string;
  verificationOTP?: string;
  failedAttempt?: number;
  timeForNextAttempt?: Date;
  passwordResetExpires?: Date;
  OTPexpires?: Date;
  password_changed_at: Date;
  created_at: Date;
  updated_at: Date;
  createVerificationToken: () => Promise<string>;
  createPasswordResetToken: () => string;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  correctPassword: (
    userPassword: string,
    candidatePassword: string
  ) => Promise<boolean>;
  incorrectLogin: () => Promise<number>;
}

const userSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must not be less than 8 characters"],
    maxlength: [20, "Password must not be more than 20 characters"],
    select: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  roles: {
    type: [String],
    enum: ["admin", "user", "seller", "delivery"],
    required: true,
    default: ["user"],
  },
  campus: {
    type: mongoose.Schema.ObjectId,
    ref: "Campus",
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  brand_logo: {
    type: String,
    default: "default.jpg",
  },
  brand_description: {
    type: String,
  },
  phone: {
    type: String,
  },

  isBrand: {
    type: Boolean,
    required: true,
    default: false,
  },
  wallet_balance: {
    type: String,
    required: true,
    default: "0",
    select: false,
  },
  KYCStatus: {
    type: String,
    enum: ["NOT_SUBMITTED", "SUBMITTED", "APPROVED", "REJECTED"],
    default: "NOT_SUBMITTED",
  },
  verificationOTP: String,
  passwordResetToken: String,
  failedAttempt: Number,
  timeForNextAttempt: Date,
  OTPexpires: Date,
  passwordResetExpires: Date,
  password_changed_at: Date,
  created_at: Date,
  updated_at: Date,
});

userSchema.pre("save", async function (next) {
  const user = this;

  // Set created_at and updated_at timestamps
  if (user.isNew) {
    user.created_at = new Date();
    user.username = user.name
      .toLowerCase()
      .replace(/\s/g, "-")
      .concat(Date.now().toString().slice(-4));
  }
  user.updated_at = new Date();

  if (user.isModified("password")) {
    user.password = await argon2.hash(user.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 2,
    });
    user.password_changed_at = new Date(Date.now() - 1000);
  }
  next();
});

// userSchema.pre(/find/, function (this: Query<Review, Review>, next) {
//   this.populate({
//     path: "campus",
//     select: "name",
//   });
//   next();
// });

userSchema.methods.createVerificationToken = function () {
  const OTP = `${Math.floor(Math.random() * 1000000)}`.padStart(6, "0");

  this.verificationOTP = cryptoUpdate(OTP);
  this.OTPexpires = Date.now() + OTP_EXPIRY;

  return OTP;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = cryptoUpdate(Date.now().toString());
  this.passwordResetToken = cryptoUpdate(resetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.correctPassword = async function (
  userPassword: string,
  candidatePassword: string
) {
  console.log(userPassword, candidatePassword);
  console.log(await argon2.verify(userPassword, candidatePassword));
  return await argon2.verify(userPassword, candidatePassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < changedTimeStamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.incorrectLogin = async function () {
  let failedAttempt = (this.failedAttempt || 0) + 1;
  if (failedAttempt === ALLOWED_LOGIN_ATTEMPTS) {
    this.timeForNextAttempt = Date.now() + TIME_TO_NEXT_ATTEMPT;
    failedAttempt = 0;
  }
  this.failedAttempt = failedAttempt;

  return this.failedAttempt;
};

const User = model<UserType>("User", userSchema);

export default User;
