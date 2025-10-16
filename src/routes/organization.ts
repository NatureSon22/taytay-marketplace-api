import { Router } from "express";
import { getOrganizationsArchived, restoreOrganization } from "../controller/organization.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, getOrganizationsArchived);
router.post("/:id/restore", verifyToken, restoreOrganization);

export default router;
