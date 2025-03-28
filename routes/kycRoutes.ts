import { Router } from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  createKYC,
  getKYC,
  getKYCs,
  updateKYCStatus,
} from "../controllers/kycController";

const KYCRouter = Router();

KYCRouter.route("/")
  .get(protect, restrictTo("admin"), getKYCs)
  .post(protect, restrictTo("user"), createKYC);

KYCRouter.route("/:id")
  .get(protect, restrictTo("admin"), getKYC)
  .patch(protect, restrictTo("admin"), updateKYCStatus);

export default KYCRouter;
