import { supabaseAdmin } from "../lib/supabase";

export const removeFileFromStorage = async (
  bucket: string,
  fileUrl: string
) => {

  const path = fileUrl
    .split("/storage/v1/object/public/")[1];

  if (!path) {
    throw new Error("Invalid storage path");
  }

  const cleanPath = path.replace(`${bucket}/`, "");

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};