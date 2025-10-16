import { Request, Response } from "express";
import Organization from "../models/organization.js";
import OrganizationArchived from "../models/organizationArchived.js";
import { StoreIdParamType } from "../validators/store.js";
import { Store } from "../models/store.js";
import { logAction } from "../utils/logAction.js";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
  };
}

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organizations", error });
  }
};

// export const getAllOrganizationsForStore = async (
//   req: Request<StoreIdParamType>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;
//     const store = await Store.findById(id).lean();
//     const mainOrganizations = await Organization.find().lean();

//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }

//     const combinedOrganizations = [...(store.organizations ?? []), ...mainOrganizations];

//     res.json(combinedOrganizations);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching organizations", error });
//   }
// };

export const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, organizationName } = req.body;

    if (!id || !organizationName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingOrganization = await Organization.findOne({ id });
    if (existingOrganization) {
      return res
        .status(409)
        .json({ message: "Organization with this ID already exists" });
    }

    const existingName = await Organization.findOne({ organizationName });
    if (existingName) {
      return res
        .status(409)
        .json({ message: "Organization with this name already exists" });
    }

    const newOrganization = new Organization({ id, organizationName });
    await newOrganization.save();

    await logAction(req, `Created organization (${organizationName})`);

    res
      .status(201)
      .json({ message: "Organization created successfully", organization: newOrganization });
  } catch (error) {
    res.status(500).json({ message: "Failed to create Organization", error });
  }
};

export const archiveOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({ id });
    if (!organization) {
      return res.status(404).json({ message: `Organization with id ${id} not found` });
    }

    const archivedOrganization = new OrganizationArchived({
      id: organization.id,
      organizationName: organization.organizationName,
    });
    await archivedOrganization.save();

    await Organization.deleteOne({ id });

    res.status(200).json({ message: "Organization archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error archiving organization", error });
  }
};