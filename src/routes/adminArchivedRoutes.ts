import { Router } from "express";
import { getAdminsArchived, restoreAdmin } from "../controllers/adminArchivedController";

const router = Router();

router.get("/", getAdminsArchived);
router.post("/:id/restore", restoreAdmin); 

export default router;
