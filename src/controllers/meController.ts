import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { supabase } from "../lib/supabase";

export const meController = asyncHandler(
  async (req: Request, res: Response) => {

    const token = req.cookies?.access_token;

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const { data, error } =
      await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError("Unauthorized", 401);
    }

    // OPTIONAL: role z DB (jeśli masz profiles)
    // const profile = await getProfile(data.user.id)

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        // role: profile.role
      }
    });
  }
);