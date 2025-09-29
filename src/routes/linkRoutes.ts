import { Router } from "express";
import {
  getLinks,
  createLink,
  updateLink,
  archiveLink,
} from "../controller/linkController.js";
import upload from "../middleware/upload.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, getLinks);
router.post("/", verifyToken, upload.single("image"), createLink);
router.put("/:id", verifyToken, updateLink);
router.delete("/:id", verifyToken, archiveLink);

export default router;
