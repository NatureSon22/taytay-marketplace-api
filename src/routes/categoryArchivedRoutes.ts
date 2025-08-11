import { Router } from "express";
import { getCategoriesArchived, restoreCategory } from "../controller/categoryArchivedController";

const router = Router();

router.get("/", getCategoriesArchived);
router.post("/:id/restore", restoreCategory); 

export default router;
