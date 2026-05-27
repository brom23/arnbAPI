import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing admin env variables");
}

export const adminLogin = async (
  req: Request,
  res: Response
) => {

  const { email, password } = req.body;

  if (
    email !== ADMIN_EMAIL ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  const payload = {
    email,
    role: "admin"
  };

  const secret: Secret =
    process.env.JWT_SECRET as string;

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
};