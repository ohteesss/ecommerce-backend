import { Router } from "express";
import authRouter from "./authRoutes";
import productRouter from "./productRoutes";
import userRouter from "./userRoutes";

const router = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/user", userRouter);
router.use("/api/v1/products", productRouter);

export default router;
