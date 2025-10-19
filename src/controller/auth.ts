import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { Account } from "../models/account.js";
import Admin, { IAdmin } from "../models/admin.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { AccountType } from "../validators/account.js";
import { StoreType } from "../validators/store.js";
import { Store } from "../models/store.js";
import { Product } from "../models/product.js";
import VerificationModel from "../models/verification.js";
import generateVerificationCode from "../utils/verificationCode.js";
import sendVerificationEmail from "../config/email.js";
import { ILink } from "../models/link.js";

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

    let user: IAdmin | AccountType | null = await Admin.findOne({
      email,
    }).lean();
    let userType: "admin" | "account" = "admin";

    if (!user) {
      user = await Account.findOne({ email }).lean();
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

    const verification = await VerificationModel.findOne({ email });

    if (
      verification &&
      verification.lockUntil &&
      verification.lockUntil > new Date()
    ) {
      const minutesLeft = Math.ceil(
        (verification.lockUntil.getTime() - Date.now()) / 60000
      );
      return res.status(403).json({
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // Generate token
    // const authToken = jwt.sign(
    //   { accountId: user._id, type: userType },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1d" }
    // );

    // res.cookie("authToken", authToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

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

      const store = await Store.findOne({ owner: user._id })
        .populate<{
          linkedAccounts: {
            platform: ILink | null;
            url: string;
            isDeleted?: boolean;
          }[];
          organization: { _id: string; organizationName: string } | null;
        }>("linkedAccounts.platform organization")
        .lean();

      if (!store) {
        return next(new AppError("Store not found", 404));
      }

      const noOfProducts = await Product.countDocuments({ storeId: store._id });

      let organization:
        | { organization: string; organizationName: string }
        | undefined;

      if (store.organization) {
        organization = {
          organization: store.organization._id,
          organizationName: store.organization.organizationName,
        };
      }

      const linkedAccounts =
        store.linkedAccounts?.map((acc) => ({
          logo: acc.platform?.link ?? "",
          url: acc.url,
          platform: acc.platform?._id?.toString() ?? "",
          platformName: acc.platform?.label ?? "",
          isDeleted: acc.isDeleted ?? false,
        })) ?? [];

      responseData = {
        publicUser,
        store: {
          ...store,
          linkedAccounts,
          noOfProducts,
          ...organization,
        },
      };
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

const sendVerification = async (
  req: Request<unknown, unknown, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const generatedCode = generateVerificationCode();
    console.log("GENERATED CODE: " + generatedCode);

    let user = await VerificationModel.findOne({ email });

    if (!user) {
      user = new VerificationModel({
        email,
        verificationCode: generatedCode,
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        failedAttempts: 0,
      });
    } else {
      user.verificationCode = generatedCode;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    }

    await user.save();
    await sendVerificationEmail(email, generatedCode);

    return res.status(200).json({
      message: "Verification code sent. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

const loginVerification = async (
  req: Request<
    unknown,
    unknown,
    {
      code: string;
      email: string;
      userId: string;
      userType: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, email, userId, userType } = req.body;
    const user = await VerificationModel.findOne({ email });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      return res.status(403).json({
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires.getTime() < Date.now()
    ) {
      user.failedAttempts += 1;

      // lock after three failed attempts
      if (user.failedAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
        user.failedAttempts = 0;
      }

      await user.save();
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.failedAttempts = 0;
    user.lockUntil = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    //Generate token
    const authToken = jwt.sign(
      { accountId: userId, type: userType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Verification successful." });
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

    // const authToken = jwt.sign(
    //   { accountId: account._id },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1d" }
    // );

    // res.cookie("authToken", authToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

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

    const account = await Account.findById(accountId).lean();
    if (!account) {
      return next(new AppError("Account not found", 404));
    }

    const user =
      type === "admin"
        ? await Admin.findOne({ id: accountId }).lean()
        : account;

    const store = await Store.findOne({ owner: account._id })
      .populate<{
        linkedAccounts: { platform: ILink; url: string; isDeleted?: boolean }[];
        organization: { _id: string; organizationName: string };
      }>("linkedAccounts.platform organization")
      .lean();

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const noOfProducts = await Product.countDocuments({ storeId: store._id });

    let organization:
      | { organization: string; organizationName: string }
      | undefined;

    if (store.organization) {
      organization = {
        organization: store.organization._id,
        organizationName: store.organization.organizationName,
      };
    }

    const linkedAccounts =
      store.linkedAccounts?.map((acc) => ({
        logo: acc.platform?.link,
        url: acc.url,
        platform: acc.platform?._id?.toString(),
        platformName: acc.platform?.label,
        isDeleted: acc.isDeleted ?? false,
      })) ?? [];

    const { password, ...publicUser } = account;

    res.status(200).json({
      message: "Logged in successfully",
      data: {
        accountType: type,
        user,
        publicUser,
        store: {
          ...store,
          noOfProducts,
          linkedAccounts,
          ...organization,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  login,
  logout,
  register,
  getLoggedInUser,
  sendVerification,
  loginVerification,
};
