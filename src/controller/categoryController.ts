import { Request, Response } from "express";
import Category from "../models/category.js";
import CategoryArchived from "../models/categoryArchived.js";
import { StoreIdParamType } from "../validators/store.js";
import { Store } from "../models/store.js";
import { logAction } from "../utils/logAction.js";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
  };
}

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getAllCategoriesForStore = async (
  req: Request<StoreIdParamType>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).lean();
    const mainCategories = await Category.find().lean();

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const combinedCategories = [...(store.categories ?? []), ...mainCategories];

    res.json(combinedCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, label } = req.body;

    if (!id || !label) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category with this ID already exists" });
    }

    const existingLabel = await Category.findOne({ label });
    if (existingLabel) {
      return res
        .status(409)
        .json({ message: "Category with this label already exists" });
    }
    
    const newCategory = new Category({ id, label });
    await newCategory.save();

    await logAction(req, `Created category (${label})`);

    res
      .status(201)
      .json({ message: "Category created successfully", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to create Category", error });
  }
};

export const archiveCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ id });
    if (!category) {
      return res.status(404).json({ message: `Category with id ${id} not found` });
    }

    const archivedCategory = new CategoryArchived({
      id: category.id,
      label: category.label,
    });
    await archivedCategory.save();

    await Category.deleteOne({ id });

    res.status(200).json({ message: "Category archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error archiving category", error });
  }
};