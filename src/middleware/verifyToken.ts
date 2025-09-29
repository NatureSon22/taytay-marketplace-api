import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import { Account } from "../models/account.js";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName: string;
    lastName: string;
  };
}

type JwtPayload = {
  accountId: string;
  type: "admin" | "account";
};

const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.authToken;

  if (!token) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    let user: any;

    if (decoded.type === "admin") {
      user = await Admin.findById(decoded.accountId).select("firstName lastName");
    } else {
      user = await Account.findById(decoded.accountId).select("firstName lastName");
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.account = {
      accountId: decoded.accountId,
      type: decoded.type,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    console.log(`Token verification error: ${error}`);
    next(new AppError("Invalid or expired token", 401));
  }
};

export default verifyToken;
