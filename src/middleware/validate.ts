import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { ZodObject } from "zod";

export const validateBody =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    req.body = result.data;
    next();
  };

export const validateParams =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    req.params = result.data as unknown as Request["params"];
    next();
  };
