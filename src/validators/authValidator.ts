import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .nonempty("Password is required")
});