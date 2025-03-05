import { Router } from "express";
import authRouter from "./authRoutes";
import productRouter from "./productRoutes";
import userRouter from "./userRoutes";
import categoryRouter from "./categoryRoutes";
import reviewRouter from "./reviewRoutes";

const router = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/user", userRouter);
router.use("/api/v1/products", productRouter);
router.use("/api/v1/categories", categoryRouter);
router.use("/api/v1/reviews", reviewRouter);

export default router;
