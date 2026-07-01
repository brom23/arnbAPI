import { z } from "../../bootstrap/zod";
import {
  imageIdSchema,
  apartmentIdSchema
} from "../../shared/constants/ids";

export const apartmentImageSchema = z.object({
  id: imageIdSchema.optional(),
  apartment_id: apartmentIdSchema,
  image_url: z.string().url("Invalid image URL"),
  created_at: z.string().datetime().optional(),
  position: z.number().int().min(0).default(0),
  is_cover: z.boolean().default(false)
});

export const createApartmentImageSchema =
  apartmentImageSchema.pick({
    apartment_id: true,
    image_url: true,
    position: true,
    is_cover: true
  });

export const updateApartmentImageSchema =
  createApartmentImageSchema.partial();

export const apartmentImageParamsSchema = z.object({
  id: imageIdSchema
});

export const deleteApartmentImageSchema = apartmentImageParamsSchema;

export const uploadApartmentImageSchema = z.object({
  apartmentId: apartmentIdSchema
});

export type CreateApartmentImageDTO =
  z.infer<typeof createApartmentImageSchema>;

import { registry } from "../../docs/registry";

  
export const CreateApartmentImageSchema =
  registry.register(
    "CreateApartmentImage",
    createApartmentImageSchema
  );

registry.register(
  "ApartmentImageParams",
  apartmentImageParamsSchema
);