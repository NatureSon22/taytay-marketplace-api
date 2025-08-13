import { z } from "zod";

export const accountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  birthday: z.coerce.date({ message: "Birthday is required" }),
  age: z.string().min(1, "Age is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Address is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  status: z
    .enum(["active", "inactive", "blocked"], { message: "Invalid status" })
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
