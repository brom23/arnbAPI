import { z } from "../../bootstrap/zod";

export const loginSchema =z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const  meResponseSchema = z.object({
  authenticated: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email()
  }),
  session: z.object({
    expiresAt: z.string()
  })
})

export const  refreshResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email().optional()
  })
})

export const  logoutResponseSchema = z.object({
  message: z.string()
})

