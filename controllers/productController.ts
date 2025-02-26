import { NextFunction, Response } from "express";
import { AppRequest } from "../types";
import asyncHandler from "../utils/asyncHandler";
import Product from "../model/products";
import APIFeatures from "../utils/apiFeature";

export const createProduct = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const newProduct = await Product.create({
      name: req.body.name,
      description: req.body.description,
      specifications: req.body.specifications,
      price: req.body.price,
      category: req.body.category,
      type: req.body.type,
      seller: req.user!.id,
    });
    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  }
);

export const getProducts = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const products = new APIFeatures(Product.find(), req.query);
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  }
);
