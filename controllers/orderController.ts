import { NextFunction, Response } from "express";
import Campus from "../model/campus";
import Order, { OrderItem } from "../model/orders";
import Product, { ProductType } from "../model/product";
import { AppRequest } from "../types";
import AppError from "../utils/appError";
import asyncHandler from "../utils/asyncHandler";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory";

export const addUserInReq = (
  req: AppRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.params.userId) {
    req.query.user = req.params.userId;
  }
  next();
};

export const getSellerOrders = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    console.log(req.user);
    const orders = await Order.find({
      order_items: { $elemMatch: { seller: req.params.userId } },
    });
    const filteredOrder = orders.map((order) => {
      order.order_items = order.order_items.filter(
        (item) => item.seller.toString() === req.params.userId
      );
    });
    console.log(filteredOrder);

    res.status(200).json({
      status: "success",
      data: {
        data: orders,
      },
    });
  }
);

export const getOrders = getAll(Order);

export const getOrder = getOne(Order);

export const updateOrder = updateOne(Order);

export const deleteOrder = deleteOne(Order);

// export const getShippingFee = asyncHandler(
//   async (req: AppRequest, res: Response, next: NextFunction) => {
//     const campusId = req.body.campus;
//     const { productId } = req.params;
//     const campus = await Campus.findById(campusId);
//     if (!campus) {
//       next(new AppError("Campus not found", 404));
//     }
//     const product = await Product.findById(productId).select("shipping");
//     if (!product) {
//       next(new AppError("Product not found", 404));
//     }

//     const shippingFee = product?.shipping.find(
//       (ship) => ship.campus === campusId
//     )?.price;
//     res.status(200).json({
//       status: "success",
//       data: {
//         shippingFee: product?.shipping,
//       },
//     });
//   }
// );
export const createOrder = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { order_items, shipping_address } = req.body;

    let shipping_price = 0;

    console.log(req.user);

    if (!req.user?._id) {
      if (!req.body.name || !req.body.email) {
        next(new AppError("Please provide name, email", 400));
      }
      if (!req.body.campus) {
        next(new AppError("Please provide campus", 400));
      }
      if (!(await Campus.findById(req.body.campus))) {
        next(new AppError("Campus not found", 404));
      }
    }
    console.log(order_items);
    let orderItemsPopulated: { product: ProductType; quantity: number }[] = [];
    try {
      orderItemsPopulated = await Promise.all(
        order_items.map(async (item: OrderItem) => {
          const product = await Product.findById(item.product);
          console.log(product);
          if (!product) {
            throw new AppError("Product not found", 404);
          }
          return { ...item, product };
        })
      );
    } catch (err: any) {
      return next(new AppError(err.message, 400));
    }

    console.log(orderItemsPopulated);

    const order_items_with_seller = orderItemsPopulated.map(
      (item: { product: ProductType; quantity: number }) => {
        return {
          product: item.product._id,
          seller: item.product.user,
          quantity: item.quantity,
        };
      }
    );

    // calculation for shipping fee

    // const sellers = [...new Set(products)];
    // const groupedProductsBySellers: { [key: string]: string[] } = {};
    // sellers.forEach((seller) => {
    //   groupedProductsBySellers[seller.toString()] = orderItemsPopulated.filter(
    //     (item: OrderItem) => item.product === seller
    //   );
    // });

    // console.log(groupedProductsBySellers);

    if (order_items && order_items.length === 0) {
      next(new AppError("No order items", 400));
    }

    // check if order items are available
    const isAvailable = orderItemsPopulated.every((item) => {
      console.log(item.product.quantity, item.quantity);
      return item.product.quantity >= +item.quantity;
    });
    if (!isAvailable) {
      next(new AppError("Some items are not available", 400));
    }

    // itemsPrice

    const items_price = orderItemsPopulated
      .map((item) => {
        return { price: item.product.actual_price, quantity: item.quantity };
      })
      .reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

    console.log(items_price);

    const total_price = items_price + shipping_price;
    const order = await Order.create({
      order_items: order_items_with_seller,
      user: req.user?._id || undefined,
      name: req.body.name,
      email: req.body.email,
      campus: req.body.campus,
      shipping_address: "shipping_address",

      items_price,
      total_price,
    });

    res.status(201).json({
      status: "success",
      data: {
        data: order,
      },
    });
  }
);
