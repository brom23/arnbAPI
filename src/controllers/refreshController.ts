import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { supabase } from "../lib/supabase";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
};
export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies.refresh_token;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token missing",
        401
      );
    }

    const { data, error } =
      await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

    if (error || !data.session) {
      throw new AppError(
        "Refresh failed",
        401
      );
    }

    res.cookie(
      "access_token",
      data.session.access_token,
      cookieOptions
    );

    res.cookie(
      "refresh_token",
      data.session.refresh_token,
      cookieOptions
    );

    return res.status(200).json({
      success: true
    });
  }
);