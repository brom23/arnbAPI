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
  fetchAllApartments,
  fetchApartmentPricingById
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

    if (from === to) {
      throw new AppError(
        "Minimum stay is 1 night",
        400
      )
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

    //   console.log(
    //   '📥 RESPONSE:',
    //   JSON.stringify(apartments[0], null, 2)
    // );

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

// GET /apartments/:id/pricing?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getApartmentPricing = asyncHandler(
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    console.log(`📥 GET /apartments/${id}/pricing`, req.query);

    // 1. brak query → zwracamy wszystkie ceny
    if (!from && !to) {
      const pricing = await fetchApartmentPricingById(id as string);
      if (!pricing || !pricing.prices || Object.keys(pricing.prices).length === 0) {
        return res.status(404).json({
          message: "No pricing found for this apartment",
        });
      }
      return res.json({ prices: pricing });
    }

    // 2. tylko jeden parametr → informacyjny błąd
    if (!from) {
      return res.status(400).json({
        message: "Query parameter 'from' is missing. Both 'from' and 'to' must be provided together.",
      });
    }

    if (!to) {
      return res.status(400).json({
        message: "Query parameter 'to' is missing. Both 'from' and 'to' must be provided together.",
      });
    }

    // 3. walidacja formatu YYYY-MM-DD
    const isValidDate = (d: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(d);

    if (!isValidDate(from as string) || !isValidDate(to as string)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // 4. logika biznesowa: from < to i różne
    if (from === to) {
      throw new AppError("'from' and 'to' cannot be the same", 400);
    }
    if (new Date(from as string) > new Date(to as string)) {
      throw new AppError("'from' must be earlier than 'to'", 400);
    }

    // 5. pobranie danych z service
    const pricing = await fetchApartmentPricingById(
      id as string,
      from as string,
      to as string
    );

    if (!pricing || !pricing.prices || Object.keys(pricing.prices).length === 0) {
      return res.status(404).json({
        message: "No pricing found for this apartment in the given date range",
      });
    }

    return res.json({ prices: pricing });
  } catch (err: any) {
    console.error("❌ PRICING ERROR:", err.message);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});