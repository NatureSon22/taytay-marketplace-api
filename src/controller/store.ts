import { StorePaginationType } from "./../validators/store";
import { Request, Response, NextFunction } from "express";
import {
  StoreIdParamType,
  StoreType,
  UpdateStoreType,
} from "../validators/store";
import { Store } from "../models/store";
import AppError from "../utils/appError";

const DATA_PER_PAGE = 20;

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 1, page = DATA_PER_PAGE } =
      req.query as unknown as StorePaginationType;

    const offset = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      Store.find().skip(offset).limit(limit).exec(),
      Store.countDocuments(),
    ]);

    res.status(200).json({
      message: "Stores retrieved successfully",
      data: stores,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getStore = async (
  req: Request<StoreIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    res
      .status(201)
      .json({ message: "Store retrieved successfully", data: store });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (
  req: Request<unknown, unknown, StoreType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const newStore = await Store.create(data);

    if (!newStore) {
      return next(new AppError("Failed to create store", 500));
    }

    res
      .status(201)
      .json({ message: "Store created successfully", data: newStore });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (
  req: Request<StoreIdParamType, unknown, UpdateStoreType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedStore = await Store.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });

    if (!updatedStore) {
      return next(new AppError("Store not found", 404));
    }

    res
      .status(200)
      .json({ message: "Store updated successfully", data: updatedStore });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (
  req: Request<StoreIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedStore = await Store.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedStore) {
      return next(new AppError("Store not found", 404));
    }

    res
      .status(200)
      .json({ message: "Store deleted successfully", data: deletedStore });
  } catch (error) {
    next(error);
  }
};
