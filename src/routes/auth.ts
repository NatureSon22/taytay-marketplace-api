import { accountSchema } from "./../validators/account";
import { Router } from "express";
import { getLoggedInUser, login, logout, register } from "../controller/auth";
import { validateAndMerge } from "../middleware/validate";
import { storeSchema } from "../validators/store";
import multer from "multer";
import verifyToken from "../middleware/verifyToken";

const authRouter = Router();
const upload = multer();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post(
  "/register",
  upload.any(),
  validateAndMerge(accountSchema),
  validateAndMerge(storeSchema),
  register
);
authRouter.get("/user", verifyToken, getLoggedInUser);

export default authRouter;
