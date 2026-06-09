import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../utils/AppError";

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    await supabaseAdmin.auth.admin.signOut(
      req.user.id
    );

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return res.status(200).json({
      message: "Logged out"
    });
  }
);