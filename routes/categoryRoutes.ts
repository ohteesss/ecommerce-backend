import { Router } from "express";
import {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController";
import { protect, restrictTo } from "../controllers/authController";

const categoryRouter = Router();

categoryRouter
  .route("/")
  .get(getCategories)
  .post(protect, restrictTo("admin"), createCategory);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .patch(protect, restrictTo("admin"), updateCategory);
