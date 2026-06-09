import { z } from "zod";

//
// BASE APARTMENT SCHEMA
//
export const apartmentSchema = z.object({

  id: z
    .string()
    .uuid("Invalid apartment id")
    .optional(),

  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),

  slug: z
    .string()
    .nullable()
    .optional(),

  description: z
    .string()
    .min(1, "Description is required"),

  price_per_night: z
    .number({
      message:
        "price_per_night must be a number"
    })
    .nonnegative(
      "price_per_night cannot be negative"
    ),

  guests: z
    .number({
      message:
        "guests must be a number"
    })
    .int("guests must be an integer")
    .positive("guests must be greater than 0"),

  city: z
    .string()
    .min(1, "City is required"),

  image: z
    .string()
    .url("Invalid image URL")
    .nullable()
    .optional(),

  created_at: z
    .string()
    .datetime("Invalid created_at datetime")
    .optional(),

  base_price: z
    .number({
      message:
        "base_price must be a number"
    })
    .nonnegative(
      "base_price cannot be negative"
    )
    .optional(),

  max_rooms: z
    .number({
      message:
        "max_rooms must be a number"
    })
    .int("max_rooms must be an integer")
    .positive("max_rooms must be greater than 0")
    .optional(),

  cancellation_type: z
    .string()
    .optional(),

  apartment_number: z
    .string()
    .optional(),

  floor: z
    .string()
    .optional(),

  staircase: z
    .string()
    .optional(),

  has_balcony: z
    .boolean({
      message:
        "has_balcony must be boolean"
    })
    .optional(),

  amenities: z
    .string()
    .optional(),

  beds: z
    .number({
      message:
        "beds must be a number"
    })
    .int("beds must be an integer")
    .positive("beds must be greater than 0")
    .optional(),

  min_guests: z
    .number({
      message:
        "min_guests must be a number"
    })
    .int("min_guests must be an integer")
    .positive(
      "min_guests must be greater than 0"
    )
    .optional()
});

//
// CREATE APARTMENT
//
export const createApartmentSchema =
  apartmentSchema.omit({
    id: true,
    created_at: true
  });

//
// UPDATE APARTMENT
//
export const updateApartmentSchema =
  createApartmentSchema.partial();

//
// APARTMENT PARAMS
//
export const apartmentParamsSchema = z.object({

  id: z
    .string()
    .uuid("Invalid apartment id")
});

//
// APARTMENT SEARCH QUERY
//
export const apartmentSearchSchema = z
  .object({
    from: z.iso.date().optional(),

    to: z.iso.date().optional(),
    city: z.string().optional(),
    guests: z.coerce
      .number()
      .int()
      .positive()
      .optional()
  })
  .refine(
    data =>
      !(
        (data.from && !data.to) ||
        (!data.from && data.to)
      ),
    {
      message:
        "Both from and to must be provided together",
      path: ["from"]
    }
  )
  .refine(
    data =>
      !(
        data.from &&
        data.to &&
        new Date(data.from) >= new Date(data.to)
      ),
    {
      message:
        "Minimum stay is 1 night",
      path: ["to"]
    }
  )  .refine(
    (data) => {
      if (!data.from || !data.to) return true;

      return new Date(data.from) <= new Date(data.to);
    },
    {
      message: "'from' cannot be greater than 'to'",
      path: ["from"]
    }
  );

//
// UPDATE COVER
//
export const updateApartmentCoverSchema =
  z.object({

    imageId: z
      .string()
      .uuid("Invalid image id")
  });