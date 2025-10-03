import { model, Schema, Types } from "mongoose";
interface StoreType {
  profilePicture?: string;
  description?: string;
  storeName: string;
  joinedDate?: string; // ISO string
  contactNumber: string;
  email: string;
  stallNumbers: string[];
  owner: Types.ObjectId; // Reference to Account
  permit?: string;
  views?: number;
  linkedAccounts?: {
    isDeleted?: boolean;
    platform: Types.ObjectId; // Reference to Link
    url: string;
  }[];
  categories?: {
    label: string;
  }[];
  productType?: {
    label: string;
  }[];
  paymentMethod?: Types.ObjectId[]; // Reference to PaymentMethod
  isDeleted?: boolean;
}

const storeSchema = new Schema<StoreType>(
  {
    profilePicture: { type: String },
    description: { type: String },
    storeName: { type: String, required: true },
    joinedDate: { type: String, default: () => new Date().toISOString() },
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
    views: { type: Number, default: 0 },
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
  },
  {
    timestamps: true,
  }
);

export const Store = model<StoreType>("Store", storeSchema);
