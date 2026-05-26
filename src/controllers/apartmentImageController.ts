import { Request, Response } from "express";

import { apartmentImageSchema } from "../validators/apartmentImageValidator";

import {
  insertApartmentImage,
  fetchApartmentImages,
  storeApartmentImage,
  deleteApartmentImage
} from "../services/apartmentImageService";

import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const createApartmentImage = asyncHandler(
  async (req: Request, res: Response) => {

    console.log("📥 POST /apartment-images BODY:", req.body);

    const result = apartmentImageSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error; // 🔥 KLUCZOWE
    }

    const image = await insertApartmentImage(result.data);

    return res.status(201).json(image);
  }
);

export const getImages = asyncHandler(
  async (req: Request, res: Response) => {

    const images = await fetchApartmentImages();

    if (!images || images.length === 0) {
      throw new AppError("Image not found", 404);
    }

    return res.json(images);
  }
);

export const uploadApartmentImage = asyncHandler(
  async (req: Request, res: Response) => {

    const file = req.file;
    const { apartmentId } = req.body;

    console.log("📥 POST /apartment-images BODY:", req.body);
    console.log("📥 POST /apartment-images FILE:", file);

    if (!file) {
      throw new AppError("File is required", 400);
    }

    if (!apartmentId) {
      throw new AppError("apartmentId is required", 400);
    }

    const result = await storeApartmentImage(
      file as Express.Multer.File,
      apartmentId as string
    );

    return res.status(201).json(result);
  }
);

export const removeApartmentImage = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log(`📥 DELETE /apartment-images/${id}`);

    if (!id) {
      throw new AppError("Image id is required", 400);
    }

    await deleteApartmentImage(id as string);

    return res.status(200).json({
      message: "Image deleted successfully"
    });
  }
);