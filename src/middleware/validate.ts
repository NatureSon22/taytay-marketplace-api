import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { ZodObject, ZodRawShape } from "zod";

type MulterRequest = Request & {
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
};

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
  (schema: ZodObject, withPictures = false, fieldForPicture = "") =>
  (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      let data = { ...req.body };

      if (withPictures) {
        let files: Express.Multer.File[] = [];

        if (Array.isArray(req.files)) {
          files = req.files;
        } else if (req.file) {
          files = [req.file];
        }

        if (!files.length) {
          return next(new AppError("No images uploaded", 400));
        }

        const images = files.map((file) => file.path);
        data = {
          ...data,
          [fieldForPicture]: images.length > 1 ? images : images[0],
        };
      }

      console.log(data);
      const result = schema.safeParse(data);

      if (!result.success) {
        const message = result.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
          
        return next(new AppError(message, 422));
      }

      req.body = result.data;
      next();
    } catch (err) {
      next(err);
    }
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
