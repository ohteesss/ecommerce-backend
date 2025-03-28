import Campus from "../model/campus";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const createCampus = createOne(Campus);
export const getCampuses = getAll(Campus);
export const getCampus = getOne(Campus);
export const updateCampus = updateOne(Campus);
export const deleteCampus = deleteOne(Campus);
