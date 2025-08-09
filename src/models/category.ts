import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  id: string;
  label: string;
}

const categorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default model<ICategory>("Category", categorySchema);
