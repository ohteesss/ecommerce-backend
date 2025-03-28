import { NextFunction, Response } from "express";
import Category from "../model/category";
import Product, { ProductType as ProductType } from "../model/product";
import { AppRequest } from "../types";
import AppError from "../utils/appError";
import asyncHandler from "../utils/asyncHandler";
import filterBody from "../utils/filterBody";
import { createOne, getAll, getOne, updateOne } from "./handlerFactory";
import path from "path";

const productFields: Array<keyof ProductType> = [
  "name",
  "price",
  "discount",
  "description",
  "specifications",
  "images",
  "category",
  "user",
  "campus",
  "quantity",
  "type",
];

export const filterCreateProduct = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    console.log(req.user);
    req.body.user = req.user?.id;
    req.body.campus = req.user?.campus;
    const categories = await Category.findById(req.body.category);
    if (!categories) return next(new AppError("Category not found", 404));

    req.body = filterBody(req.body, ...productFields);

    console.log(req.body);
    next();
  }
);

export const createProduct = createOne<ProductType>(Product);

export const getProducts = getAll<ProductType>(Product, [
  "name",
  "price",
  "images",
  "quantity",
  "ratingsAverage",
]);

export const getProduct = getOne<ProductType>(Product, undefined, "Product", {
  path: "category user",
  select: "name",
});

export const checkUser = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (req.user?.id !== product?.user)
      next(new AppError("You can not update a product that is not yours", 403));

    next();
  }
);

export const updateProduct = updateOne<ProductType>(Product);
