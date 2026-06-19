import { randomUUID } from 'crypto';
import { supabaseAnon,supabaseAdmin } from '../lib/supabase';
import { removeFileFromStorage } from '../utils/storage';
import { AppError } from '../utils/AppError';

const URL_STORAGE =
    `https://hhprezzotbbatuqjihry.supabase.co/storage/v1/object/public/apartment_images/`;

export const insertApartmentImage = async (payload: any) => {

    const { data, error } = await supabaseAnon
        .from('apartment_images')
        .insert([
            {
                apartment_id: payload.apartment_id,
                image_url: payload.image_url,
                position: payload.position ?? 0,
                is_cover: payload.is_cover ?? false,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) throw error;

    return data;
};

export const fetchApartmentImages = async () => {

    const { data, error } = await supabaseAnon
        .from('apartment_images')
        .select('*')
        .order('position', { ascending: true });

    if (error) throw error;

    return data;
};

export const fetchApartmentImageById = async (
  id: string
) => {

  const { data, error } = await supabaseAnon
    .from("apartment_images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {

    console.error(
      "❌ FETCH APARTMENT IMAGE BY ID ERROR:",
      error.message
    );

    return null;
  }

  return data;
};

export const storeApartmentImage = async (
  file: Express.Multer.File,
  apartmentId: string
) => {
  if (!file) {
    throw new Error("Image file is required");
  }

  if (!apartmentId) {
    throw new Error("Apartment ID is required");
  }

  const fileName = file.originalname
    .toLowerCase()
    .replace(/\s/g, "-");

  const filePath = `${randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("apartment_images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const imageUrl =
    `https://hhprezzotbbatuqjihry.supabase.co/storage/v1/object/public/apartment_images/${filePath}`;

  // Pobierz ostatnią pozycję
  const { data: lastImage, error: positionError } = await supabaseAdmin
    .from("apartment_images")
    .select("position")
    .eq("apartment_id", apartmentId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const nextPosition = lastImage
    ? lastImage.position + 1
    : 0;

  const { data, error } = await supabaseAdmin
    .from("apartment_images")
    .insert([
      {
        apartment_id: apartmentId,
        image_url: imageUrl,
        position: nextPosition,
        is_cover: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateApartmentImageById = async (
  id: string,
  data: any
) => {

  const { data: updatedImage, error } =
    await supabaseAdmin
      .from("apartment_images")
      .update(data)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return updatedImage;
};

export const deleteApartmentImage = async (
  id: string
) => {

  // 1. Pobierz image
  const { data: image, error: fetchError } = await supabaseAnon
    .from("apartment_images")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    throw new AppError("Resource not found", 404);
  }

  // 2. Usuń plik ze storage tylko jeśli jest w bucketcie apartments
  const isStorageFile =
    image.url?.includes(URL_STORAGE)

  // 3. Usuń plik ze storage
  if (isStorageFile) {
    await removeFileFromStorage("apartments", image.url);
  }

  
  // await removeFileFromStorage(
  //   "apartments",
  //   image.url
  // );

  // 4. Usuń rekord z DB
  const { error: deleteError } = await supabaseAdmin
    .from("apartment_images")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return true;
};

