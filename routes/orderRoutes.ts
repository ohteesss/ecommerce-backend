import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
} from "../controllers/orderController";
import { protect } from "../controllers/authController";

const OrderRouter = Router();

OrderRouter.route("/").get(protect, getOrders).post(createOrder);

OrderRouter.use(protect);

OrderRouter.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

export default OrderRouter;
