import { Schema, model, Document } from "mongoose";

export interface IProductTypeArchived extends Document {
  id: string;
  label: string;
}

const productTypeArchivedSchema = new Schema<IProductTypeArchived>(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<IProductTypeArchived>("ProductTypeArchived", productTypeArchivedSchema);
