import { Router } from "express";
import {
  getGeneralInformation,
  upsertGeneralInformation
} from "../controller/generalInformationController";

const router = Router();

router.get("/", getGeneralInformation);
router.post("/", upsertGeneralInformation); 

export default router;
