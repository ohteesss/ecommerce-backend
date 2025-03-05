import { Router } from "express";
import {
  reviewValidation,
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setProductUserId,
  updateReview,
  checkUser,
} from "../controllers/reviewController";
import { protect, restrictTo } from "../controllers/authController";

const reviewRouter = Router({ mergeParams: true });

reviewRouter.route("/").get(getAllReviews).post(
  protect,
  restrictTo("user"),
  setProductUserId,
  // reviewValidation,
  createReview
);

reviewRouter
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), checkUser, updateReview)
  .delete(protect, restrictTo("user", "admin"), checkUser, deleteReview);

export default reviewRouter;
