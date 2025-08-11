import { Schema, model, Document } from "mongoose";

export interface ICategoryArchived extends Document {
  id: string;
  label: string;
}

const categoryArchivedSchema = new Schema<ICategoryArchived>(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<ICategoryArchived>("CategoryArchived", categoryArchivedSchema);
