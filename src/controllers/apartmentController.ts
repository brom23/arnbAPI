import { Request, Response } from "express";

import { getDatesBetween } from "../utils/dates";
import { apartmentSchema } from "../validators/apartmentValidator";

import {
  fetchApartmentById,
  fetchApartmentBookings,
  insertApartment,
  updateApartmentById,
  updateApartmentCoverByImage,
  deleteApartmentById,
  fetchImagesByApartmentId,
  fetchAvailableApartments
} from "../services/apartmentService";

import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getApartmentById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log("📥 GET /apartments/", id);

    const apartment = await fetchApartmentById(id as string);

    if (!apartment) {
      throw new AppError("Apartment not found", 404);
    }

    return res.json(apartment);
  }
);

export const searchApartments = asyncHandler(
  async (req: Request, res: Response) => {

    const { city, from, to, guests } = req.query;

    console.log(
      `📥 GET /apartments/search?city=${city},from=${from},to=${to},guests=${guests}`
    );

    if (!city && !from && !to && !guests) {
      throw new AppError(
        "At least one search parameter is required",
        400
      );
    }

    if ((from && !to) || (!from && to)) {
      throw new AppError(
        "Both 'from' and 'to' must be provided together",
        400
      );
    }

    const data = await fetchAvailableApartments({
      page: 1,
      limit: 1000,
      from: from as string,
      to: to as string,
      city: city as string,
      guests: guests ? Number(guests) : undefined
    });

    return res.json(data);
  }
);

export const getUnavailableDates = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log(`📥 GET /apartments/${id}/bookings/unavailable-dates`);

    const today = new Date().toISOString().split("T")[0];

    const bookings = await fetchApartmentBookings(
      id as string,
      today
    );

    const unavailableDates = new Set<string>();

    bookings.forEach((booking) => {
      const dates = getDatesBetween(
        booking.check_in,
        booking.check_out
      );

      dates.forEach((date) => unavailableDates.add(date));
    });

    return res.json({
      apartmentId: id,
      unavailableDates: Array.from(unavailableDates).sort()
    });
  }
);

export const createApartment = asyncHandler(
  async (req: Request, res: Response) => {

    console.log("📥 POST /apartments");

    const result = apartmentSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const apartment = await insertApartment(result.data);

    return res.status(201).json(apartment);
  }
);

export const updateApartment = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log("✏️ PATCH /apartments:", id);

    const result = apartmentSchema.partial().safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const updated = await updateApartmentById(
      id as string,
      result.data
    );

    return res.json(updated);
  }
);

export const deleteApartment = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const apartment = await deleteApartmentById(id as string);

    if (!apartment || apartment.length === 0) {
      throw new AppError("Apartment not found", 404);
    }

    return res.json({
      message: "Apartment deleted successfully"
    });
  }
);

export const updateApartmentCover = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;
    const { imageId } = req.body;

    console.log(`📥 PATCH /apartments/${id}/cover`);

    if (!imageId) {
      throw new AppError("imageId is required", 400);
    }

    const apartment = await updateApartmentCoverByImage(
      id as string,
      imageId
    );

    return res.json(apartment);
  }
);

export const getImagesByApartment = asyncHandler(
  async (req: Request, res: Response) => {

    const { apartmentId } = req.params;

    const images = await fetchImagesByApartmentId(
      apartmentId as string
    );

    if (!images || images.length === 0) {
      throw new AppError("No images found", 404);
    }

    return res.json(images);
  }
);

export const getApartments = asyncHandler(
  async (req: Request, res: Response) => {

    const page = Math.max(
      parseInt(req.query.page as string) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit as string) || 10,
      100
    );

    const result = await fetchAvailableApartments({
      page,
      limit,
      from: req.query.from as string,
      to: req.query.to as string,
      city: req.query.city as string,
      guests: req.query.guests
        ? parseInt(req.query.guests as string)
        : undefined
    });

    return res.json(result);
  }
);