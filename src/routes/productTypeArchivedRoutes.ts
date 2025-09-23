import { Router } from "express";
import { getProductTypesArchived, restoreProductType } from "../controller/productTypeArchivedController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getProductTypesArchived);
router.post("/:id/restore", verifyToken, restoreProductType);

export default router;
