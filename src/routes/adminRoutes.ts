import { Router } from "express";
import {
  getAdmins,
  createAdmin,
  archiveAdmin,
  updateAdminStatus,
  updateAdmin,
} from "../controller/adminController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", getAdmins);
router.post("/", verifyToken, createAdmin);
router.delete("/:id/archive", verifyToken, archiveAdmin);
router.put("/:id/status", verifyToken, updateAdminStatus);
router.put("/:id", verifyToken, updateAdmin);

export default router;
