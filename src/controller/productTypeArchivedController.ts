import { Request, Response } from "express";
import ProductType from "../models/productType";
import ProductTypeArchived from "../models/productTypeArchived";

export const getProductTypesArchived = async (req: Request, res: Response) => {
  try {
    const productTypesArchived = await ProductTypeArchived.find();
    res.json(productTypesArchived);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived Product Type", error });
  }
};

export const restoreProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archivedProductType = await ProductTypeArchived.findOne({ id });
    if (!archivedProductType) {
      return res.status(404).json({ message: `Archived Product Type with id ${id} not found` });
    }

    const restoredProductType = new ProductType({
      id: archivedProductType.id,
      label: archivedProductType.label,
    });
    await restoredProductType.save();

    await ProductTypeArchived.deleteOne({ id });

    res.status(200).json({ message: "Product Type restored successfully", restoredProductType });
  } catch (error) {
    res.status(500).json({ message: "Error restoring Product Type", error });
  }
};
