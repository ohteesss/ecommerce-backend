import { Request, Response } from "express";
import Category from "../model/category";
import asyncHandler from "../utils/asyncHandler";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find();
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  }
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  }
);
