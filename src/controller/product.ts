import { ProductType } from "./../validators/product.js";
import { NextFunction, Request, Response } from "express";
import { ProductIdParamType, UpdateProductType } from "../validators/product.js";
import AppError from "../utils/appError.js";
import { ILink } from "../models/link.js";
import { Product } from "../models/product.js";

export const getProducts = async (
  req: Request<
    unknown,
    unknown,
    unknown,
    {
      page?: string;
      limit?: string;
      productCategory?: string;
      productType?: string;
      sort?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productCategory,
      productType,
      page = "1",
      limit = "20",
      sort,
    } = req.query;

    const filter: Record<string, any> = {};

    if (productCategory) {
      filter.categories = { $in: [productCategory] };
    }
    if (productType) {
      filter.types = { $in: [productType] };
    }

    const sortObj: Record<string, 1 | -1> = {};
    let sortAlphabetical = false;

    if (sort) {
      const sortArray = JSON.parse(sort as string) as {
        field: string;
        order: string;
      }[];

      sortArray.forEach(({ field, order }) => {
        if (field === "price") {
          sortObj.productPrice = order === "low-high" ? 1 : -1;
        }

        if (field === "popularity" && order === "most-liked") {
          sortObj.likes = -1;
        }

        if (field === "popularity" && order === "most-viewed") {
          sortObj.views = -1;
        }

        if (field === "alphabetical") {
          sortObj.productName = order === "a-z" ? 1 : -1;
          sortAlphabetical = true;
        }
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = Product.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort(sortObj);

    if (sortAlphabetical) {
      query.collation({ locale: "en", strength: 2 });
    }

    const products = await query;
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      message: "Products retrieved successfully",
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

export const getProduct = async (
  req: Request<ProductIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate<{
        links: { platform: ILink; url: string }[];
        categories: { label: string }[];
        types: { label: string }[];
      }>([
        { path: "links.platform" },
        { path: "categories" },
        { path: "types" },
      ])
      .lean();

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const categories =
      product.categories.map((category) => category.label) ?? [];

    const types = product.types.map((type) => type.label) ?? [];

    const links =
      product.links?.map((link) => ({
        logo: link.platform.link,
        platformName: link.platform.label,
        url: link.url,
      })) ?? [];

    res.status(200).json({
      message: "Product retrieved successfully",
      data: {
        ...product,
        links,
        categories,
        types,
      },
    });
  } catch (error) {
    next(error);
  }
};

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export const getProductSuggestions = async (
  req: Request<
    unknown,
    unknown,
    unknown,
    {
      productName?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productName } = req.query;

    if (!productName) {
      return next(new AppError("Product name is required", 400));
    }

    const products = await Product.find({
      productName: { $regex: `^${escapeRegex(productName)}` },
    })
      .collation({ locale: "en", strength: 2 }) // ensures case-insensitive search
      .limit(10);

    const formatItems = products.map((product) => ({
      label: product.productName,
      value: product._id,
    }));

    res.status(200).json({
      message: "Products retrieved successfully",
      data: formatItems,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request<unknown, unknown, ProductType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const newProduct = await Product.create(data);

    if (!newProduct) {
      return next(new AppError("Failed to create product", 500));
    }

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request<ProductIdParamType, unknown, UpdateProductType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedProduct = await Product.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });

    if (!updatedProduct) {
      return next(new AppError("Product not found", 404));
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request<ProductIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return next(new AppError("Product not found", 404));
    }

    res
      .status(200)
      .json({ message: "Product deleted successfully", data: updatedProduct });
  } catch (error) {
    next(error);
  }
};
