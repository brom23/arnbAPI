import { supabaseAdmin } from "../../lib/supabase";
import { AppError } from "../../utils/AppError";

export const loginAdminService = async (email: string, password: string) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new AppError(error.message, 401);
  }

  if (!data?.session) {
    throw new AppError("Invalid login response", 500);
  }

  return data;
};

export const logoutAdminService = async (userId: string) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(userId);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return true;
};

export const getUserFromTokenService = async (accessToken: string) => {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AppError("Unauthorized", 401);
  }

  return data.user;
};

export const decodeJwtExpiry = (token: string) => {
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );

  return new Date(payload.exp * 1000).toISOString();
};

export const refreshSessionService = async (refreshToken: string) => {
  const { data, error } =
    await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken
    });

  if (error || !data?.session) {
    throw new AppError("Refresh failed", 401);
  }

  return data;
};