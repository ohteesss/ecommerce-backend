import { NextFunction } from "express";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";
import { AppRequest } from "../types";
import Order from "../model/orders";
import User from "../model/user";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory";

export const getOrders = getAll(Order);

export const getOrder = getOne(Order);

export const updateOrder = updateOne(Order);

export const deleteOrder = deleteOne(Order);

export const createOrder = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    if (!req.user?.id) {
      const newUser = await User.create(
        {
          name: req.body.name,
          email: req.body.email,
          campus: req.body.campus,
        },
        {
          runValidators: false,
        }
      );
      req.user = newUser[0];
    }

    if (orderItems && orderItems.length === 0) {
      next(new AppError("No order items", 400));
    }

    const order = await Order.create({
      orderItems,
      user: req.user?._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    res.status(201).json({
      status: "success",
      data: {
        data: order,
      },
    });
  }
);
