import { Router } from "express";
import { getAdminsArchived, restoreAdmin } from "../controller/adminArchivedController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getAdminsArchived);
router.post("/:id/restore", verifyToken, restoreAdmin); 

export default router;
