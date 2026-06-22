import { Request, Response } from "express";

import { getDatesBetween } from "../utils/dates";
import { apartmentSchema } from "../validators/apartmentValidator";
import { dateValidator } from "../validators/dateValidator";

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
  fetchAllApartments,
  fetchApartmentPricingById,
  updateApartmentStatus as updateApartmentStatusService,
  upsertApartmentPricingService,
  deleteApartmentPricingService
} from "../services/apartmentService";

import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getApartmentById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const apartment = await fetchApartmentById(id as string);

    if (!apartment) {
      throw new AppError("Resource not found", 404);
    }

    return res.json(apartment);
  }
);

export const searchApartments = asyncHandler(
  async (req: Request, res: Response) => {

const query = dateValidator.parse(req.query);

// business logic outside Zod
if (query.from && query.to) {
  const from = new Date(`${query.from}T00:00:00.000Z`);
  const to = new Date(`${query.to}T00:00:00.000Z`);

  const diffDays =
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) {
    throw new AppError("Minimum stay is 1 night", 400);
  }
}

const apartments =
  await fetchAvailableApartments(query);

return res.json(apartments);}
);

export const getUnavailableDates = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const today = new Date().toISOString().split("T")[0];

    const bookings = await fetchApartmentBookings(req.supabase!,
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

    const result = apartmentSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError("Validation error", 400, result.error);
    }

    const apartment = await insertApartment(req.supabase!, result.data);

    return res.status(201).json(apartment);
  }
);

export const updateApartment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = apartmentSchema.partial().safeParse(req.body);

    if (!result.success) {
      throw new AppError("Validation error", 400, result.error);
    }

    const updated = await updateApartmentById(
      req.supabase!,
      id as string,
      result.data
    );

    return res.json(updated);
  }
);

export const deleteApartment = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const apartment = await deleteApartmentById(req.supabase!, id as string);

    if (!apartment || apartment.length === 0) {
      throw new AppError("Resource not found", 404);
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

    if (!imageId) {
      throw new AppError("imageId is required", 400);
    }

    const apartment = await updateApartmentCoverByImage(req.supabase!,
      id as string,
      imageId
    );

    return res.json(apartment);
  }
);

export const getImagesByApartment = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const images = await fetchImagesByApartmentId(
      id as string
    );

    if (!images || images.length === 0) {
      throw new AppError("No images found", 404);
    }

    return res.json(images);
  }
);

export const getApartments = asyncHandler(
  async (req: Request, res: Response) => {

    const apartments = await fetchAllApartments();

    return res.json(apartments);
  }
);

export const getAvailableApartments = asyncHandler(
  async (req: Request, res: Response) => {
    const { from, to, guests } = req.body;

    const apartments = await fetchApartmentsWithBookings();

    const available = apartments.filter((a: any) => {
      if (guests && a.guests < guests) {
        return false;
      }

      if (!a.bookings?.length) {
        return true;
      }

      const isBlocked = a.bookings.some((b: any) => {
        return (
          new Date(from) < new Date(b.check_out) &&
          new Date(to) > new Date(b.check_in)
        );
      });

      return !isBlocked;
    });

    return res.json(available);
  }
);

// GET /apartments/:id/pricing?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getApartmentPricing = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;
    const { from, to } = req.query;

    const pricing = await fetchApartmentPricingById(
      id as string ,
      from as string | undefined,
      to as string | undefined
    );

    return res.json(pricing);
  }
);

export const updateApartmentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      throw new AppError("status is required", 400);
    }

    const updated = await updateApartmentStatusService(req.supabase!,id as string, status);

    return res.json(updated);
  }
);

export const upsertApartmentPricing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await upsertApartmentPricingService(
    req.supabase!,
    id as string,
    req.body
  );

  res.json(data);
});

export const deleteApartmentPricing = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || typeof from !== "string") {
      throw new AppError("from is required", 400);
    }

    const result = await deleteApartmentPricingService(
      req.supabase!,
      id as string,
      from,
      typeof to === "string" ? to : undefined
    );

    return res.json(result);
  }
);