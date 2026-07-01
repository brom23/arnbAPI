import { supabaseAnon } from '../../lib/supabase';
import { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateBookingDto } from "./validator";

import { AppError } from '../../utils/AppError';

export const fetchBookings = async (supabase: SupabaseClient,
  params: {
  status?: string;
  apartment_id?: string;
  email?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const { status, apartment_id, email, fromDate, toDate } = params;

  let query = supabase.from("bookings").select("*");

  if (status) {
    query = query.eq("status", status);
  }

  if (apartment_id) {
    query = query.eq("apartment_id", apartment_id);
  }

  if (email) {
    query = query.ilike("email", `%${email}%`);
  }

  if (fromDate) {
    query = query.gte("check_in", fromDate);
  }

  if (toDate) {
    query = query.lte("check_out", toDate);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const fetchBookingById= async (supabase: SupabaseClient,id: string) => {

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? [];
};

import type { CreateBookingDto } from "./validator";

export const insertBooking = async (
  payload: CreateBookingDto
) => {
  const { data, error } = await supabaseAnon
    .from("bookings")
    .insert([
      {
        apartment_id: payload.apartment_id,

        check_in: payload.check_in,
        check_out: payload.check_out,

        guests: payload.guests,

        email: payload.email,
        total_price: payload.total_price,

        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,

        city: payload.city,
        zip: payload.zip,
        street: payload.street,
        country: payload.country,

        notes: payload.notes ?? "",

        status: "pending",

        hold_expires_at: new Date(
          Date.now() + 15 * 60 * 1000
        ).toISOString(),

        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const checkApartmentAvailability = async (
    apartmentId: string,
    checkIn: string,
    checkOut: string
) => {

    const { data, error } = await supabaseAnon
        .from('bookings')
        .select('*')
        .eq('apartment_id', apartmentId)

        // overlap logic
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

    if (error) {
      throw error;
    }

    return data;
};

export const updateBooking = async (
  supabase: SupabaseClient,
  id: string,
  payload: UpdateBookingDto
) => {
  const updateData: UpdateBookingDto = {
    ...(payload.apartment_id !== undefined && {
      apartment_id: payload.apartment_id
    }),

    ...(payload.check_in !== undefined && {
      check_in: payload.check_in
    }),

    ...(payload.check_out !== undefined && {
      check_out: payload.check_out
    }),

    ...(payload.guests !== undefined && {
      guests: payload.guests
    }),

    ...(payload.email !== undefined && {
      email: payload.email
    }),

    ...(payload.total_price !== undefined && {
      total_price: payload.total_price
    }),

    ...(payload.first_name !== undefined && {
      first_name: payload.first_name
    }),

    ...(payload.last_name !== undefined && {
      last_name: payload.last_name
    }),

    ...(payload.phone !== undefined && {
      phone: payload.phone
    }),

    ...(payload.city !== undefined && {
      city: payload.city
    }),

    ...(payload.zip !== undefined && {
      zip: payload.zip
    }),

    ...(payload.street !== undefined && {
      street: payload.street
    }),

    ...(payload.country !== undefined && {
      country: payload.country
    }),

    ...(payload.notes !== undefined && {
      notes: payload.notes
    })
  };

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteBooking = async (supabase: SupabaseClient,
  id: string
) => {

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
};

export const updateBookingStatus = async (supabase: SupabaseClient,
  id: string,
  status: string
) => {

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchBookingsByApartmentId = async (supabase: SupabaseClient,
  apartmentId: string
) => {

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("check_in", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// export const fetchBookingsPaginated = async (params: {
//   page: number;
//   limit: number;
//   status?: string;
//   apartment_id?: string;
//   email?: string;
//   fromDate?: string;
//   toDate?: string;
// }) => {

//   const { page, limit, status, apartment_id, email, fromDate, toDate } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   let query = supabase
//     .from("bookings")
//     .select("*", { count: "exact" });

//   // 🔎 filters
//   if (status) {
//     query = query.eq("status", status);
//   }

//   if (apartment_id) {
//     query = query.eq("apartment_id", apartment_id);
//   }

//   if (email) {
//     query = query.ilike("email", `%${email}%`);
//   }

//   if (fromDate) {
//     query = query.gte("check_in", fromDate);
//   }

//   if (toDate) {
//     query = query.lte("check_out", toDate);
//   }

//   // 📄 pagination
//   query = query.range(from, to);

//   // 📊 sorting
//   query = query.order("created_at", { ascending: false });

//   const { data, error, count } = await query;

//   if (error) {
//     throw new Error(error.message);
//   }

//   return {
//     data,
//     pagination: {
//       page,
//       limit,
//       total: count || 0,
//       totalPages: Math.ceil((count || 0) / limit)
//     }
//   };
// };

export const fetchBlockedBookings = async (
  apartmentId: string
) => {

  const { data, error } = await supabaseAnon
    .from("bookings")
    .select("check_in, check_out")
    .eq("apartment_id", apartmentId);

  if (error) {
    throw error;
  }

  return data;
};

export const getBookingsCalendarService = async (
  supabase: SupabaseClient,
  from: string,
  to: string
) => {

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      apartment_id,
      check_in,
      check_out,
      email,
      status,
      guests,
      total_price,
      first_name,
      last_name,
      apartments (
        title
      )
    `)
    .lt("check_in", to)
    .gte("check_out", from)
    .order("check_in", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

type BookingStatus = "pending" | "confirmed" | "cancelled";

export const confirmBookingService = async (
  supabase: SupabaseClient,
  id: string
) => {
  const booking = await fetchBookingById(supabase, id);

  if (booking.status === "cancelled") {
    throw new AppError("Cannot confirm cancelled booking", 400);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const cancelBookingService = async (
  supabase: SupabaseClient,
  id: string
) => {
  const booking = await fetchBookingById(supabase, id);

  if (booking.status === "cancelled") {
    throw new AppError("Booking already cancelled", 400);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};