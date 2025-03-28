import { Router } from "express";
import {
  addUserInReq,
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  getSellerOrders,
  updateOrder,
} from "../controllers/orderController";
import { getUserFromToken, protect } from "../controllers/authController";

const orderRouter = Router({ mergeParams: true });

orderRouter
  .route("/")
  .get(protect, addUserInReq, getOrders)
  .post(getUserFromToken, createOrder);

// orderRouter.route("/:productId/shipping").get(getShippingFee);

orderRouter.use(protect);

orderRouter.route("/seller/:userId").get(getSellerOrders);

orderRouter.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

export default orderRouter;
