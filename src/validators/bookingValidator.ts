import { z } from 'zod';

export const bookingSchema = z.object({
    apartment_id: z.string().uuid(),
    check_in: z.string(),   // ISO date
    check_out: z.string(),  // ISO date

    guests: z.number().int().positive(),

    email: z.string().email(), // 🔥 REQUIRED

    total_price: z.number().positive().optional(),

    status: z.string().optional(),
    hold_expires_at: z.string().optional()
    //@TODO
    // Dopisac name, surname, phone_number, address, city, country, zip_code. 
});