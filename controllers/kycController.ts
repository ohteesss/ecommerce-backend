import { NextFunction, Response } from "express";
import KYC from "../model/kyc";
import asyncHandler from "../utils/asyncHandler";
import { AppRequest } from "../types";
import { deleteOne, getAll, getOne } from "./handlerFactory";
import User from "../model/user";
import AppError from "../utils/appError";

export const createKYC = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    if (req.user?.KYCStatus === "APPROVED") {
      return next(new AppError("You are already approved", 400));
    }

    req.body.user = req.user?.id;
    if (!req.body.campus) {
      req.body.campus = req.user?.campus;
    }
    const kyc = await KYC.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        kyc,
      },
    });
  }
);

export const getKYCs = getAll(KYC, ["user", "brand_name"]);

export const getKYC = getOne(KYC, undefined, "user");

export const updateKYCStatus = asyncHandler(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    if (!req.body.status) {
      return next(new AppError("Please provide status", 400));
    }

    console.log(req.body);

    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        updated_at: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      status: `KYC Status updated to ${req.body.status}`,
      data: {
        kyc,
      },
    });
  }
);

export const deleteKYC = deleteOne(KYC, "KYC");
