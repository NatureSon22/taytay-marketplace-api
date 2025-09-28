import { Router } from "express";
import {
  createProductType,
  getProductTypes,
  archiveProductType,
  getAllProductTypesForStore,
} from "../controller/productTypeController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", getProductTypes);
router.get("/:id", getAllProductTypesForStore);

router.post("/", verifyToken, createProductType);
router.delete("/:id/archive", verifyToken, archiveProductType);

export default router;
