import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../utils/appError";
import { Account } from "../models/account";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/password";
import { AccountType } from "../validators/account";
import { StoreType } from "../validators/store";
import { Store } from "../models/store";

type JwtPayload = {
  accountId: string;
};

interface AuthenticatedRequest extends Request {
  account: JwtPayload;
}

const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be 8 characters long" }),
});

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    const { email, password } = result.data;

    const user = await Account.findOne({ email });

    if (!user) {
      return next(new AppError("No account found on that email", 404));
    }

    const isMatched = await verifyPassword(password, user.password);

    if (!isMatched) {
      return next(new AppError("Invalid credentials", 401));
    }

    if (!user.isVerified) {
      return next(
        new AppError(
          "Your account is not verified yet. Please wait or contact support if this seems incorrect",
          403
        )
      );
    }

    if (user.status === "blocked") {
      return next(
        new AppError(
          "Your account has been blocked. Contact support for assistance",
          403
        )
      );
    }

    if (user.status === "inactive") {
      return next(
        new AppError(
          "Your account is inactive. Contact support if you believe this is a mistake",
          403
        )
      );
    }

    const authToken = jwt.sign(
      { accountId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const store = await Store.find({ owner: user._id });

    const publicUser = { ...user, password: "*".repeat(user.password.length) };

    res
      .status(200)
      .json({ message: "Login Successful", data: { publicUser, store } });
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

    if (existing) {
      return next(new AppError("Email already registered", 409));
    }

    const hashedPassword = await hashPassword(data.password);
    const account = await Account.create({ ...data, password: hashedPassword });

    if (!account) {
      return next(new AppError("Failed to create account", 500));
    }

    const store = await Store.create({ ...data, owner: account._id });

    if (!store) {
      return next(new AppError("Failed to create account", 500));
    }

    const authToken = jwt.sign(
      { accountId: account._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

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

const getLoggedInUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accountId } = (req as AuthenticatedRequest).account;

    const account = await Account.findById({ _id: accountId }).lean();

    if (!account) {
      return next(new AppError("Account not found", 404));
    }

    const store = await Store.findOne({ owner: account._id })
      .populate("linkedAccounts.platform")
      .lean();

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const transformed = {
      ...store,
      linkedAccounts: store?.linkedAccounts?.map((acc: any) => ({
        logo: acc.platform?.link,
        url: acc.url,
        platform: acc.platform?._id.toString(),
        platformName: acc.platform?.label,
        isDeleted: acc.isDeleted ?? false,
      })),
    };

    const publicUser = {
      ...account,
      password: "*".repeat(account.password.length),
    };

    res
      .status(200)
      .json({ message: "Logged in", data: { publicUser, store: transformed } });
  } catch (error) {
    next(error);
  }
};

export { login, logout, register, getLoggedInUser };
