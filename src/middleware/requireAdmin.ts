// import { Request, Response, NextFunction } from "express";

// export const requireAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   if ((req as any).user?.role !== "admin") {
//     return res.status(403).json({
//       message: "Forbidden (admin only)"
//     });
//   }

//   next();
// };

// src/middleware/requireAdmin.ts
import { Request, Response, NextFunction } from "express";
//import { supabase } from "../lib/supabase";
import { AppError } from "../utils/AppError";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const supabaseUser = req.supabase;

  if (!user?.id || !supabaseUser) {
    throw new AppError("Unauthorized", 401);
  }

  // Sprawdź w bazie czy user.id istnieje w tabeli adminów
  const { data, error } = await supabaseUser
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new AppError("Forbidden (admin only)", 403);
  }

  // user jest adminem, przejdź dalej
  next();
};