import "express";
import { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
      admin?: {
        role: string;
        permissions?: string[];
      };
      supabase?: SupabaseClient; 
      supabaseAdmin?: SupabaseClient;
    }
  }
}