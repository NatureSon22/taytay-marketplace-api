import { updateAccountSchema } from "./../validators/account.js";
import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validate.js";
import { accountIdSchema, accountSchema } from "../validators/account.js";
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  getUserGrowth,
  updateAccount,
  updateSellerStatus,
} from "../controller/account.js";
import verifyToken from "../middleware/verifyToken.js";

const accountRouter = Router();

accountRouter.get("/growth", verifyToken, getUserGrowth);
accountRouter.get("/", verifyToken, getAccounts);
accountRouter.get(
  "/:id",
  verifyToken,
  validateParams(accountIdSchema),
  getAccount
);
accountRouter.post(
  "/",
  verifyToken,
  validateBody(accountSchema),
  createAccount
);
accountRouter.put(
  "/:id",
  verifyToken,
  validateParams(accountIdSchema),
  validateBody(updateAccountSchema),
  updateAccount
);
accountRouter.delete(
  "/:id",
  verifyToken,
  validateParams(accountIdSchema),
  deleteAccount
);
accountRouter.patch(
  "/:id/status",
  verifyToken,
  validateParams(accountIdSchema),
  updateSellerStatus
);

export default accountRouter;
