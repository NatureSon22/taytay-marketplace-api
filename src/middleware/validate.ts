import { AnyZodObject } from "zod/v3";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
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

export default validate;
