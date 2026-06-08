import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

export const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    logFormat
  ),
  transports: [
    // console (kolorowy)
    new winston.transports.Console(),

    // pliki (render / produkcja)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export const log = {
  debug: (msg: string, meta?: any) =>
    logger.debug(`${msg} ${meta ? JSON.stringify(meta) : ""}`),

  info: (msg: string, meta?: any) =>
    logger.info(`${msg} ${meta ? JSON.stringify(meta) : ""}`),

  warn: (msg: string, meta?: any) =>
    logger.warn(`${msg} ${meta ? JSON.stringify(meta) : ""}`),

  error: (msg: string, meta?: any) =>
    logger.error(`${msg} ${meta ? JSON.stringify(meta) : ""}`),
};