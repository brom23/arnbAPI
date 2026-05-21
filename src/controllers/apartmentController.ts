import { Request, Response } from 'express';
import { getDatesBetween } from '../utils/dates';
import { apartmentSchema } from '../validators/apartmentValidator';
import {
  fetchApartments,
  fetchApartmentById,
  fetchApartmentBookings,
  insertApartment,
  updateApartmentById,
  deleteApartmentById
} from '../services/apartmentService';

export const getApartaments = async (req: Request, res: Response) => {

  console.log("📥 GET /apartments/");

  try {
    const data = await fetchApartments();   

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No apartments found"
      });
    }

    res.json(data);

  } catch (error: any) {

    console.error("❌ GET APARTMENTS ERROR:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getApartmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const apartment = await fetchApartmentById(id as string);

    console.log("📥 GET /apartments/", id);

    if (!apartment) {
      return res.status(404).json({
        message: "Apartment not found",
      });
    }

    return res.json(apartment);

  } catch (error: any) {

    console.error("❌ GET APARTMENTS BY ID ERROR:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const searchApartments = async (
  req: Request,
  res: Response
) => {
  try {
    const { city, from, to, guests } = req.query;

    console.log(
      `📥 GET /apartments/search?city=${city},from=${from},to=${to},guests=${guests}`
    );

    if (!city && !from && !to && !guests) {
      return res.status(400).json({
        message:
          "At least one search parameter is required",
      });
    }

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({
        message:
          "Both 'from' and 'to' must be provided together",
      });
    }

    const data = await fetchApartments();

    const filteredApartments = data.filter((apartment) => {
      let isValid = true;

      // CITY
      if (city) {
        isValid =
          isValid &&
          apartment.city.toLowerCase() ===
          String(city).toLowerCase();
      }

      // GUESTS
      if (guests) {
        isValid =
          isValid &&
          Number(apartment.guests) >=
          Number(guests);
      }

      // DATE (na razie tylko placeholder)
      if (from && to) {
        isValid = isValid && true;
        // tutaj później logika dostępności
      }

      return isValid;
    });

    console.log("filtered apartments:", filteredApartments);

    return res.json(filteredApartments);
  } catch (error: any) {

    console.error("❌ GET SEARCH APARTMENTS ERROR:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUnavailableDates = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    console.log(`📥 GET /apartments/${id}/bookings/unavailable-dates`);

    const today = new Date()
      .toISOString()
      .split("T")[0];

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

      dates.forEach((date) => {
        unavailableDates.add(date);
      });
    });

    return res.status(200).json({
      apartmentId: id,
      unavailableDates: Array.from(
        unavailableDates
      ).sort()
    });

  } catch (error: any) {

    console.error("❌ GET UNAVAILABLE DATES ERROR:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createApartment = async (
  req: Request,
  res: Response
) => {

  console.log("📥 POST /api/v1/apartments");

  console.log("📦 BODY:");
  console.log(JSON.stringify(req.body, null, 2));

  // 🔴 WALIDACJA
  const result = apartmentSchema.safeParse(req.body);

  if (!result.success) {

    return res.status(400).json({
      message: 'Validation error',
      errors: result.error.format()
    });
  }

  try {

    const apartment = await insertApartment(result.data);

    return res.status(201).json(apartment);

  } catch (error: any) {

    console.error("❌ CREATE APARTMENT ERROR:", error.message);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const updateApartment = async (req: Request, res: Response) => {

  const { id } = req.params;

  const apartmentId = Array.isArray(id) ? id[0] : id;

  console.log("✏️ PATCH /apartments:", id);
  console.log("BODY:", req.body);

  // partial validation (PATCH = tylko część pól)
  const result = apartmentSchema.partial().safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation error',
      errors: result.error.issues.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  try {

    const updated = await updateApartmentById(apartmentId, result.data);

    return res.json(updated);

  } catch (error: any) {

    console.error("❌ UPDATE APARTMENT ERROR:", error.message);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const deleteApartment = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  try {

    const apartment = await deleteApartmentById(id as string);

    if(apartment.length === 0) {
      return res.status(404).json({
        message: "Apartment not found"
      });
    }

    return res.json({"message": "Apartment deleted successfully"});

  } catch (error: any) {

    console.error("❌ DELETE APARTMENT ERROR:", error.message);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};