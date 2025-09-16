import { model, Schema, Types } from "mongoose";
import { StoreType } from "../validators/store";

const storeSchema = new Schema<StoreType>({
  profilePicture: { type: String },
  description: { type: String },
  storeName: { type: String, required: true },
  joinedDate: { type: Date, default: Date.now },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  stallNumbers: [{ type: String, required: true }],
  owner: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  permit: { type: String },
  linkedAccounts: [
    {
      platform: { type: Schema.Types.ObjectId, ref: "Link" },
      url: { type: String, required: true },
    },
  ],
  categories: [
    {
      label: { type: String, required: true },
    },
  ],
  productType: [
    {
      label: { type: String, required: true },
    },
  ],
  paymentMethod: [{ type: Schema.Types.ObjectId, ref: "PaymentMethod" }],
  isDeleted: { type: Boolean, default: false },
});

export const Store = model<StoreType>("Store", storeSchema);
