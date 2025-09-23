import { Request } from "express";
import ActLog from "../models/actLog";
import Admin from "../models/admin";
import { Account } from "../models/account";

export const logAction = async (req: Request, action: string) => {
  try {
    const account = (req as any).account; // added by your auth middleware
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

    await ActLog.create({
      username,
      action,
    });
  } catch (err) {
    console.error("Failed to log action:", err);
  }
};
