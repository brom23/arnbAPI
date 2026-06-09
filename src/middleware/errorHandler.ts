import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { log } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id;

  // 🔴 zawsze logujemy błąd z kontekstem requestu
  log.error(
    `[${requestId}] ❌ ERROR ${req.method} ${req.originalUrl} - ${err?.message}`,
    {
      stack: err?.stack,
    }
  );

  // 🧨 JSON parse error
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON format",
      example: {
        field: "value",
      },
    });
  }

   if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.issues.map(i => ({
        field: i.path.join("."),
        message: i.message
      }))
    });
  }

  // ⚙️ AppError (Twoja logika biznesowa)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors:
        err.details instanceof ZodError
          ? err.details.issues.map((i) => ({
              field: i.path.join("."),
              message: i.message,
            }))
          : err.details,
    });
  }

  // 💥 fallback
  return res.status(500).json({
    message: "Internal server error",
  });
};