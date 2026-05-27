import { z } from "zod";

/**
 * 🔹 BASE SCHEMA (bez refine)
 * używany jako źródło prawdy
 */
export const bookingBaseSchema = z.object({
  apartment_id: z.string().uuid(),
  check_in: z.string().date(),
  check_out: z.string().date(),
  guests: z.number().int().positive(),
  email: z.string().email(),
  total_price: z.number().nonnegative().optional()
});

/**
 * 🔹 CREATE BOOKING (z walidacją dat)
 */
export const bookingSchema = bookingBaseSchema.refine(
  (data) => new Date(data.check_out) > new Date(data.check_in),
  {
    message: "check_out must be after check_in",
    path: ["check_out"]
  }
);

/**
 * 🔹 UPDATE BOOKING (bez refine → safe .partial())
 */
export const updateBookingSchema = bookingBaseSchema.partial();

/**
 * 🔹 STATUS SCHEMA (do PATCH /status)
 */
export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"])
});

/**
 * 🔹 QUERY SCHEMA (pagination + filters)
 */
export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),

  status: z.string().optional(),
  apartment_id: z.string().uuid().optional(),
  email: z.string().email().optional(),

  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional()
});