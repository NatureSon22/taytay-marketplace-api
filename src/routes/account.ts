import {
  updateAccountSchema,
  UpdateAccountType,
} from "./../validators/account";
import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validate";
import { accountIdSchema, accountSchema } from "../validators/account";
import { createAccount, getAccount, getAccounts } from "../controller/account";
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
  validateParams(accountIdSchema),
  validateBody(updateAccountSchema)
);
accountRouter.delete("/:id", validateParams(accountIdSchema));
