import { z } from "zod";

export const ErrorResponseSchema = z.object({
  message: z.string()
});

export const SuccessResponseSchema = z.object({
  message: z.string()
});

export const ValidationErrorSchema = z.object({
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string()
    })
  )
});