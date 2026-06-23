import { Request, Response, NextFunction } from "express";
import { createSupabaseUserClient } from "../lib/supabase";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const supabaseUser = createSupabaseUserClient(token);

  const { data, error } = await supabaseUser.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // zapisujemy usera i klienta w req
  req.user = {
    id: data.user.id,
    email: data.user.email,
  };
  req.supabase = supabaseUser;

  next();
};