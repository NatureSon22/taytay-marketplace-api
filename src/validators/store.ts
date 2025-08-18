import { Types } from "mongoose";
import { z } from "zod";

const phoneRe = /^(09|\+639)\d{9}$/;
const objectIdSchema = z.instanceof(Types.ObjectId, {
  message: "Invalid ObjectId",
});

// export const storeSchema = z.object({
//   profilePicture: z.string().optional(),
//   description: z.string().optional(),
//   storeName: z.string().min(1, "Store name is required"),
//   joinedDate: z.string().optional(),
//   contactNo: z
//     .string()
//     .regex(phoneRe, { message: "Valid phone number is required" }),
//   email: z.email({ message: "Email must be valid" }),
//   stallNumbers: z
//     .array(z.string())
//     .min(1, {error: ""  }),
//   owner: objectIdSchema.optional(),
//   // permit: z.string().min(1, "Permit is required"),
//   permit: z.string().optional(),
//   linkedAccount: z.array(objectIdSchema).optional(),
//   paymentMethod: z.array(objectIdSchema).optional(),
//   isDeleted: z.boolean().default(false),
// });

export const storeSchema = z.object({
  profilePicture: z.string().optional(),
  description: z.string().optional(),
  storeName: z.string().min(1, { error: "Store name is required" }),
  joinedDate: z.string().optional(),
  contactNumber: z
    .string()
    .regex(phoneRe, { error: "Valid phone number is required" }),
  email: z.email({ error: "Email must be valid" }),
  stallNumbers: z
    .array(z.string())
    .min(1, { error: "Stall numbers are required" }), // Corrected
  owner: objectIdSchema.optional(),
  permit: z.string().optional(),
  linkedAccount: z.array(objectIdSchema).optional(),
  paymentMethod: z.array(objectIdSchema).optional(),
  isDeleted: z.boolean().default(false),
});
export const updatedStoreSchema = storeSchema.partial();

export const storeIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid store ID"),
});

export const storePaginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type StoreType = z.infer<typeof storeSchema>;
export type UpdateStoreType = z.infer<typeof updatedStoreSchema>;
export type StoreIdParamType = z.infer<typeof storeIdSchema>;
export type StorePaginationType = z.infer<typeof storePaginationSchema>;
