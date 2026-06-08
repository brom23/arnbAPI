import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { log } from "../utils/logger";

declare module "express" {
  export interface Request {
    id?: string;
  }
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  req.id = randomUUID();

  // REQUEST START
  log.info(
    `[${req.id}] ➡️ ${req.method} ${req.originalUrl}`
  );

  res.on("finish", () => {
    const ms = Date.now() - start;

    const level =
      res.statusCode >= 500
        ? "error"
        : res.statusCode >= 400
        ? "warn"
        : "info";

    log[level](
      `[${req.id}] ⬅️ ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`
    );
  });

  next();
};