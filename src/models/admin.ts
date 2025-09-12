import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  password: string;
  status: "Active" | "Inactive";
  role: "Admin" | "Super Admin";
}

const adminSchema = new Schema<IAdmin>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    role: { type: String, enum: ["Admin", "Super Admin"], required: true },
  },
  {
    timestamps: true,
  }
);

export default model<IAdmin>("Admin", adminSchema);
