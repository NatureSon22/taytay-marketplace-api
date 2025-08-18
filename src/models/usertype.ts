import { Schema, model } from "mongoose";
import { z } from "zod";

export const userTypeZodSchema = z.object({
  type: z.string().min(1, "User type is required"),
});

export type UserTypeType = z.infer<typeof userTypeZodSchema>;

const userTypeSchema = new Schema<UserTypeType>(
  {
    type: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserType = model<UserTypeType>("UserType", userTypeSchema);
