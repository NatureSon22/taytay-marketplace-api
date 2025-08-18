import { Router } from "express";
import {
  createLog,
  getAllLogs,
  getLogById,
  deleteLog,
} from "../controller/actLogController";

const router = Router();

router.post("/", createLog);

router.get("/", getAllLogs);

router.get("/:id", getLogById);

router.delete("/:id", deleteLog);

export default router;
