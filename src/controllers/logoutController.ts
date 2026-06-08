import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { supabase } from "../lib/supabase";

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const accessToken = req.cookies?.access_token;

      if (accessToken) {
        const { data } =
          await supabase.auth.getUser(accessToken);

        if (data.user) {
          await supabase.auth.admin.signOut(
            data.user.id
          );
        }
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

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