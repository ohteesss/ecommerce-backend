import { Router } from "express";
import {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
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
  .patch(protect, restrictTo("admin"), updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

export default categoryRouter;
