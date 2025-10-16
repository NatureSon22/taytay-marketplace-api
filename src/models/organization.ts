import { Schema, model, Document } from "mongoose";

export interface IOrganization extends Document {
  id: string;
  organizationName: string;
}

const organizationSchema = new Schema<IOrganization>(
  {
    id: { type: String, required: true, unique: true },
    organizationName: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<IOrganization>("Organization", organizationSchema);
