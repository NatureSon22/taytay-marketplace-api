import { ProductType } from "./../validators/product";
import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product";
import { ProductIdParamType, UpdateProductType } from "../validators/product";
import AppError from "../utils/appError";

type MulterRequest = Request & {
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();

    res
      .status(200)
      .json({ message: "Products retrieved successfully", data: products });
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
    const product = await Product.findById({ _id: id });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res
      .status(200)
      .json({ message: "Product retrieved successfully", data: product });
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
