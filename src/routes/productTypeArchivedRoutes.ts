import { Router } from "express";
import { getProductTypesArchived, restoreProductType } from "../controller/productTypeArchivedController";

const router = Router();

router.get("/", getProductTypesArchived);
router.post("/:id/restore", restoreProductType); 

export default router;
