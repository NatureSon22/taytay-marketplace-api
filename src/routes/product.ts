import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
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
  validateBody(updateProductSchema),
  updateProduct
);
productRouter.delete(
  "/",
  verifyToken,
  validateParams(productIdSchema),
  deleteProduct
);

export default productRouter;
