import { z } from "zod";

/**
 * 🔹 BASE SCHEMA (bez refine!)
 * używany do UPDATE i jako fundament
 */
export const bookingBaseSchema = z.object({
  apartment_id: z.string().uuid(),

  check_in: z.string().date(),
  check_out: z.string().date(),

  guests: z.number().int().positive(),

  email: z.string().email(),

  total_price: z.number().nonnegative(),

  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),

  phone: z.string().trim().min(6).max(30),

  city: z.string().trim().min(1).max(100),
  zip: z.string().trim().min(1).max(20),
  street: z.string().trim().min(1).max(255),
  country: z.string().trim().min(1).max(100),

  notes: z.string().max(2000).optional().default("")
});

/**
 * 🔹 CREATE BOOKING (z walidacją biznesową)
 */
export const bookingSchema = bookingBaseSchema.refine(
  (data) =>
    new Date(data.check_out) > new Date(data.check_in),
  {
    message: "check_out must be after check_in",
    path: ["check_out"]
  }
);

/**
 * 🔹 UPDATE BOOKING (FIX — BEZ refine)
 * TERAZ DZIAŁA POPRAWNIE
 */
export const updateBookingSchema = bookingBaseSchema.partial();

/**
 * 🔹 STATUS SCHEMA
 */
export const bookingStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "cancelled",
    "completed"
  ])
});

/**
 * 🔹 QUERY SCHEMA
 */
export const bookingQuerySchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "cancelled",
    "completed"
  ]).optional(),

  apartment_id: z.string().uuid().optional(),

  email: z.string().email().optional(),

  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional()
});

export const bookingIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const blockedBookingsSchema = z.object({
  apartmentId: z.string().uuid()
});

/**
 * 🔹 TYPES
 */
export type CreateBookingDto = z.infer<typeof bookingSchema>;
export type UpdateBookingDto = z.infer<typeof updateBookingSchema>;
export type BookingStatusDto = z.infer<typeof bookingStatusSchema>;
