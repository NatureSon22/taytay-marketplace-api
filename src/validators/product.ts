import { Types } from "mongoose";
import { z } from "zod";

const objectIdSchema = z.instanceof(Types.ObjectId, {
  message: "Invalid ObjectId",
});

export const productSchema = z.object({
  productName: z.string().min(1, { error: "Product name is required" }),
  productPrice: z.string().min(1, { error: "Product price is required" }),
  productDescription: z
    .string()
    .min(1, { error: "Product description is required" }),
  productPictures: z
    .array(z.string())
    .min(1, { error: "At least one picture is required" }),
  categories: z.array(objectIdSchema).optional(),
  types: z.array(objectIdSchema).optional(),
  links: z
    .array(
      z.object({
        platform: objectIdSchema,
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
