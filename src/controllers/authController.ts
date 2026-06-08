import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing admin env variables");
}

// export const adminLogin = async (
//   req: Request,
//   res: Response
// ) => {

//   const { email, password } = req.body;

//   if (
//     email !== ADMIN_EMAIL ||
//     password !== ADMIN_PASSWORD
//   ) {
//     return res.status(401).json({
//       message: "Invalid credentials"
//     });
//   }

//   const payload = {
//     email,
//     role: "admin"
//   };

//   const secret: Secret =
//     process.env.JWT_SECRET as string;

//   const options: SignOptions = {
//     expiresIn: "1d"
//   };

//   const token = jwt.sign(
//     payload,
//     secret,
//     options
//   );

//   return res.status(200).json({
//     accessToken: token
//   });
// };


import { asyncHandler } from "../utils/asyncHandler";
import { loginAdmin } from "../services/authService";
import { AppError } from "../utils/AppError";
import { log } from "../utils/logger";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    log.info(`🔐 LOGIN ATTEMPT ${email}`);

    // logowanie przez backend do Supabase
    const session = await loginAdmin(email, password);

    const payload = JSON.parse(
      Buffer.from(
        session.access_token.split(".")[1],
        "base64"
      ).toString()
    );

    const expiresAt = new Date(payload.exp * 1000).toISOString();

    if (!session?.access_token) {
      throw new AppError(
        "Invalid login response from auth provider",
        500
      );
    }

    log.info(`✅ LOGIN SUCCESS ${session.user.id}`);

    // Używamy tokenów zwróconych przez Supabase
    const accessToken = session.access_token;
    const refreshToken = session.refresh_token;

    // Ciasteczko access_token
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,        // HTTPS only
      sameSite: "none",    // wymagane dla cross-domain
      maxAge: 60 * 60 * 1000 // 1h
    });

    // Ciasteczko refresh_token
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dni
    });

    // Zwracamy minimalne info o użytkowniku
    return res.status(200).json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      session: {
        expiresAt
      }
    });
  }
);