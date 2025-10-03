import mongoose, { Schema, model, Document } from "mongoose";

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

const ActLog = mongoose.models.ActLog || model<ILog>("ActLog", actLogSchema);

export default ActLog;