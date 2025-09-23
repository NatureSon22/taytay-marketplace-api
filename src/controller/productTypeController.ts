import { Request, Response } from "express";
import ProductType from "../models/productType";
import ProductTypeArchived from "../models/productTypeArchived";
import { StoreIdParamType } from "../validators/store";
import { Store } from "../models/store";

export const getProductTypes = async (req: Request, res: Response) => {
  try {
    const productTypes = await ProductType.find();
    res.json(productTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product types", error });
  }
};

export const getAllProductTypesForStore = async (
  req: Request<StoreIdParamType>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).lean();
    const mainProductTypes = await ProductType.find().lean();

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const combinedProductTypes = [
      ...(store.productType ?? []),
      ...mainProductTypes,
    ];

    res.json(combinedProductTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product types", error });
  }
};

export const createProductType = async (req: Request, res: Response) => {
  try {
    const { id, label } = req.body;

    if (!id || !label) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingProductType = await ProductType.findOne({ id });
    if (existingProductType) {
      return res
        .status(409)
        .json({ message: "Product Type with this ID already exists" });
    }

    const newProductType = new ProductType({
      id,
      label,
    });

    await newProductType.save();

    res.status(201).json({
      message: "Product Type created successfully",
      productType: newProductType,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create Product Type", error });
  }
};

export const archiveProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductType.findOne({ id });
    if (!product) {
      return res
        .status(404)
        .json({ message: `Product Type with id ${id} not found` });
    }

    const archivedProductType = new ProductTypeArchived({
      id: product.id,
      label: product.label,
    });
    await archivedProductType.save();

    await ProductType.deleteOne({ id });

    res.status(200).json({ message: "Product Type archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error archiving Product Type", error });
  }
};
