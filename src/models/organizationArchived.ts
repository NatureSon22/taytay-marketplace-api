import { Schema, model, Document } from "mongoose";

export interface IOrganizationArchived extends Document {
  id: string;
  organizationName: string;
}

const organizationArchivedSchema = new Schema<IOrganizationArchived>(
  {
    id: { type: String, required: true, unique: true },
    organizationName: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<IOrganizationArchived>("OrganizationArchived", organizationArchivedSchema);
