import { Router } from "express";
import { getAdminsArchived, restoreAdmin } from "../controller/adminArchivedController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, getAdminsArchived);
router.post("/:id/restore", verifyToken, restoreAdmin); 

export default router;
