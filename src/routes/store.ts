import {
  validateBody,
  validateParams,
} from "./../middleware/validate.js";
import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createStore,
  deleteStore,
  getStore,
  getStoreProducts,
  getStores,
  updateStore,
} from "../controller/store.js";
import {
  storeIdSchema,
  storePaginationSchema,
  storeSchema,
  updatedStoreSchema,
} from "../validators/store.js";
import upload from "../middleware/upload.js";

const storeRouter = Router();

storeRouter.get(
  "/",
  // validateQuery(storePaginationSchema),
  getStores
);
storeRouter.get("/:id", validateParams(storeIdSchema), getStore);
storeRouter.get(
  "/:id/products",
  validateParams(storeIdSchema),
  getStoreProducts
);
storeRouter.post("/", verifyToken, validateBody(storeSchema), createStore);
storeRouter.put(
  "/:id",
  verifyToken,
  validateParams(storeIdSchema),
  validateBody(updatedStoreSchema),
  updateStore
);
storeRouter.put(
  "/:id/profile-picture",
  verifyToken,
  validateParams(storeIdSchema),
  upload.single("profilePicture"),
  validateBody(updatedStoreSchema, true, "profilePicture", true),
  updateStore
);
storeRouter.delete(
  "/:id",
  verifyToken,
  validateParams(storeIdSchema),
  deleteStore
);

export default storeRouter;
