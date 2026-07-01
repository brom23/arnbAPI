import { z } from "../../bootstrap/zod";

const uuidSchema = z.string().uuid();

export const imageIdSchema = z
  .string()
  .uuid()
  .openapi({
    description: "Image ID",
    example: "c2f9c3b2-1a2b-4c1d-9f3a-123456789abc"
  });

export const apartmentIdSchema = z
  .string()
  .uuid()
  .openapi({
    description: "Apartment ID",
    example: "c2f9c3b2-1a2b-4c1d-9f3a-123456789abc"
  });

export const bookingIdSchema = uuidSchema;