import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing admin env variables");
}

export const adminLogin = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError("Missing request body", 400);
    }

    const { email, password } = req.body;

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      throw new AppError("Invalid credentials", 401);
    }

    const payload = {
      email: ADMIN_EMAIL,
      role: "admin"
    };

    const secret: Secret = process.env.JWT_SECRET as string;

    const options: SignOptions = {
      expiresIn: "1d"
    };

    const token = jwt.sign(
      payload,
      secret,
      options
    );

    return res.status(200).json({
      accessToken: token
    });
  }
);