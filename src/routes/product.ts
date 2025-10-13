import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductDetails,
  getProducts,
  getProductSuggestions,
  updateProduct,
} from "../controller/product.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  productIdSchema,
  productSchema,
  updateProductSchema,
} from "../validators/product.js";
import upload from "../middleware/upload.js";

const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/suggestions", getProductSuggestions);
productRouter.get("/:id", validateParams(productIdSchema), getProduct);
productRouter.get(
  "/:id/details",
  validateParams(productIdSchema),
  getProductDetails
);
productRouter.post(
  "/",
  verifyToken,
  upload.array("images[]", 4),
  validateBody(productSchema, true, "productPictures"),
  createProduct
);
productRouter.put(
  "/:id",
  verifyToken,
  upload.array("images[]", 4),
  validateBody(updateProductSchema, true, "productPictures"),
  updateProduct
);
productRouter.delete(
  "/",
  verifyToken,
  validateBody(productIdSchema),
  deleteProduct
);

export default productRouter;
