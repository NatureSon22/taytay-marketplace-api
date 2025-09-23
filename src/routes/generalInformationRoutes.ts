import { Router } from "express";
import {
  getGeneralInformation,
  upsertGeneralInformation
} from "../controller/generalInformationController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", getGeneralInformation);
router.post("/", verifyToken, upsertGeneralInformation);

export default router;
