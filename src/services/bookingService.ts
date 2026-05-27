import { supabase } from '../lib/supabase';

export const fetchBookings = async () => {

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
};

export const fetchBookingById= async (id: string) => {

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
};


export const insertBooking = async (payload: any) => {

    const { data, error } = await supabase
        .from('bookings')
        .insert([
            {
                apartment_id: payload.apartment_id,
                check_in: payload.check_in,
                check_out: payload.check_out,
                guests: payload.guests,
                email: payload.email,

                total_price: payload.total_price ?? null,
                status: payload.status ?? 'pending',
                // dodaj 15 minut od teraz jako hold_expires_at
                hold_expires_at: new Date(
                                    Date.now() + 15 * 60 * 1000
                                    ).toISOString(),
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) throw error;

    return data;
};

export const checkApartmentAvailability = async (
    apartmentId: string,
    checkIn: string,
    checkOut: string
) => {

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('apartment_id', apartmentId)

        // overlap logic
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

    if (error) throw error;

    return data;
};

export const updateBooking = async (
  id: string,
  payload: any
) => {

  const { data, error } = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteBooking = async (
  id: string
) => {

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const updateBookingStatus = async (
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
    throw new Error(error.message);
  }

  return data;
};

export const fetchBookingsByApartmentId = async (
  apartmentId: string
) => {

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("check_in", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchBookingsPaginated = async (params: {
  page: number;
  limit: number;
  status?: string;
  apartment_id?: string;
  email?: string;
  fromDate?: string;
  toDate?: string;
}) => {

  const { page, limit, status, apartment_id, email, fromDate, toDate } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" });

  // 🔎 filters
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

  // 📄 pagination
  query = query.range(from, to);

  // 📊 sorting
  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
};

export const fetchBlockedBookings = async (
  apartmentId: string
) => {

  const { data, error } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("apartment_id", apartmentId);

  if (error) throw error;

  return data;
};