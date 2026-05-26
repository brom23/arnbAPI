import { Request, Response } from 'express';
import { apartmentImageSchema } from '../validators/apartmentImageValidator';
import { insertApartmentImage, 
         fetchApartmentImages,
         fetchImagesByApartmentId,
         storeApartmentImage,
         deleteApartmentImage
        } from '../services/apartmentImageService';

export const createApartmentImage = async (req: Request, res: Response) => {

    console.log("📥 POST /apartment-images BODY:", req.body);

    const result = apartmentImageSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues.map(e => ({
                field: e.path[0],
                message: e.message
            }))
        });
    }

    try {
        const image = await insertApartmentImage(result.data);
        return res.status(201).json(image);
    } catch (error: any) {
        console.error("❌ CREATE IMAGE ERROR:", error.message);
        return res.status(404).json({ message: "Image not found" });
    }
};

export const getImages = async (req: Request, res: Response) => {

    try {

        const images = await fetchApartmentImages();
        if (!images || images.length === 0) {
            return res.status(404).json({ message: "Image not found" });
        }

        return res.json(images);

    } catch (error: any) {

        console.error("❌ GET IMAGES ERROR:", error.message);
        return res.status(500).json({ message: "Image not found" });
    }
};

// 🔥 GET BY APARTMENT ID
export const getImagesByApartment = async (req: Request, res: Response) => {

    try {

        const { apartmentId } = req.params;

        const images = await fetchImagesByApartmentId(apartmentId as string);

        if (!images || images.length === 0) {
            return res.status(404).json({ message: "No images found" });
        }

        return res.json(images);

    } catch (error: any) {
        console.error("❌ GET IMAGES BY APARTMENT ERROR:", error.message);
        return res.status(500).json({ message: "Internal serwer error" });
    }
};

export const uploadApartmentImage = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;
    const { apartmentId } = req.body;

    console.log("📥 POST /apartment-images BODY:", req.body);
    console.log("📥 POST /apartment-images FILE:", file);
    
    const result = await storeApartmentImage(
      file as Express.Multer.File,
      apartmentId as string
    );

    return res.status(201).json(result);

  } catch (error: any) {
    console.error("❌ UPLOAD ERROR:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeApartmentImage = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    console.log(`📥 DELETE /apartment-images/${id}`);

    await deleteApartmentImage(id as string);

    return res.status(200).json({
      message: "Image deleted successfully"
    });

  } catch (error: any) {

    console.error(
      "❌ DELETE IMAGE ERROR:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error"
    });

  }

};