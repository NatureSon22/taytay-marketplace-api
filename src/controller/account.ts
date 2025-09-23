import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { Account } from "../models/account";
import {
  AccountIdParamType,
  AccountType,
  UpdateAccountType,
} from "../validators/account";
import { hashPassword } from "../utils/password";

import { Store } from "../models/store";

export const getUserGrowth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const growth = await Account.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = growth.map((g) => ({
      month: g._id, 
      users: g.users,
    }));

    res.status(200).json({ data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accounts = await Account.find().lean();

    const accountsWithStore = await Promise.all(
      accounts.map(async (acc) => {
        const store = await Store.findOne({ owner: acc._id }).select("storeName");
        return {
          ...acc,
          storeName: store ? store.storeName : null,
        };
      })
    );

    const totalVerified = accounts.filter(acc => acc.status === "Verified").length;
    const totalPending = accounts.filter(acc => acc.status === "Pending").length;

    res.status(200).json({
      message: "Accounts retrieved successfully",
      data: accountsWithStore,
      totals: {
        totalVerified,
        totalPending,
        totalAccounts: accounts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const getAccount = async (
  req: Request<AccountIdParamType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);

    if (!account) {
      return next(new AppError("Account not found", 404));
    }

    res
      .status(200)
      .json({ message: "Account retrieved successfully", data: account });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (
  req: Request<unknown, unknown, AccountType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const newAccount = await Account.create(data);

    if (!newAccount) {
      return next(new AppError("Failed to create account", 500));
    }

    res
      .status(201)
      .json({ message: "Account created successfully", data: newAccount });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (
  req: Request<AccountIdParamType, unknown, UpdateAccountType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const payload = { ...data };

    if (data.password) {
      const hashedPassword = await hashPassword(data.password.trim());
      payload.password = hashedPassword;
    }

    const updatedAccount = await Account.findOneAndUpdate(
      { _id: id },
      payload,
      {
        new: true,
      }
    ).lean();

    if (!updatedAccount) {
      return next(new AppError("Account not found", 404));
    }

    const publicUser = {
      ...updatedAccount,
      password: "*".repeat(updatedAccount.password.length),
    };

    res
      .status(200)
      .json({ message: "Account updated successfully", data: publicUser });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request<AccountIdParamType, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedAccount = await Account.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedAccount) {
      return next(new AppError("Account not found", 404));
    }

    res
      .status(200)
      .json({ message: "Account deleted successfully", data: deletedAccount });
  } catch (error) {
    next(error);
  }
};

export const updateSellerStatus = async (
  req: Request<{ id: string }, unknown, { status: "Pending" | "Verified" | "Blocked" }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedSeller = await Account.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    ).lean();

    if (!updatedSeller) {
      return next(new AppError("Seller not found", 404));
    }

    res.status(200).json({
      message: "Seller status updated successfully",
      data: updatedSeller,
    });
  } catch (error) {
    next(error);
  }
};