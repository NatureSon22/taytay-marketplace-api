import { Types } from "mongoose";
import { z } from "zod";

export const accountSchema = z.object({
  _id: z.instanceof(Types.ObjectId, {
    message: "Invalid ObjectId",
  }),
  firstName: z.string().min(1, { error: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { error: "Last name is required" }),
  birthday: z.coerce.date({ error: "Birthday is required" }),
  age: z.string().min(1, { error: "Age is required" }),
  contactNumber: z.string().min(1, { error: "Contact number is required" }),
  address: z.string().optional(),
  username: z.string().min(1, { error: "Username is required" }),
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, { error: "Password is required" }),
  status: z
    .enum(["active", "inactive", "blocked"], { error: "Invalid status" })
    .default("inactive"),
  isVerified: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
});
export const updateAccountSchema = accountSchema.partial();
export const accountIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid account ID"),
});

export type AccountType = z.infer<typeof accountSchema>;
export type UpdateAccountType = z.infer<typeof updateAccountSchema>;
export type AccountIdParamType = z.infer<typeof accountIdSchema>;
