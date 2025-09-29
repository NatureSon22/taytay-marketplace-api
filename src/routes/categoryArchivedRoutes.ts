import { Router } from "express";
import { getCategoriesArchived, restoreCategory } from "../controller/categoryArchivedController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, getCategoriesArchived);
router.post("/:id/restore", verifyToken, restoreCategory);

export default router;
