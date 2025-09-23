import { Request, Response } from "express";
import ProductType from "../models/productType";
import ProductTypeArchived from "../models/productTypeArchived";
import { logAction } from "../utils/logAction";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName?: string;
    lastName?: string;
  };
}

export const getProductTypesArchived = async (req: Request, res: Response) => {
  try {
    const productTypesArchived = await ProductTypeArchived.find();
    res.json(productTypesArchived);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived Product Type", error });
  }
};

export const restoreProductType = async (req: AuthenticatedRequest, res: Response) => {
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

    await logAction(req, `Restored product type (${archivedProductType.label})`);

    res.status(200).json({
      message: "Product Type restored successfully",
      restoredProductType,
    });
  } catch (error) {
    res.status(500).json({ message: "Error restoring Product Type", error });
  }
};
