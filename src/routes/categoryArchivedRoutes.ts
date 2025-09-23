import { Router } from "express";
import { getCategoriesArchived, restoreCategory } from "../controller/categoryArchivedController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getCategoriesArchived);
router.post("/:id/restore", verifyToken, restoreCategory);

export default router;
