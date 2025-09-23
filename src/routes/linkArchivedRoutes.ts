import { Router } from "express";
import {
  getArchivedLinks,
  restoreArchivedLink,
} from "../controller/linkArchivedController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getArchivedLinks);
router.post("/restore/:id", verifyToken, restoreArchivedLink);

export default router;
