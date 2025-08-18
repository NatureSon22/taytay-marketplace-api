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
  // permit: { type: String, required: true },
  permit: { type: String },
  linkedAccount: [{ type: Schema.Types.ObjectId, ref: "MarketPlatform" }],
  paymentMethod: [{ type: Schema.Types.ObjectId, ref: "PaymentMethod" }],
  isDeleted: { type: Boolean, default: false },
});

export const Store = model<StoreType>("Store", storeSchema);
