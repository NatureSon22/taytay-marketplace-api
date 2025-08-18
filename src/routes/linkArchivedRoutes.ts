import { Router } from "express";
import {
  getArchivedLinks,
  restoreArchivedLink,
} from "../controller/linkArchivedController";

const router = Router();

router.get("/", getArchivedLinks);
router.post("/restore/:id", restoreArchivedLink);

export default router;
