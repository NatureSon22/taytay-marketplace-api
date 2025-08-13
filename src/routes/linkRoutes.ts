import { Router } from "express";
import {
  getLinks,
  createLink,
  updateLink,
  archiveLink,
} from "../controller/linkController";
import upload from "../middleware/upload";

const router = Router();

router.get("/", getLinks);
router.post("/", upload.single("image"), createLink);
router.put("/:id", updateLink);
router.delete("/:id", archiveLink);

export default router;
