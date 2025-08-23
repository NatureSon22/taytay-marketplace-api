import { model, Schema } from "mongoose";
import { ProductType } from "../validators/product";

const productSchema = new Schema<ProductType>(
  {
    productName: { type: String, required: true },
    productPrice: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPictures: [{ type: String, required: true }],
    categories: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    types: [
      { type: Schema.Types.ObjectId, ref: "ProductType", required: true },
    ],
    links: [
      {
        platform: {
          type: Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        url: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Product = model<ProductType>("Product", productSchema);
