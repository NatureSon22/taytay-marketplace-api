import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Account } from "../models/account";
import Admin from "../models/admin";
import AppError from "../utils/appError";

interface AuthenticatedRequest extends Request {
  user?: any; 
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "") || req.cookies?.authToken;

    if (!token) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    let userData;

    if (decoded.userType === "account") {
      userData = await Account.findOne({ email: decoded.email });
    } else if (decoded.userType === "admin") {
      userData = await Admin.findOne({ email: decoded.email });
    }

    if (!userData) {
      return next(new AppError("User not found", 404));
    }

    req.user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || "User",
      userType: decoded.userType,
    };

    next();
  } catch (error: any) {
    console.error("❌ Token verification error:", error);
    return next(new AppError("Invalid or expired token", 401));
  }
};

export default verifyToken;
