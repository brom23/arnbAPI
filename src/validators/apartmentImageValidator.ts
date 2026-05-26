import { z } from "zod";

export const apartmentImageSchema = z.object({
  id: z.string().uuid().optional(),
  apartment_id: z.string().uuid(),
  image_url: z.string().url(),
  position: z.number().int().nonnegative().optional(),
  is_cover: z.boolean().optional(),
  created_at: z.string().datetime().optional()
});