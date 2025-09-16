import { Router } from "express";
import {
  createCategory,
  getCategories,
  archiveCategory,
  getAllCategoriesForStore,
} from "../controller/categoryController";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getAllCategoriesForStore);
router.post("/", createCategory);
router.delete("/:id/archive", archiveCategory);

export default router;
