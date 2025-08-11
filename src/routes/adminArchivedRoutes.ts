import { Router } from "express";
import { getAdminsArchived, restoreAdmin } from "../controller/adminArchivedController";

const router = Router();

router.get("/", getAdminsArchived);
router.post("/:id/restore", restoreAdmin); 

export default router;
