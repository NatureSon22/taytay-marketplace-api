import { Router } from "express";
import { getAdmins, createAdmin, archiveAdmin, updateAdminStatus } from "../controller/adminController";

const router = Router();

router.get("/", getAdmins);    
router.post("/", createAdmin);
router.delete("/:id/archive", archiveAdmin);   
router.put("/:id/status", updateAdminStatus);

export default router;
