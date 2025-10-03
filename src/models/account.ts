import { Schema, model } from "mongoose";
import type { AccountType } from "../validators/account.js";

const accountSchema = new Schema<AccountType>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    age: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Blocked"],
      default: "Pending",
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Account = model<AccountType>("Account", accountSchema);
