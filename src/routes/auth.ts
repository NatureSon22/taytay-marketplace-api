import { accountSchema } from "./../validators/account.js";
import { Router } from "express";
import { getLoggedInUser, login, logout, register } from "../controller/auth.js";
import { validateAndMerge } from "../middleware/validate.js";
import { storeSchema } from "../validators/store.js";
import multer from "multer";
import verifyToken from "../middleware/verifyToken.js";

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
