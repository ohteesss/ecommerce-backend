import { Model, PopulateOptions } from "mongoose";
import asyncHandler from "../utils/asyncHandler";

import APIFeatures from "../utils/apiFeature";
import AppError from "../utils/appError";

export function deleteOne<T>(Model: Model<T>, modelName?: string) {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No ${modelName || "document"} with that id`, 404)
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

export function updateOne<T>(Model: Model<T>, modelName?: string) {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      next(new AppError(`No ${modelName || "document"} with that id`, 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

export function createOne<T>(Model: Model<T>) {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

export function getOne<T>(
  Model: Model<T>,
  select?: string[],
  modelName?: string,
  popOptions?: PopulateOptions
) {
  return asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    if (select && select?.length !== 0) query = query.select(select.join(" "));

    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`No ${modelName || "document"} with that id`, 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

export function getAll<T>(
  Model: Model<T>,
  select?: string[],
  modelName?: string
) {
  return asyncHandler(async (req, res, next) => {
    let filter = {};
    let docs: any;
    if (req.params.productId) filter = { product: req.params.productId };

    if (select && select?.length !== 0) {
      req.query.fields = select.join(" ");
    }

    const query = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    docs = await query.query;

    if (!docs) {
      return next(new AppError(`No ${modelName || "document"} found`, 404));
    }
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
}
