import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import { Account } from "../models/account";
import Admin, { IAdmin } from "../models/admin";
import { hashPassword, verifyPassword } from "../utils/password";
import { AccountType } from "../validators/account";
import { StoreType } from "../validators/store";
import { Store } from "../models/store";

type JwtPayload = {
  userId: string;
  type: "admin" | "account";
};

interface AuthenticatedRequest extends Request {
  account: { accountId: any; type: any };
  user: JwtPayload;
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
        .map((i) => i.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    const { email, password } = result.data;

    let user: IAdmin | AccountType | null = await Admin.findOne({ email });
    let userType: "admin" | "account" = "admin";

    if (!user) {
      user = await Account.findOne({ email });
      userType = "account";
    }

    if (!user) {
      return next(new AppError("No account found with this email", 404));
    }

    // Verify password
    const isMatched = await verifyPassword(password, user.password);
    if (!isMatched) return next(new AppError("Invalid credentials", 401));

    // Narrow down by userType
    if (userType === "admin") {
      const admin = user as IAdmin;
      if (admin.status === "Inactive") {
        return next(
          new AppError("Your admin account is inactive. Contact support", 403)
        );
      }
    }

    if (userType === "account") {
      const account = user as AccountType;
      if (account.status === "Pending") {
        return next(
          new AppError(
            "Your account is not verified yet. Please wait or contact support",
            403
          )
        );
      }

      if (account.status === "Blocked") {
        return next(
          new AppError("Your account has been blocked. Contact support", 403)
        );
      }
    }

    // Generate token
    const authToken = jwt.sign(
      { accountId: user._id, type: userType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Response payload
    let responseData: any;

    if (userType === "admin") {
      const safeAdmin = { ...user, password: undefined };
      responseData = safeAdmin;
    } else {
      // account → return publicUser + store
      const publicUser = {
        ...user,
        password: "*".repeat(user.password.length),
      };
      const store = await Store.find({ owner: user._id });
      responseData = { publicUser, store };
    }

    res.status(200).json({
      message: "Login Successful",
      data: responseData,
      type: userType,
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
    const { accountId, type } = (req as AuthenticatedRequest).account;

    let user;
    if (type === "admin") {
      user = await Admin.findById(accountId);
    } else {
      user = await Account.findById(accountId);
    }
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

    res.status(200).json({
      message: "Logged in",
      data: { user, type, publicUser, store: transformed },
    });
  } catch (error) {
    next(error);
  }
};

export { login, logout, register, getLoggedInUser };
