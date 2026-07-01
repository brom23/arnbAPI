import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

import {
  loginAdminService,
  logoutAdminService,
  getUserFromTokenService,
  decodeJwtExpiry
} from "./service";

import { log } from "../../utils/logger";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    log.info(`🔐 LOGIN ATTEMPT ${email}`);

    const data = await loginAdminService(email, password);

    const session = data.session;
    const user = data.user;

    const accessToken = session.access_token;
    const refreshToken = session.refresh_token;

    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString()
    );

    const expiresAt = new Date(payload.exp * 1000).toISOString();

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    log.info(`✅ LOGIN SUCCESS ${user.id}`);

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      session: {
        expiresAt
      }
    });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    await logoutAdminService(req.user.id);

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

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await getUserFromTokenService(accessToken);
    const expiresAt = decodeJwtExpiry(accessToken);

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      session: {
        expiresAt
      }
    });
  }
);

import { refreshSessionService } from "./service";

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 60 * 60 * 1000 // 1h
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dni
};

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const data = await refreshSessionService(refreshToken);

    const session = data.session;
    const user = data.user;

    if (!session?.access_token || !session?.refresh_token) {
      throw new AppError("Invalid refresh response", 500);
    }

    res.cookie(
      "access_token",
      session.access_token,
      accessCookieOptions
    );

    res.cookie(
      "refresh_token",
      session.refresh_token,
      refreshCookieOptions
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email
      }
    });
  }
);