import { Request, Response } from "express";

import { getDatesBetween } from "../utils/dates";
import { apartmentSchema, apartmentSearchSchema } from "../validators/apartmentValidator";

import {
  fetchApartmentById,
  fetchApartmentBookings,
  insertApartment,
  updateApartmentById,
  updateApartmentCoverByImage,
  deleteApartmentById,
  fetchImagesByApartmentId,
  fetchAvailableApartments,
  fetchApartmentsWithBookings,
  fetchAllApartments
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

    const {
      from,
      to,
      guests,
      city
    } = req.query;

    console.log(
      `📥 GET /apartments/search?from=${from}&to=${to}&guests=${guests}&city=${city}`
    );

    // musi być przynajmniej 1 parametr
    if (
      !from &&
      !to &&
      !guests &&
      !city
    ) {
      throw new AppError(
        "At least one search parameter is required",
        400
      );
    }

    // from + to muszą być razem
    if (
      (from && !to) ||
      (!from && to)
    ) {
      throw new AppError(
        "Both 'from' and 'to' must be provided together",
        400
      );
    }

    const apartments =
      await fetchAvailableApartments({
        from: from as string | undefined,
        to: to as string | undefined,
        city: city as string | undefined,
        guests: guests
          ? Number(guests)
          : undefined
      });

    return res.json(apartments);
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

    console.log("📥 GET /apartments");

    const apartments = await fetchAllApartments();

    return res.json(apartments);
  }
);

export const getAvailableApartments = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to, guests } = req.body

    console.log("📥 POST /apartments/available");
    console.log("📥 BODY:", req.body);

    const apartments = await fetchApartmentsWithBookings()

    if (!apartments) {
      return res.json([])
    }

    const available = apartments.filter((a: any) => {
      // 1. guests filter
      if (guests && a.guests < guests) return false

      // 2. no bookings → available
      if (!a.bookings?.length) return true

      // 3. overlap check (AIRBNB RULE)
      const isBlocked = a.bookings.some((b: any) => {
        return (
          new Date(from) < new Date(b.check_out) &&
          new Date(to) > new Date(b.check_in)
        )
      })

      return !isBlocked
    })

    return res.json(available)
  } catch (error: any) {
    console.error('❌ AVAILABILITY ERROR:', error.message)

    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}