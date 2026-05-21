import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing admin env variables");
}

export const adminLogin = async (
  req: Request,
  res: Response
) => {

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Missing request body"
    });
  }

  const { email, password } = req.body;

  try {

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
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

  } catch (error: any) {

    console.error(
      "❌ ADMIN LOGIN ERROR:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};