import { Request, Response, NextFunction } from "express";
import {
  StoreIdParamType,
  StoreType,
  UpdateStoreType,
} from "../validators/store.js";
import { Store } from "../models/store.js";
import AppError from "../utils/appError.js";
import { Product } from "../models/product.js";
import { ILink } from "../models/link.js";
import type { LinkedAccountType } from "./../validators/store.js";
import { Types } from "mongoose";
import organization from "../models/organization.js";

const DATA_PER_PAGE = 20;

type LinkedAccounts = {
  logo?: string;
  url: string;
  isDeleted?: boolean;
  platformName?: string;
};

export const getStores = async (
  req: Request<
    unknown,
    unknown,
    unknown,
    {
      page?: string;
      limit?: string;
      storeName?: string;
      sort?: "newest" | "most-visited";
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, page, storeName, sort } = req.query;

    const numericLimit = Number(limit) || DATA_PER_PAGE;
    const numericPage = Number(page) || 1;
    const offset = (numericPage - 1) * numericLimit;

    const filter: Record<string, any> = {};
    if (storeName) {
      filter.storeName = { $regex: storeName, $options: "i" };
    }

    const sortObj: Record<string, 1 | -1> = {};

    if (sort) {
      if (sort === "newest") {
        sortObj.createdAt = -1;
      }
      if (sort === "most-visited") {
        sortObj.views = -1;
      }
    }

    const [stores, total] = await Promise.all([
      Store.find(filter).sort(sortObj).skip(offset).limit(numericLimit).exec(),
      Store.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Stores retrieved successfully",
      stores,
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
      .populate<{
        linkedAccounts: { platform: ILink; url: string }[];
        organization: { _id: string; organizationName: string };
      }>("linkedAccounts.platform organization")
      .lean();

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const noOfProducts = await Product.countDocuments({ storeId: id });

    let organization:
      | { organization: string; organizationName: string }
      | undefined;

    if (store.organization) {
      organization = {
        organization: store.organization._id,
        organizationName: store.organization.organizationName,
      };
    }

    const linkedAccounts: LinkedAccounts[] =
      store.linkedAccounts?.map((link) => ({
        logo: link.platform.link,
        url: link.url,
        platformName: link.platform.label,
      })) ?? [];

    res.status(200).json({
      message: "Store retrieved successfully",
      data: { ...store, noOfProducts, linkedAccounts, ...organization },
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
