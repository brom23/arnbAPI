import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  console.error("❌ ERROR:", err);

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON format",
      example: {
        field: "value"
      }
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.details instanceof ZodError
        ? err.details.issues.map(i => ({
            field: i.path.join("."),
            message: i.message
          }))
        : err.details
    });
  }

  // if (err instanceof ZodError) {
  //   return res.status(400).json({
  //     message: "Validation error",
  //     errors: err.issues.map((issue) => ({
  //       field: issue.path.join("."),
  //       message: issue.message
  //     }))
  //   });
  // }

  // fallback
  return res.status(500).json({
    message: "Internal server error"
  });
};

