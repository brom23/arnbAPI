import { z } from 'zod';

export const apartmentImageSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1),
    slug: z.string().nullable().optional(),
    description: z.string().min(1),
    price_per_night: z.number().nonnegative(),
    guests: z.number().int().positive(),
    city: z.string().min(1),
    image: z.string().url(),
    created_at: z.string().datetime().optional(),
    base_price: z.number().nonnegative(),
    max_rooms: z.number().int().positive(),
    cancellation_type: z.string(),
    apartment_number: z.string(),
    floor: z.string(),
    staircase: z.string(),
    has_balcony: z.boolean(),
    amenities: z.string(),
    beds: z.number().int().positive(),
    min_guests: z.number().int().positive()
});