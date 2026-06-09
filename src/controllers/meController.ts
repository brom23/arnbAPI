import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { supabaseAnon } from "../lib/supabase";

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new AppError("Unauthorized", 401);
    }

    const { data, error } =
      await supabaseAnon.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new AppError("Unauthorized", 401);
    }

    // Odczyt exp z JWT
    const payload = JSON.parse(
      Buffer.from(
        accessToken.split(".")[1],
        "base64"
      ).toString()
    );

    const expiresAt = new Date(
      payload.exp * 1000
    ).toISOString();

    return res.status(200).json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        expiresAt,
      },
    });
  }
);