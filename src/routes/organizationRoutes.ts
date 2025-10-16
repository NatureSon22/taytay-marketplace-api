import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  archiveOrganization,
//   getAllOrganizationsForStore,
} from "../controller/organizationController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", getOrganizations);
// router.get("/:id", getAllOrganizationsForStore);
router.post("/", verifyToken, createOrganization);
router.delete("/:id/archive", verifyToken, archiveOrganization);

export default router;
