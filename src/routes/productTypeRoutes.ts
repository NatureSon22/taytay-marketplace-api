import { Router } from "express";
import { createProductType, getProductTypes, archiveProductType } from "../controller/productTypeController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getProductTypes);
router.post("/", verifyToken, createProductType);
router.delete("/:id/archive", verifyToken, archiveProductType);

export default router;
