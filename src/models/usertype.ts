import { InferSchemaType, model, Schema } from "mongoose";

const userTypeSchema = new Schema(
  {
    type: { type: String, required: true },
  },
  { timestamps: true }
);

type UserTypeType = InferSchemaType<typeof userTypeSchema>;

const UserType = model<UserTypeType>("UserType", userTypeSchema);

export type { UserTypeType };
export { UserType };
