import { Request, Response } from "express";
import AdminArchived from "../models/adminArchived";
import Admin from "../models/admin";  
import { logAction } from "../utils/logAction";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName: string;
    lastName: string;
  };
}

export const getAdminsArchived = async (req: Request, res: Response) => {
  try {
    const adminsArchived = await AdminArchived.find();
    res.json(adminsArchived);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived admins", error });
  }
};

export const restoreAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const archivedAdmin = await AdminArchived.findOne({ id });
    if (!archivedAdmin) {
      return res.status(404).json({ message: `Archived admin with id ${id} not found` });
    }

    const restoredAdmin = new Admin({
      id: archivedAdmin.id,
      email: archivedAdmin.email,
      firstName: archivedAdmin.firstName,
      middleName: archivedAdmin.middleName,
      lastName: archivedAdmin.lastName,
      password: archivedAdmin.password,
      status: archivedAdmin.status,
      role: archivedAdmin.role,
    });
    await restoredAdmin.save();

    await AdminArchived.deleteOne({ id });

    // 🔥 Log action
    await logAction(req, `Restored admin (${archivedAdmin.firstName} ${archivedAdmin.lastName})`);

    res.status(200).json({ message: "Admin restored successfully", restoredAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error restoring admin", error });
  }
};
