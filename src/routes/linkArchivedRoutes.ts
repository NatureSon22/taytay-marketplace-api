import { Router } from "express";
import {
  getArchivedLinks,
  restoreArchivedLink,
} from "../controller/linkArchivedController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, getArchivedLinks);
router.post("/restore/:id", verifyToken, restoreArchivedLink);

export default router;
