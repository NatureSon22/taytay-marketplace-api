import { updateAccountSchema } from "./../validators/account";
import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validate";
import { accountIdSchema, accountSchema } from "../validators/account";
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  updateAccount,
} from "../controller/account";
import verifyToken from "../middleware/verifyToken";

const accountRouter = Router();

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

export default accountRouter;
