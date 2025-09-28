import { Router } from "express";
import {
  createCategory,
  getCategories,
  archiveCategory,
  getAllCategoriesForStore,
} from "../controller/categoryController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getAllCategoriesForStore);
router.post("/", verifyToken, createCategory);
router.delete("/:id/archive", verifyToken, archiveCategory);

export default router;
