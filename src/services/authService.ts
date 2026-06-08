import { supabase } from "../lib/supabase";
import { AppError } from "../utils/AppError";

export async function loginAdmin(
  email: string,
  password: string
) {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error || !data.session) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  return {
    access_token:
      data.session.access_token,

    refresh_token:
      data.session.refresh_token,

    user: {
      id: data.user.id,
      email: data.user.email
    }
  };
}