import { Router } from "express";
import {
  createCategory,
  getCategories,
  archiveCategory,
  getAllCategoriesForStore,
} from "../controller/categoryController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, getCategories);
router.get("/:id", verifyToken, getAllCategoriesForStore);
router.post("/", verifyToken, createCategory);
router.delete("/:id/archive", verifyToken, archiveCategory);

export default router;
