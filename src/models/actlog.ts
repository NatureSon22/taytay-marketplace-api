import mongoose, { Schema, model, Model, Document } from "mongoose";

export interface ILog extends Document {
  username: string;
  action: string;
}

const actLogSchema = new Schema<ILog>(
  {
    username: { type: String, required: true },
    action: { type: String, required: true },
  },
  { timestamps: true }
);

// Explicitly type the model
const ActLog: Model<ILog> =
  (mongoose.models.ActLog as Model<ILog>) || model<ILog>("ActLog", actLogSchema);

export default ActLog;