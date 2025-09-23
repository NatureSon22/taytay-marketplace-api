import { Router } from "express";
import {
  createProductType,
  getProductTypes,
  archiveProductType,
  getAllProductTypesForStore,
} from "../controller/productTypeController";

const router = Router();

router.get("/", getProductTypes);
router.get("/:id", getAllProductTypesForStore);
router.post("/", createProductType);
router.delete("/:id/archive", archiveProductType);

export default router;
