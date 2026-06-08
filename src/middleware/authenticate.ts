import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// type UserPayload = {
//   id?: string;
//   email?: string;
//   role?: string;
// };

// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const authHeader = req.headers.authorization;

//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({
//       message: "Unauthorized"
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     );

//     if (typeof decoded === "string") {
//       return res.status(401).json({
//         message: "Invalid token"
//       });
//     }

//     const payload = decoded as JwtPayload & UserPayload;

//     (req as any).user = {
//       id: payload.id,
//       email: payload.email,
//       role: payload.role
//     };

//     next();

//   } catch (error) {

//     return res.status(401).json({
//       message: "Invalid token"
//     });
//   }
// };


import { supabase } from "../lib/supabase";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token =
    req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const {
    data,
    error
  } = await supabase.auth.getUser(
    token
  );

  if (error || !data.user) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  (req as any).user = {
    id: data.user.id,
    email: data.user.email
  };

  next();
};