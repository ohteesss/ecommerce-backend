import { Router } from "express";
import authRouter from "./authRoutes";
import productRouter from "./productRoutes";
import userRouter from "./userRoutes";
import categoryRouter from "./categoryRoutes";
import reviewRouter from "./reviewRoutes";
import orderRouter from "./orderRoutes";
import campusRouter from "./campusRoutes";
import KYCRouter from "./kycRoutes";

const router = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/user", userRouter);
router.use("/api/v1/products", productRouter);
router.use("/api/v1/categories", categoryRouter);
router.use("/api/v1/reviews", reviewRouter);
router.use("/api/v1/orders", orderRouter);
router.use("/api/v1/campus", campusRouter);
router.use("/api/v1/kyc", KYCRouter);

export default router;
