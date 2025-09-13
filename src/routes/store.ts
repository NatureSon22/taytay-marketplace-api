import {
  validateBody,
  validateParams,
  validateQuery,
} from "./../middleware/validate";
import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  createStore,
  deleteStore,
  getStore,
  getStores,
  updateStore,
} from "../controller/store";
import {
  storeIdSchema,
  storePaginationSchema,
  storeSchema,
  updatedStoreSchema,
} from "../validators/store";
import upload from "../middleware/upload";

const storeRouter = Router();

storeRouter.get(
  "/",
  verifyToken,
  validateQuery(storePaginationSchema),
  getStores
);
storeRouter.get("/:id", verifyToken, validateParams(storeIdSchema), getStore);
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
  validateBody(updatedStoreSchema, true, "profilePicture"),
  updateStore
);
storeRouter.delete(
  "/:id",
  verifyToken,
  validateParams(storeIdSchema),
  deleteStore
);

export default storeRouter;
