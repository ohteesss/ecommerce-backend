import { Router } from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  getAllUsers,
  getMe,
  getUser,
  updateMe,
} from "../controllers/userController";
import OrderRouter from "./orderRoutes";

const userRouter = Router();

userRouter.route("/:id").get(getUser);

userRouter.use(protect);
userRouter.use("/:userId/orders", OrderRouter);
userRouter.route("/me").get(getMe).patch(updateMe);
userRouter.route("/").get(restrictTo("admin"), getAllUsers);

export default userRouter;
