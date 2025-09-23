import { Router } from "express";
import {
  createCategory,
  getCategories,
  archiveCategory,
} from "../controller/categoryController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, createCategory);
router.delete("/:id/archive", verifyToken, archiveCategory);

export default router;
