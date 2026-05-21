import { z } from 'zod';

export const apartmentSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    price_per_night: z.number().positive(),
    city: z.string().min(2),
    image: z.string().url().optional(),
    guests: z.number().int().positive().optional(),
    slug: z.string().optional()
});