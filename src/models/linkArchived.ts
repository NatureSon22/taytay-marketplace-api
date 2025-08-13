import mongoose, { Document, Schema } from "mongoose";

export interface ILinkArchived extends Document {
  id: string;
  label: string;
  link: string;
}

const linkArchivedSchema = new Schema<ILinkArchived>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+$/.test(v); 
        },
        message: (props: any) => `${props.value} is not a valid URL`,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ILinkArchived>("LinkArchived", linkArchivedSchema);
