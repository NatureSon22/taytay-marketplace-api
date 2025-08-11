import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const accountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  birthday: z.coerce.date("Birthday is required"),
  age: z.string().min(1, "Age is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Address is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  status: z.enum(["active", "inactive", "blocked"]).default("inactive"),
  isVerified: z.boolean().default(false),
});

const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = accountSchema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);
      return next();
    }
  } catch (error) {
    next(error);
  }
};

export { createAccount };
