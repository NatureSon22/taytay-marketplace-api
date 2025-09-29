import { Router } from "express";
import {
  getAdmins,
  createAdmin,
  archiveAdmin,
  updateAdminStatus,
  updateAdmin,
} from "../controller/adminController.js";

const router = Router();

router.get("/", getAdmins);
router.post("/", createAdmin);
router.delete("/:id/archive", archiveAdmin);
router.put("/:id/status", updateAdminStatus);
router.put("/:id", updateAdmin);

export default router;
