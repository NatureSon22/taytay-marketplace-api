import { Router } from "express";
import {
  getAdmins,
  createAdmin,
  archiveAdmin,
  updateAdminStatus,
} from "../controller/adminController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getAdmins);
router.post("/", verifyToken, createAdmin);
router.delete("/:id/archive", verifyToken, archiveAdmin);
router.put("/:id/status", verifyToken, updateAdminStatus);

export default router;
