import { Router } from "express";
import {
  checkUser,
  createProduct,
  filterCreateProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { protect, restrictTo } from "../controllers/authController";
import reviewRouter from "./reviewRoutes";

const productRouter = Router();

productRouter.use("/:productId/reviews", reviewRouter);

productRouter
  .route("/")
  .get(getProducts)
  .post(
    protect,
    restrictTo("seller", "admin"),
    filterCreateProduct,
    createProduct
  );

productRouter
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("seller", "admin"), checkUser, updateProduct)
  .delete(protect, restrictTo("seller", "admin"));

export default productRouter;
