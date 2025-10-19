import { accountSchema } from "./../validators/account.js";
import { Router } from "express";
import {
  getLoggedInUser,
  login,
  loginVerification,
  logout,
  register,
  sendVerification,
} from "../controller/auth.js";
import { validateAndMerge } from "../middleware/validate.js";
import { storeSchema } from "../validators/store.js";
import verifyToken from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post(
  "/register",
  upload.single("permit"),
  validateAndMerge(storeSchema, true, "permit"),
  validateAndMerge(accountSchema),
  register
);
authRouter.post("/send-verification", sendVerification);
authRouter.post("/verify-code", loginVerification);
authRouter.get("/user", verifyToken, getLoggedInUser);

export default authRouter;
