import { Request, Response, NextFunction } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from '../lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createSupabaseUserClient = (token: string): SupabaseClient => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

// Middleware do ustawienia klienta w req
export const supabaseContext = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (token) {
    // zalogowany user → RLS
    req.supabase = createSupabaseUserClient(token);
  } else {
    // publiczny dostęp
    req.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // klient admin do backendowych operacji
  req.supabaseAdmin = supabaseAdmin;

  next();
};