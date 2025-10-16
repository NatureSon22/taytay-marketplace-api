import { Request, Response } from "express";
import OrganizationArchived from "../models/organizationArchived.js";
import Organization from "../models/organization.js";
import { logAction } from "../utils/logAction.js";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName?: string;
    lastName?: string;
  };
}

export const getOrganizationsArchived = async (req: Request, res: Response) => {
  try {
    const organizationsArchived = await OrganizationArchived.find();
    res.json(organizationsArchived);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived organizations", error });
  }
};

export const restoreOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const archivedOrganization = await OrganizationArchived.findOne({ id });
    if (!archivedOrganization) {
      return res.status(404).json({ message: `Archived organization with id ${id} not found` });
    }

    const restoredOrganization = new Organization({
      id: archivedOrganization.id,
      organizationName: archivedOrganization.organizationName,
    });
    await restoredOrganization.save();

    await OrganizationArchived.deleteOne({ id });

    await logAction(req, `Restored organization (${archivedOrganization.organizationName})`);

    res.status(200).json({ message: "Organization restored successfully", restoredOrganization });
  } catch (error) {
    res.status(500).json({ message: "Error restoring organization", error });
  }
};
