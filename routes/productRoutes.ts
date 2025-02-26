import { Router } from "express";
import { createProduct, getProducts } from "../controllers/productController";
import { protect, restrictTo } from "../controllers/authController";

const productRouter = Router();

productRouter
  .route("/")
  .get(getProducts)
  .post(protect, restrictTo("seller", "admin"), createProduct);

export default productRouter;
