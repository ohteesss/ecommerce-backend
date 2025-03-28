import { NextFunction, Response } from "express";
import { AppRequest } from "../types";
import asyncHandler from "../utils/asyncHandler";
import User, { UserType } from "../model/user";
import AppError from "../utils/appError";
import { getAll } from "./handlerFactory";

export const getMe = asyncHandler(async (req: AppRequest, res: Response) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

export const updateMe = asyncHandler(async (req: AppRequest, res: Response) => {
  const updateFields = ["name", "username", "photo", "brand_photo"] as Array<
    keyof UserType
  >;
  //   remove all fields that are not allowed to be updated from req.body
  Object.keys(req.body).forEach((field) => {
    if (!updateFields.includes(field as keyof UserType)) {
      delete req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const getUser = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const user_id = req.params.id;
    const { name, username } = req.query;
    let user: UserType | null = null;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (name) {
      user = await User.findOne({
        name: name as string,
      });
    } else if (username) {
      user = await User.findOne({
        username: username as string,
      });
    }
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const getAllUsers = getAll(User, ["name verified username"]);
