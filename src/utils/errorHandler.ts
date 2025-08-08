import { Request, Response, NextFunction } from "express";
import AppError from "./appError";

// Development error handler
const devError = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production error handler
const prodError = (err: any, res: Response) => {
  if (err.isOperational) {
    // known error → show the user
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // unknown error → don't leak details
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// Global error middleware
const errorHandler = (
  err: AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(err, res);
  } else {
    prodError(err, res);
  }
};

export default errorHandler;