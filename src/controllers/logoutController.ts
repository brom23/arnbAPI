import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const logoutController =
  asyncHandler(
    async (req: Request, res: Response) => {

      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      return res.json({
        message: "Logged out"
      });
    }
  );