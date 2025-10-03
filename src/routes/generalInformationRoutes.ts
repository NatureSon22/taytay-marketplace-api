import { Router } from "express";
import {
  getGeneralInformation,
  upsertGeneralInformation
} from "../controller/generalInformationController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", getGeneralInformation);
router.post("/", verifyToken, upsertGeneralInformation);

export default router;
