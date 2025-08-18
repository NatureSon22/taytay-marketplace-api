import { Schema, model, Document } from "mongoose";

export interface ILog extends Document {
  username: string;
  action: string;
}

const actLogSchema = new Schema<ILog>(
  {
    username: { type: String, required: true },
    action: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model<ILog>("ActLog", actLogSchema);
