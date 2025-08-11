import { Router } from "express";
import { createCategory, getCategories, archiveCategory } from "../controller/categoryController";

const router = Router();

router.get("/", getCategories);    
router.post("/", createCategory);
router.delete("/:id/archive", archiveCategory);   

export default router;
