import { Router } from "express";
import { createProductType, getProductTypes, archiveProductType } from "../controller/productTypeController";

const router = Router();

router.get("/", getProductTypes);    
router.post("/", createProductType);
router.delete("/:id/archive", archiveProductType);   

export default router;
