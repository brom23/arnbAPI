import { supabase } from '../lib/supabase';

export const fetchApartments = async () => {

    const { data, error } = await supabase
        .from('apartments')
        .select('*');

    if (error) throw error;

    return data;
};

export const fetchApartmentById = async (apartmentId: string) => {

    const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', apartmentId)
        .single();

    if (error) throw error;

    return data;
};

export const insertApartment = async (payload: any) => {


    const { data, error } = await supabase
        .from('apartments')
        .insert([
            {
                title: payload.title,
                description: payload.description,
                price_per_night: payload.price_per_night,
                city: payload.city,
                image: payload.image,
                guests: payload.guests,
                slug: payload.slug
            }
        ])
        .select();

    if (error) throw error;

    return data;
};

export const fetchApartmentBookings = async (
  apartmentId: string,
  today: string
) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('check_in, check_out, status')
    .eq('apartment_id', apartmentId)
    .gte('check_out', today)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateApartmentById = async (
    id: string,
    payload: any
) => {

    const { data, error } = await supabase
        .from('apartments')
        .update({
            ...payload
        })
        .eq('id', id)
        .select();

    if (error) throw error;

    return data;
};

export const deleteApartmentById = async (id: string) => {

  const { data, error } = await supabase
    .from("apartments")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
};