import { Request } from "express";
import ActLog from "../models/actlog.js";
import Admin from "../models/admin.js";
import { Account } from "../models/account.js";

export const logAction = async (req: Request, action: string) => {
  try {
    const account = (req as any).account;
    let username = "Unknown User";

    if (account) {
      const { accountId, type } = account;

      if (type === "admin") {
        const admin = await Admin.findById(accountId);
        if (admin) {
          username = `${admin.firstName} ${admin.lastName}`;
        }
      } else if (type === "account") {
        const acc = await Account.findById(accountId);
        if (acc) {
          username = `${acc.firstName} ${acc.lastName}`;
        }
      }
    }

    const log = await ActLog.create({
      username,
      action,
    });
  } catch (err) {
    console.error("Failed to log action:", err);
  }
};
