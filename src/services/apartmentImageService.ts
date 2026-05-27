import { randomUUID } from 'crypto';
import { supabase } from '../lib/supabase';
import { removeFileFromStorage } from '../utils/storage';

export const insertApartmentImage = async (payload: any) => {

    const { data, error } = await supabase
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

    const { data, error } = await supabase
        .from('apartment_images')
        .select('*')
        .order('position', { ascending: true });

    if (error) throw error;

    return data;
};

export const fetchApartmentImageById = async (
  id: string
) => {

  const { data, error } = await supabase
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

  // 1. stabilna nazwa pliku (ważne dla URL)
  const fileName = file.originalname
    .toLowerCase()
    .replace(/\s/g, "-");

  // 2. public path EXACT jak w Supabase URL
  const filePath = `${randomUUID()}-${fileName}`;

  console.log("📁 FILE PATH:", filePath);
  // 3. upload do bucketu
  const { error: uploadError } = await supabase.storage
    .from("apartment_images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false, // żeby nadpisywać ten sam plik (opcjonalnie)
    });

    console.log("📁 UPLOAD RESULT:", { uploadError });
  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // 4. GENEROWANIE URL W TAKIM FORMATIE JAK CHCESZ
  const imageUrl =
    `https://hhprezzotbbatuqjihry.supabase.co/storage/v1/object/public/apartment_images/${filePath}`;

  // 5. zapis do bazy
  const { data, error } = await supabase
    .from("apartment_images")
    .insert([
      {
        apartment_id: apartmentId,
        image_url: imageUrl,
        position: 0,
        is_cover: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateApartmentImageById = async (
  id: string,
  data: any
) => {

  const { data: updatedImage, error } =
    await supabase
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
  const { data: image, error: fetchError } = await supabase
    .from("apartment_images")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    throw new Error("Image not found");
  }

  // 2. Usuń plik ze storage
  await removeFileFromStorage(
    "apartments",
    image.url
  );

  // 3. Usuń rekord z DB
  const { error: deleteError } = await supabase
    .from("apartment_images")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return true;
};

