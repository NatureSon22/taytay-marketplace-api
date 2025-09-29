import { Router } from "express";
import {
  createCategory,
  getCategories,
  archiveCategory,
  getAllCategoriesForStore,
} from "../controller/categoryController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getAllCategoriesForStore);
router.post("/", verifyToken, createCategory);
router.delete("/:id/archive", verifyToken, archiveCategory);

export default router;
