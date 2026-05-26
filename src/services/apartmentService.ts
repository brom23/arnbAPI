import { supabase } from '../lib/supabase';
import { removeFileFromStorage } from '../utils/storage';

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

export const deleteApartmentById = async (
  id: string
) => {

  // 1. Pobierz wszystkie zdjęcia apartamentu
  const { data: images, error: imagesError } = await supabase
    .from("apartment_images")
    .select("*")
    .eq("apartment_id", id);

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  // 2. Usuń pliki ze storage
  if (images && images.length > 0) {

    await Promise.all(
      images.map((image) =>
        removeFileFromStorage(
          "apartments",
          image.url
        )
      )
    );

    // 3. Usuń rekordy zdjęć
    const { error: deleteImagesError } = await supabase
      .from("apartment_images")
      .delete()
      .eq("apartment_id", id);

    if (deleteImagesError) {
      throw new Error(deleteImagesError.message);
    }
  }

  // 4. Usuń apartment
  const { data, error } = await supabase
    .from("apartments")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateApartmentCover = async (
  apartmentId: string,
  imageId: string
) => {

  // sprawdź czy zdjęcie należy do apartamentu
  const { data: image, error: imageError } = await supabase
    .from('apartment_images')
    .select('*')
    .eq('id', imageId)
    .eq('apartment_id', apartmentId)
    .single();

  if (imageError || !image) {
    throw new Error('Image not found for this apartment');
  }

  // update cover
  const { data, error } = await supabase
    .from('apartments')
    .update({
      image: image.image_url
    })
    .eq('id', apartmentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateApartmentCoverByImage = async (
  apartmentId: string,
  imageId: string
) => {

  // 1. pobierz zdjęcie
  const { data: image, error: imageError } = await supabase
    .from('apartment_images')
    .select('image_url')
    .eq('id', imageId)
    .eq('apartment_id', apartmentId)
    .single();

  if (imageError || !image) {
    throw new Error('Image not found');
  }

  // 2. update apartments.image
  const { data, error } = await supabase
    .from('apartments')
    .update({
      image: image.image_url
    })
    .eq('id', apartmentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchImagesByApartmentId = async (apartmentId: string) => {

    const { data, error } = await supabase
        .from('apartment_images')
        .select('*')
        .eq('apartment_id', apartmentId)
        .order('position', { ascending: true });

    if (error) throw error;

    return data;
};

export const fetchApartmentsPaginated = async (params: {
  page: number;
  limit: number;
  city?: string;
  guests?: number;
}) => {

  const { page, limit, city, guests } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("apartments")
    .select("*", { count: "exact" });

  // 🔎 filters
  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (guests) {
    query = query.gte("guests", guests);
  }

  // 📄 pagination
  query = query.range(from, to);

  // 📊 sort (default newest)
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

export const fetchAvailableApartments = async (params: {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  city?: string;
  guests?: number;
}) => {

  const { page, limit, from, to, city, guests } = params;

  const offset = (page - 1) * limit;

  // 1. znajdź konflikty bookingów
  let bookedApartmentIds: string[] = [];

  if (from && to) {

    const { data: conflicts, error } = await supabase
      .from("bookings")
      .select("apartment_id")
      .lt("check_in", to)
      .gt("check_out", from);

    if (error) {
      throw new Error(error.message);
    }

    bookedApartmentIds =
      conflicts?.map(b => b.apartment_id) || [];
  }

  // 2. apartments query
  let query = supabase
    .from("apartments")
    .select("*", { count: "exact" });

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (guests) {
    query = query.gte("guests", guests);
  }

  if (bookedApartmentIds.length > 0) {
    query = query.not(
      "id",
      "in",
      `(${bookedApartmentIds.join(",")})`
    );
  }

  query = query.range(offset, offset + limit - 1);
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