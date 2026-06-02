import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';
import { removeFileFromStorage } from '../utils/storage';

export const fetchApartments = async () => {

    const { data, error } = await supabase
        .from('apartments')
        .select('*');

    if (error) throw error;

    return data;
};

export const fetchApartmentById = async (
  apartmentId: string
) => {

  const { data, error } = await supabase
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
  const { data: conflicts, error } = await supabase
    .from("bookings")
    .select("apartment_id")
    .lt("check_in", to)
    .gt("check_out", from);

  if (error) throw new Error(error.message);

  const bookedApartmentIds =
    [...new Set(conflicts?.map(b => b.apartment_id).filter(Boolean))];

  // ----------------------------
  // 2. apartments query
  // ----------------------------
  let query = supabase
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

  if (qErr) throw new Error(qErr.message);

  return data || [];
};

export const fetchApartmentsWithBookings = async () => {

  const { data, error } = await supabase
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
    console.error(error)
    return []
  }

  return data
}

//wszystkie apartamenty bez zdjec tylko okladka
export const fetchAllApartments = async () => {
  const { data, error } = await supabase
    .from("apartments")
    .select("*");

  if (error) {
    throw new Error(`Failed to fetch apartments: ${error.message}`);
  }

  return data ?? [];
};

export type ApartmentPriceMap = Record<string, number>;

export async function fetchApartmentPricingById(
  apartmentId: string,
  from?: string,
  to?: string
): Promise<{ prices: ApartmentPriceMap }> {
  const apartment = await fetchApartmentById(apartmentId);
  if (!apartment) throw new AppError("Apartment not found", 404);

  // Jeżeli nie ma podanych query parameters → zwróć wszystkie ceny lub base_price
  if (!from && !to) {
    const { data, error } = await supabase
      .from("apartment_pricing")
      .select("date, price")
      .eq("apartment_id", apartmentId)
      .order("date", { ascending: true });

    if (error) throw new Error(error.message);

    const prices: ApartmentPriceMap = {};
    if (data && data.length > 0) {
      data.forEach((row) => {
        const isoDate = new Date(row.date).toISOString().split("T")[0];
        prices[isoDate] = Number(row.price);
      });
    } else if (apartment.base_price) {
      prices["base_price"] = apartment.base_price;
    }

    return { prices };
  }

  // Jeżeli podano from/to → pobierz tylko w tym zakresie
  let query = supabase
    .from("apartment_pricing")
    .select("date, price")
    .eq("apartment_id", apartmentId)
    .order("date", { ascending: true });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const prices: ApartmentPriceMap = {};
  if (data && data.length > 0) {
    data.forEach((row) => {
      const isoDate = new Date(row.date).toISOString().split("T")[0];
      prices[isoDate] = Number(row.price);
    });
  }

  // Jeśli brak danych w zakresie → można zwrócić pusty obiekt
  return { prices };
}