import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import asyncHandler from "../utils/asyncHandler";
import Email from "../utils/email";
import AppError from "../utils/appError";
import argon2 from "argon2";

import User, { UserType as UserType } from "../model/user";
import mongoose from "mongoose";
import cryptoUpdate from "../utils/cryptoUpdate";
import { AppRequest } from "../types";
import { ALLOWED_LOGIN_ATTEMPTS } from "../constant";
import filterBody from "../utils/filterBody";
const signToken = (id: typeof mongoose.Schema.ObjectId) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT_SECRET or JWT_EXPIRES_IN is not defined in .env file");
  }
  console.log(parseInt(process.env.JWT_EXPIRES_IN, 10));
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10),
  });
};

const createSendToken = (user: UserType, statusCode: number, res: Response) => {
  const token = signToken(user._id as typeof mongoose.Schema.ObjectId);
  const cookieOptions = {
    expires: new Date(
      //eslint-disable-next-line
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!, 10)
    ),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: {
        name: user.name,
        email: user.email,
        roles: user.roles,
        kycStatus: user.KYCStatus,
        campus: user.campus,
        username: user.username,
      },
    },
  });
};

export const registerSeller = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    req.body.role = "seller";
    const signupPayload = ["name", "email", "password", "role", "campus"];

    if (req.body.role === "admin") {
      return next(new AppError("You cannot create an admin user", 401));
    }
    const newUser = await User.create(filterBody(req.body, ...signupPayload));
    req.user = newUser;
    next();
  }
);

export const register = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const signupPayload = ["name", "email", "password", "campus"];

    const newUser = await User.create(filterBody(req.body, ...signupPayload));
    req.user = newUser;
    next();
  }
);

export const resendOTP = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError(
          "User doesnt exist, Check your email address and try again!",
          404
        )
      );
    }
    if (user!.verified) {
      return next(new AppError("User has been verified!", 403));
    }
    req.user = user;
    sendOTP(req, res, next);
  }
);

export const sendOTP = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const OTP = await req.user!.createVerificationToken();
    try {
      await new Email(req.user!, "").emailOTPNotification(OTP);

      await req.user!.save({ validateBeforeSave: false });

      res.status(201).json({
        status: "success",
        message: "OTP sent successfully",
      });
    } catch (err) {
      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  }
);

export const verifySignup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body;
    const encryptedOTP = cryptoUpdate(otp);
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError(
          "User doesnt exist, Check your email address and try again!",
          404
        )
      );
    }
    if (user.verified) {
      return next(new AppError("User has been verified!", 403));
    }
    if (encryptedOTP !== user.verificationOTP) {
      return next(new AppError("Wrong OTP!", 404));
    }
    if (user.OTPexpires!.getTime() < Date.now()) {
      return next(new AppError("OTP has expired, try again!", 404));
    }
    user.verified = true;
    user.OTPexpires = undefined;
    user.verificationOTP = undefined;
    await user.save({ validateBeforeSave: false });
    createSendToken(user, 201, res);
  }
);

export const testing = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to the protected route",
    });
  }
);

export const login = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
    // 2) Check if user exists
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    if (!user) {
      return next(
        new AppError(
          "User doesn't exist, Check your email address and try again!",
          404
        )
      );
    }
    // 3) Check if user is verified
    req.user = user;
    if (!user.verified) {
      sendOTP(req as AppRequest, res, next);
    }
    //  If time for next attempt is greater than now

    if (
      user.timeForNextAttempt &&
      user.timeForNextAttempt.getTime() > Date.now()
    ) {
      return next(
        new AppError(
          `You have to wait for ${
            (user.timeForNextAttempt.getTime() - Date.now()) / 1000
          } seconds before you can attempt login again!`,
          403
        )
      );
    }
    // 4) Incorrect login detials reduce login Attempt
    if (user && !(await user.correctPassword(user.password, password))) {
      const failedAttempt = await user.incorrectLogin();
      await user.save({ validateBeforeSave: false });
      if (failedAttempt > 2) {
        return next(
          new AppError(
            `You have ${ALLOWED_LOGIN_ATTEMPTS - failedAttempt} attempts left`,
            401
          )
        );
      } else {
        return next(new AppError(`Incorrect email or password. `, 401));
      }
    }
    // 5) If everything is ok, send token to client
    createSendToken(user, 200, res);
  }
);

export const protect = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it exists
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select(
      "+wallet_balance"
    );
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist",
          401
        )
      );
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat!)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  }
);

export const getUserFromToken = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next();
    }

    // 2) Verification token

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select(
      "+wallet_balance"
    );
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist",
          401
        )
      );
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat!)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  }
);

export const restrictTo = (
  ...roles: Array<"user" | "admin" | "seller" | "delivery">
) => {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    if (!roles.some((role) => req.user!.roles.includes(role))) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const forgetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError("There is no user with this email address.", 404)
      );
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).emailPasswordResetToken();

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = cryptoUpdate(req.params.token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    // 2) If token has not expired, and there is user, set the new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // // 3) Update changedPasswordAt property for the user
    // user.password_changed_at = new Date(Date.now() - 1000);
    await user.save();
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  }
);

export const updatePassword = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user = await User.findById(req.user!.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !user ||
      !(await user.correctPassword(user.password, req.body.password_current))
    ) {
      return next(new AppError("Your password is wrong.", 401));
    }
    // 3) If so, update password
    user.password = req.body.password;
    // user.password_changed_at = new Date(Date.now() - 1000);
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  }
);
