import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../utils/appError";
import { Account } from "../models/account";
import Admin from "../models/admin";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/password";
import { AccountType } from "../validators/account";
import { StoreType } from "../validators/store";
import { Store } from "../models/store";

interface AuthenticatedRequest extends Request {
  account?: { accountId: string };
}

type JwtPayload = {
  accountId: string;
};

const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be 8 characters long" }),
});

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(i => i.message).join(", ");
      return next(new AppError(errorMessages, 422));
    }

    const { email, password } = result.data;

    let user: any = await Account.findOne({ email });
    let userType: "account" | "admin" = "account";

    if (!user) {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return next(new AppError("No account found on that email", 404));
      }
      user = admin;
      userType = "admin";
    }

    const isMatched = await verifyPassword(password, user.password);
    if (!isMatched) return next(new AppError("Invalid credentials", 401));

    if ("isVerified" in user && !user.isVerified) {
      return next(new AppError(
        "Your account is not verified yet. Please wait or contact support",
        403
      ));
    }

    if ("status" in user && (user.status === "blocked" || user.status === "inactive")) {
      return next(new AppError(
        `Your account is ${user.status}. Contact support if this seems incorrect`,
        403
      ));
    }

    const authToken = jwt.sign({ accountId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      data: {
        publicUser: { ...user.toObject(), userType },
        store: "store" in user ? user.store : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    next(error);
  }
};

const register = async (
  req: Request<unknown, unknown, AccountType & StoreType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const existing = await Account.findOne({ email: data.email });
    if (existing) return next(new AppError("Email already registered", 409));

    const hashedPassword = await hashPassword(data.password);
    const account = await Account.create({ ...data, password: hashedPassword });

    if (!account) return next(new AppError("Failed to create account", 500));

    const store = await Store.create({ ...data, owner: account._id });
    if (!store) return next(new AppError("Failed to create account", 500));

    const authToken = jwt.sign({ accountId: account._id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    next(error);
  }
};

const getLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = (req as AuthenticatedRequest).account!;
    
    let user: any = await Account.findById(accountId);
    let userType: "account" | "admin" = "account";

    if (!user) {
      const admin = await Admin.findById(accountId);
      if (!admin) return next(new AppError("User not found", 404));
      user = admin;
      userType = "admin";
    }

    res.status(200).json({
      message: "Logged in",
      data: {
        publicUser: { ...user.toObject(), userType },
        store: "store" in user ? user.store : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export { login, logout, register, getLoggedInUser };
