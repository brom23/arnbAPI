import { z } from "zod";

export const apartmentImageSchema = z.object({

  id: z
    .string()
    .uuid("Invalid image id")
    .optional(),

  apartment_id: z
    .string()
    .uuid("Invalid apartment id"),

  image_url: z
    .string()
    .url("Invalid image URL"),

  created_at: z
    .string()
    .datetime("Invalid created_at datetime")
    .optional(),

  position: z
    .number({
      message: "Position must be a number"
    })
    .int("Position must be an integer")
    .min(0, "Position cannot be negative")
    .default(0),

  is_cover: z
    .boolean({
      message: "is_cover must be boolean"
    })
    .default(false)
});

export const createApartmentImageSchema = z.object({

  apartment_id: z
    .string()
    .uuid("Invalid apartment id"),

  image_url: z
    .string()
    .url("Invalid image URL"),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),

  is_cover: z
    .boolean()
    .optional()
});

export const updateApartmentImageSchema =
  createApartmentImageSchema.partial();

  export const uploadApartmentImageSchema = z.object({
  apartmentId: z
    .string()
    .uuid("Invalid apartment id")
});