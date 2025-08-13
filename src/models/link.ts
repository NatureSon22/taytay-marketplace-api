import mongoose, { Document, Schema } from "mongoose";

export interface ILink extends Document {
  id: string;
  label: string;
  link: string;
}

const linkSchema = new Schema<ILink>(
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
          return /^https?:\/\/.+$/.test(v); // basic URL validation
        },
        message: (props: any) => `${props.value} is not a valid URL`,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ILink>("Link", linkSchema);
