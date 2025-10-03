import { Types } from "mongoose";
import { z } from "zod";

const objectIdString = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" })
  .transform((val) => new Types.ObjectId(val));

export const productSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required" }),
  productPrice: z.string().min(1, { message: "Product price is required" }),
  productDescription: z
    .string()
    .min(1, { message: "Product description is required" }),
  productPictures: z
    .array(z.string())
    .min(1, { message: "At least one picture is required" }),
  storeId: z.string().min(1, { message: "Store ID is required" }),
  categories: z.array(objectIdString).optional(),
  types: z.array(objectIdString).optional(),
  views: z.number().default(0),
  likes: z.number().default(0),
  links: z
    .array(
      z.object({
        platform: objectIdString,
        url: z.url("Invalid url"),
      })
    )
    .optional(),
  isDeleted: z.boolean().default(false),
});

export const updateProductSchema = productSchema.partial();

export const productIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
});

export const productPaginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type ProductType = z.infer<typeof productSchema>;
export type UpdateProductType = z.infer<typeof updateProductSchema>;
export type ProductIdParamType = z.infer<typeof productIdSchema>;
export type ProductPaginationType = z.infer<typeof productPaginationSchema>;
