import { StorePaginationType } from "./../validators/store";
import { Request, Response, NextFunction } from "express";
import {
  StoreIdParamType,
  StoreType,
  UpdateStoreType,
} from "../validators/store";
import { Store } from "../models/store";
import AppError from "../utils/appError";
import { Product } from "../models/product";

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

export const getStoreProducts = async (
  req: Request<StoreIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ storeId: id });

    res
      .status(201)
      .json({ message: "Store retrieved successfully", data: products });
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

    const store = await Store.findById(id);
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    let mergedAccounts = store.linkedAccounts || [];

    if (data.linkedAccounts && data.linkedAccounts.length > 0) {
      data.linkedAccounts.forEach((incoming) => {
        const idx = mergedAccounts.findIndex(
          (current) =>
            current.platform.toString() === incoming.platform.toString()
        );

        if (idx > -1) {
          if (incoming.isDeleted) {
            // remove account
            mergedAccounts = mergedAccounts.filter((_, i) => i !== idx);
          } else {
            // update URL
            mergedAccounts[idx].url = incoming.url;
            mergedAccounts[idx].isDeleted = false;
          }
        } else {
          // add new if not deleted
          if (!incoming.isDeleted) {
            mergedAccounts.push(incoming);
          }
        }
      });
    }

    data.linkedAccounts = mergedAccounts;

    const updatedStore = await Store.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("linkedAccounts.platform")
      .lean();

    const transformedLinkedAccounts = updatedStore?.linkedAccounts?.map(
      (acc: any) => ({
        logo: acc.platform?.link,
        url: acc.url,
        platform: acc.platform?._id.toString(),
        platformName: acc.platform?.label,
        isDeleted: acc.isDeleted ?? false,
      })
    );

    res.status(200).json({
      message: "Store updated successfully",
      data: { ...updatedStore, linkedAccounts: transformedLinkedAccounts },
    });
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
