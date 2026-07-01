import { supabaseAnon } from '../../lib/supabase';
import { ApartmentPriceMap, ApartmentPricingResponse } from '../../types/apartmentPricingResponse';
import { AppError } from '../../utils/AppError';
import { removeFileFromStorage } from '../../utils/storage';
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const URL_STORAGE = process.env.SUPABASE_IMAGE_URL_STORAGE!;

export const fetchApartments = async () => {

  const { data, error } = await supabaseAnon
    .from('apartments')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const fetchApartmentById = async (
  apartmentId: string
) => {

  const { data, error } = await supabaseAnon
    .from("apartments")
    .select(`
      *,
      apartment_images (*)
    `)
    .eq("id", apartmentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const insertApartment = async (supabase: SupabaseClient, payload: any) => {

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

  if (error) {
    throw error;
  }

  return data;
};

export const fetchApartmentBookings = async (supabase: SupabaseClient,
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
    throw error;
  }

  return data;
};

export const updateApartmentById = async (
  supabase: SupabaseClient,
  id: string,
  payload: any
) => {
  const { data, error } = await supabase
    .from("apartments")
    .update({
      ...payload,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Resource not found", 404);
  }

  return data;
};

export const deleteApartmentById = async (supabase: SupabaseClient,
  id: string
) => {

  // 1. Pobierz wszystkie zdjęcia apartamentu
  const { data: images, error: imagesError } = await supabase
    .from("apartment_images")
    .select("*")
    .eq("apartment_id", id);

  if (imagesError) {
    throw imagesError;
  }

  if (images?.length) {
    const storageImages = images.filter((img) =>
      img.url?.includes(URL_STORAGE)
    );

    await Promise.all(
      storageImages.map((image) =>
        removeFileFromStorage("apartments", image.url)
      )
    );
  }

  // 3. Usuń rekordy zdjęć
  const { error: deleteImagesError } = await supabase
    .from("apartment_images")
    .delete()
    .eq("apartment_id", id);

  if (deleteImagesError) {
    throw deleteImagesError;
  }

  // 4. Usuń apartment
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

export const updateApartmentCover = async (supabase: SupabaseClient,
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

  // usuń flagę cover ze wszystkich zdjęć apartamentu
  const { error: resetCoverError } = await supabase
    .from('apartment_images')
    .update({ is_cover: false })
    .eq('apartment_id', apartmentId);

  if (resetCoverError) {
    throw resetCoverError;
  }

  // ustaw wybrane zdjęcie jako cover
  const { error: setCoverError } = await supabase
    .from('apartment_images')
    .update({ is_cover: true })
    .eq('id', imageId);

  if (setCoverError) {
    throw setCoverError;
  }

  // update main cover in apartments.image
  const { data, error } = await supabase
    .from('apartments')
    .update({
      image: image.image_url
    })
    .eq('id', apartmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateApartmentCoverByImage = async (supabase: SupabaseClient,
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

  // apartmentId || imageId - nie ma ich w bazie.
  if (imageError || !image) {
    throw new AppError("Resource not found", 404);
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
    throw error;
  }

  return data;
};

export const fetchImagesByApartmentId = async (apartmentId: string) => {

  const { data, error } = await supabaseAnon
    .from('apartment_images')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

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

  let query = supabaseAnon
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
    throw error;
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
  from?: string;
  to?: string;
  city?: string;
  guests?: number;
}) => {
  const { from, to, city, guests } = params;

  if (!from || !to) return [];

  const start = new Date(from);
  const end = new Date(to);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // ❌ blokujemy 0 lub ujemne noce
  const nights =
    (end.getTime() - start.getTime()) /
    (1000 * 60 * 60 * 24);

  if (nights < 1) return [];

  // ----------------------------
  // 1. znajdź konflikty bookingów
  // ----------------------------
  const { data: conflicts, error } = await supabaseAnon
    .from("bookings")
    .select("apartment_id")
    .lt("check_in", to)
    .gt("check_out", from);

  if (error) {
    throw error;
  }

  const bookedApartmentIds =
    [...new Set(conflicts?.map(b => b.apartment_id).filter(Boolean))];

  // ----------------------------
  // 2. apartments query
  // ----------------------------
  let query = supabaseAnon
    .from("apartments")
    .select(`
      *,
      apartment_images (*)
    `);

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

  query = query.order("created_at", { ascending: false });

  const { data, error: qErr } = await query;

  if (qErr) {
    throw qErr;
  }

  return data || [];
};

export const fetchApartmentsWithBookings = async () => {

  const { data, error } = await supabaseAnon
    .from('apartments')
    .select(`
      *,
      apartment_images (*),
      bookings (
        check_in,
        check_out
      )
    `)

  if (error) {
    throw error;
  }

  return data ?? [];
};

//wszystkie apartamenty bez zdjec tylko okladka
export const fetchAllApartments = async () => {
  const { data, error } = await supabaseAnon
    .from("apartments")
    .select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
};


export async function fetchApartmentPricingById(
  apartmentId: string,
  from?: string,
  to?: string
): Promise<ApartmentPricingResponse> {

  const apartment = await fetchApartmentById(apartmentId);

  if (!apartment) {
    throw new AppError("Resource not found", 404);
  }

  let query = supabaseAnon
    .from("apartment_pricing")
    .select("date, price")
    .eq("apartment_id", apartmentId)
    .order("date", { ascending: true });

  // 🔥 VALIDACJA RANGE
  if (from && !to) {
    throw new AppError("Query parameter 'to' is required when 'from' is provided", 400);
  }

  if (to && !from) {
    throw new AppError("Query parameter 'from' is required when 'to' is provided", 400);
  }

  if (from && to) {
    if (from > to) {
      throw new AppError("'from' cannot be greater than 'to'", 400);
    }

    query = query.gte("date", from).lte("date", to);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data || data.length === 0) {
    throw new AppError("No pricing found for this apartment", 404);
  }

  // 🔥 MAP → OBJECT
  const prices: ApartmentPriceMap = {};

  data.forEach((row) => {
    prices[row.date] = Number(row.price);
  });

  return { prices };
}

export const updateApartmentStatus = async (
  supabase: SupabaseClient,
  id: string,
  status: string
) => {
  const { data, error } = await supabase
    .from("apartments")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Resource not found", 404);
  }

  return data;
};

export const upsertApartmentPricingService = async (
  supabase: SupabaseClient,
  apartmentId: string,
  items: { date: string; price: number }[]
) => {

  const payload = items.map((i) => ({
    apartment_id: apartmentId,
    date: i.date,
    price: i.price,
  }));

  const { data, error } = await supabase
    .from("apartment_pricing")
    .upsert(payload, {
      onConflict: "apartment_id,date",
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteApartmentPricingService = async (
  supabase: SupabaseClient,
  apartmentId: string,
  from: string,
  to?: string
) => {

  let query = supabase
    .from("apartment_pricing")
    .delete()
    .eq("apartment_id", apartmentId);

  // only one day
  if (!to) {
    const { error } = await query.eq("date", from);

    if (error) {
      throw error;
    }

    return { message: "Pricing deleted successfully" };
  }

  // range delete
  const { error } = await query
    .gte("date", from)
    .lte("date", to);

  if (error) {
    throw error;
  }

  return { message: "Pricing range deleted successfully" };
};