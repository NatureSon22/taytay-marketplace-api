import { Request, Response } from "express";
import Admin from "../models/admin";
import AdminArchived from "../models/adminArchived";
import nodemailer from "nodemailer";
import { hashPassword } from "../utils/password";
import crypto from "crypto";

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

    const existingAdminById = await Admin.findOne({ id });
    if (existingAdminById) {
      return res.status(409).json({ message: "Admin with this ID already exists" });
    }

    const existingAdminByEmail = await Admin.findOne({ email });
    if (existingAdminByEmail) {
      return res.status(409).json({ message: "Admin with this Email already exists" });
    }

    const generatedPassword = crypto.randomBytes(6).toString("hex");

    const hashedPassword = await hashPassword(generatedPassword);

    const newAdmin = new Admin({
      id,
      email,
      firstName,
      middleName,
      lastName,
      password: hashedPassword, 
      status: "Active",
      role,
    });

    await newAdmin.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Taytay Marketplace" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Welcome to Taytay Marketplace 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #4CAF50; padding: 20px; text-align: center; color: white;">
              <h1>Welcome, ${firstName}!</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
              <p>Your admin account has been created successfully 🎉</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Password:</b> ${generatedPassword}</p>
              <p style="margin-top: 20px;">
                You can now log in and start managing the platform.
              </p>
            </div>
            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #555;">
              © 2025 Taytay Marketplace. All rights reserved.
            </div>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: "Admin created and email sent", admin: newAdmin });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      message: "Failed to create admin",
      error: error.message || error.toString(),
    });
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
      password: admin.password,
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

