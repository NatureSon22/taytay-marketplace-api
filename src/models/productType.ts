import { Schema, model, Document } from "mongoose";

export interface IProductType extends Document {
  id: string;
  label: string;
}

const productTypeSchema = new Schema<IProductType>(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<IProductType>("ProductType", productTypeSchema);
