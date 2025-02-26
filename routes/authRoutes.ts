import { Router } from "express";
import {
  forgetPassword,
  login,
  protect,
  register,
  registerSeller,
  resetPassword,
  sendOTP,
  testing,
  updatePassword,
  verifySignup,
} from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", register, sendOTP);

authRouter.post("/register/seller", registerSeller, register);

authRouter.post("/verify", verifySignup);

authRouter.post("/login", login);

authRouter.post("/forget-password", forgetPassword);

authRouter.post("/reset-password/:token", resetPassword);

authRouter.post("/update-password", protect, updatePassword);

authRouter.post("/test", testing);

export default authRouter;
