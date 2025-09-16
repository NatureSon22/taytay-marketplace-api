import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  account?: any;
}

type JwtPayload = {
  accountId: string;
};

const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.authToken;

  if (!token) {
    return next(new AppError("Unathoried", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.account = {
      accountId: decoded.accountId,
    };

    next();
  } catch (error) {
    console.log(`Token verification error: ${error}`);
    next(new AppError("Invalid or expired token", 401));
  }
};

export default verifyToken;
