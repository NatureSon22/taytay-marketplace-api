import { Response } from "express";

export const handleError = (
  res: Response,
  error: unknown,
  message = "Server error",
  status = 500
) => {
  console.error(error); 
  return res.status(status).json({
    status: "error",
    message,
    details: error instanceof Error ? error.message : error,
  });
};
