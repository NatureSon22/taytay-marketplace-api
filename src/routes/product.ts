import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controller/product";
import { validateBody, validateParams } from "../middleware/validate";
import {
  productIdSchema,
  productSchema,
  updateProductSchema,
} from "../validators/product";

const productRouter = Router();

productRouter.get("/", verifyToken, getProducts);
productRouter.get(
  "/:id",
  verifyToken,
  validateParams(productIdSchema),
  getProduct
);
productRouter.post(
  "/",
  verifyToken,
  validateBody(productSchema),
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
