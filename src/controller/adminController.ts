import { Request, Response } from "express";
import Admin from "../models/admin";
import AdminArchived from "../models/adminArchived";

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { id, email, firstName, middleName, lastName, role } = req.body;

    if (!id || !email || !firstName || !lastName || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingAdmin = await Admin.findOne({ id });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin with this ID already exists" });
    }

    const newAdmin = new Admin({
      id,
      email,
      firstName,
      middleName,
      lastName,
      status: "Active",
      role, 
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Failed to create admin", error });
  }
};

export const archiveAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({ id });
    if (!admin) {
      return res.status(404).json({ message: `Admin with id ${id} not found` });
    }

    const archivedAdmin = new AdminArchived({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      middleName: admin.middleName,
      lastName: admin.lastName,
      status: admin.status,
      role: admin.role,
    });
    await archivedAdmin.save();

    await Admin.deleteOne({ id });

    res.status(200).json({ message: "Admin archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error archiving admin", error });
  }
};

export const updateAdminStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
      { id },
      { status },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: `Admin with id ${id} not found` });
    }

    res.json({ message: "Status updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin status", error });
  }
};

