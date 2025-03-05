import { NextFunction, Response } from "express";
import Order, { OrderItem, Order as OrderType } from "../model/orders";
import Review, { Review as ReviewType } from "../model/review";
import { AppRequest } from "../types";
import AppError from "../utils/appError";
import asyncHandler from "../utils/asyncHandler";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";
import { UserType } from "../model/user";

export const setProductUserId = (
  req: AppRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(req.params);
  if (!req.body.user) req.body.user = req.user?._id;
  if (!req.body.product) req.body.product = req.params.productId;

  next();
};
// check if user has bought the product
export const reviewValidation = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const order = await Order.find({
      user: req.user?._id,
      status: { $ne: "pending" },
    }).select("order_items");

    if (
      order &&
      order[0].order_items.map((ord) => ord.product).includes(req.body.product)
    ) {
      next();
    } else {
      next(
        new AppError(
          "You can't review a product unless you completely order the product",
          403
        )
      );
    }
  }
);

export const createReview = createOne<ReviewType>(Review);
export const checkUser = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const review = await Review.findById(req.params.id).select("user");

    if (req.user?.role === "admin") next();
    if (req.user?.id !== (review?.user as unknown as UserType).id)
      next(new AppError("You can not update a review that is not yours", 403));

    next();
  }
);

export const updateReview = updateOne<ReviewType>(Review, "Review");

export const deleteReview = deleteOne<ReviewType>(Review, "Review");

export const getAllReviews = getAll<ReviewType>(Review, ["name"], "Reviews");

export const getReview = getOne<ReviewType>(Review, [""], "Review");
