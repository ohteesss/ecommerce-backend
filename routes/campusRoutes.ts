import { Router } from "express";
import {
  createCampus,
  deleteCampus,
  getCampus,
  getCampuses,
  updateCampus,
} from "../controllers/campusController";
import { protect, restrictTo } from "../controllers/authController";

const campusRouter = Router();

campusRouter
  .route("/")
  .get(getCampuses)
  .post(protect, restrictTo("admin"), createCampus);

campusRouter.use(protect);

campusRouter
  .route("/:id")
  .get(getCampus)
  .patch(updateCampus)
  .delete(deleteCampus);

export default campusRouter;
