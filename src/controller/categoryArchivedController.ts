import { Request, Response } from "express";
import CategoryArchived from "../models/categoryArchived";
import Category from "../models/category";

export const getCategoriesArchived = async (req: Request, res: Response) => {
  try {
    const categoriesArchived = await CategoryArchived.find();
    res.json(categoriesArchived);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived categories", error });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archivedCategory = await CategoryArchived.findOne({ id });
    if (!archivedCategory) {
      return res.status(404).json({ message: `Archived category with id ${id} not found` });
    }

    const restoredCategory = new Category({
      id: archivedCategory.id,
      label: archivedCategory.label,
    });
    await restoredCategory.save();

    await CategoryArchived.deleteOne({ id });

    res.status(200).json({ message: "Category restored successfully", restoredCategory });
  } catch (error) {
    res.status(500).json({ message: "Error restoring category", error });
  }
};
