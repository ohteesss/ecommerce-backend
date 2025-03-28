import { Router } from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  getAllUsers,
  getMe,
  getUser,
  updateMe,
} from "../controllers/userController";
import orderRouter from "./orderRoutes";

const userRouter = Router();

userRouter.use(protect);
userRouter.route("/me").get(getMe).patch(updateMe);
userRouter.route("/:id").get(getUser);

userRouter.use("/:userId/orders", orderRouter);
userRouter.route("/").get(restrictTo("admin"), getAllUsers);

export default userRouter;
