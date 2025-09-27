import { z } from "zod";

const phoneRe = /^(09|\+639)\d{9}$/;
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

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
    .min(1, { error: "Stall numbers are required" }),
  owner: objectIdSchema.optional(),
  permit: z.string().optional(),
  categories: z
    .array(
      z.object({
        label: z.string().min(1),
      })
    )
    .optional(),
  productType: z
    .array(
      z.object({
        label: z.string().min(1),
      })
    )
    .optional(),
  linkedAccounts: z
    .array(
      z.object({
        platform: objectIdSchema,
        url: z.string().min(1, { error: "Link is required" }),
        isDeleted: z.boolean().default(false),
      })
    )
    .optional(),
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
