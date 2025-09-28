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
import { ILink } from "../models/link";
import type { LinkedAccountType } from "./../validators/store";
import { Types } from "mongoose";

const DATA_PER_PAGE = 20;

type LinkedAccounts = {
  logo?: string;
  url: string;
  isDeleted?: boolean;
  platformName?: string;
};

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, page } = req.query as unknown as StorePaginationType;

    const numericLimit = Number(limit) || DATA_PER_PAGE;
    const numericPage = Number(page) || 1;

    const offset = (numericPage - 1) * numericLimit;

    const [stores, total] = await Promise.all([
      Store.find().skip(offset).limit(numericLimit).exec(),
      Store.countDocuments(),
    ]);

    res.status(200).json({
      message: "Stores retrieved successfully",
      data: stores,
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit),
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

    const store = await Store.findById(id)
      .populate<{ linkedAccounts: { platform: ILink; url: string }[] }>(
        "linkedAccounts.platform"
      )
      .lean();

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const noOfProducts = await Product.countDocuments({ storeId: id });

    const linkedAccounts: LinkedAccounts[] =
      store.linkedAccounts?.map((link) => ({
        logo: link.platform.link,
        url: link.url,
        platformName: link.platform.label,
      })) ?? [];

    res.status(200).json({
      message: "Store retrieved successfully",
      data: { ...store, noOfProducts, linkedAccounts },
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreProducts = async (
  req: Request<
    StoreIdParamType,
    unknown,
    unknown,
    {
      page?: string;
      limit?: string;
      productCategory?: string;
      productType?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      productCategory,
      productType,
      page = "1",
      limit = "20",
    } = req.query;

    const filter: Record<string, any> = { storeId: id };

    if (productCategory) {
      filter.categories = { $in: [productCategory] };
    }

    if (productType) {
      filter.types = { $in: [productType] };
    }

    // Convert pagination params to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Query with pagination
    const products = await Product.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Count total for pagination info
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      message: "Store products retrieved successfully",
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
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
      data.linkedAccounts.forEach((incoming: LinkedAccountType) => {
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
            mergedAccounts.push({
              ...incoming,
              platform: new Types.ObjectId(incoming.platform),
            });
          }
        }
      });
    }

    const formattedmergedAccounts = mergedAccounts.map((account) => ({
      ...account,
      platform: account.platform.toString(),
    }));

    data.linkedAccounts = formattedmergedAccounts;

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
