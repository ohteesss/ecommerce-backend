import { Router } from "express";
import {
  forgetPassword,
  login,
  protect,
  register,
  registerSeller,
  resendOTP,
  resetPassword,
  sendOTP,
  testing,
  updatePassword,
  verifySignup,
} from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", register, sendOTP);

authRouter.post("/send-otp", resendOTP);

authRouter.post("/verify", verifySignup);

authRouter.post("/login", login);

authRouter.post("/forget-password", forgetPassword);

authRouter.post("/reset-password/:token", resetPassword);

authRouter.post("/update-password", protect, updatePassword);

authRouter.post("/test", testing);

export default authRouter;
