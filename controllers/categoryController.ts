import Category, { Category as CategoryType } from "../model/category";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const createCategory = createOne<CategoryType>(Category);

export const getCategories = getAll<CategoryType>(Category, [
  "-description -created_at -updated_at",
]);

export const getCategory = getOne<CategoryType>(Category, ["-__v"], "category");

export const updateCategory = updateOne<CategoryType>(Category);

export const deleteCategory = deleteOne<CategoryType>(Category);
