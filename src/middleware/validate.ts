import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { ZodObject, ZodRawShape } from "zod";

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(target: any, source: any): any {
  // non-objects: source replaces target
  if (!isObject(source)) return source;

  const out: any = Array.isArray(target)
    ? [...target]
    : { ...(isObject(target) ? target : {}) };

  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = out[key];

    if (isObject(sVal) && isObject(tVal)) {
      out[key] = deepMerge(tVal, sVal);
    } else {
      // source (validated) wins
      out[key] = sVal;
    }
  }

  return out;
}

export const validateAndMerge =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const base = (req as any).validatedBody ?? req.body;
    const result = schema.safeParse(base);

    if (!result.success) {
      console.log(base);
      const errorMessages = result.error.issues
        .map((i) => i.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    req.body = deepMerge(base, result.data);
    return next();
  };

export const validateBody =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    // if a route will go through two of this, the prevData will be deleted which shouldnt be
    const prevData = req.body;
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    req.body = { ...result.data, ...prevData };
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

export const validateQuery =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((i) => i.message)
        .join(", ");
      return next(new AppError(errorMessages, 422));
    }

    (req as any).query = result.data;
    next();
  };
