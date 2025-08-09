import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../utils/appError";
import { Account } from "../models/account";
import jwt from "jsonwebtoken";
import { verifyPassword } from "../utils/password";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

    res.status(200).json({ message: "Login Successful" });
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

export { login, logout };
