import { Request, Response } from "express";

import { bookingSchema } from "../validators/bookingValidator";

import {
  fetchBookingById,
  insertBooking,
  checkApartmentAvailability,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  fetchBookingsByApartmentId,
  //fetchBookingsPaginated,
  fetchBlockedBookings,
  fetchBookings
} from "../services/bookingService";

import { getPagination } from "../utils/pagination";

import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

// export const getBookings = asyncHandler(
//   async (req: Request, res: Response) => {

//     console.log("📥 GET /bookings", req.query);

//     const { page, limit } = getPagination(req.query);

//     const result = await fetchBookingsPaginated({
//       page,
//       limit,
//       status: req.query.status as string,
//       apartment_id: req.query.apartment_id as string,
//       email: req.query.email as string,
//       fromDate: req.query.fromDate as string,
//       toDate: req.query.toDate as string
//     });

//     return res.json(result);
//   }
// );

export const getBookings = asyncHandler(
  async (req: Request, res: Response) => {

    console.log(
    "📥 GET /bookings QUERY:",
    Object.fromEntries(Object.entries(req.query))
  );

    const result = await fetchBookings({
      status: req.query.status as string,
      apartment_id: req.query.apartment_id as string,
      email: req.query.email as string,
      fromDate: req.query.fromDate as string,
      toDate: req.query.toDate as string
    });

    return res.json(result);
  }
);

export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const booking = await fetchBookingById(id as string);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    return res.json(booking);
  }
);

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {

    console.log("📥 POST /bookings BODY:", req.body);

    const result = bookingSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    if (
      new Date(result.data.check_out) <=
      new Date(result.data.check_in)
    ) {
      throw new AppError(
        "check_out must be after check_in",
        400
      );
    }

    const conflicts = await checkApartmentAvailability(
      result.data.apartment_id,
      result.data.check_in,
      result.data.check_out
    );

    if (conflicts.length > 0) {
      throw new AppError(
        "Apartment is not available for selected dates",
        409
      );
    }

    const booking = await insertBooking(result.data);

    console.log("✅ BOOKING CREATED:", booking);

    return res.status(201).json(booking);
  }
);

export const updateBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log(`📥 PATCH /bookings/${id}`);
    console.log("BODY:", req.body);

    const result = bookingSchema.partial().safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const existingBooking = await fetchBookingById(id as string);

    if (!existingBooking) {
      throw new AppError("Booking not found", 404);
    }

    const checkIn =
      result.data.check_in || existingBooking.check_in;

    const checkOut =
      result.data.check_out || existingBooking.check_out;

    if (
      new Date(checkOut) <=
      new Date(checkIn)
    ) {
      throw new AppError(
        "check_out must be after check_in",
        400
      );
    }

    if (
      result.data.check_in ||
      result.data.check_out ||
      result.data.apartment_id
    ) {

      const apartmentId =
        result.data.apartment_id ||
        existingBooking.apartment_id;

      const conflicts =
        await checkApartmentAvailability(
          apartmentId,
          checkIn,
          checkOut
        );

      const filteredConflicts = conflicts.filter(
        (booking: any) => booking.id !== id
      );

      if (filteredConflicts.length > 0) {
        throw new AppError(
          "Apartment is not available for selected dates",
          409
        );
      }
    }

    const updatedBooking = await updateBooking(
      id as string,
      result.data
    );

    return res.status(200).json(updatedBooking);
  }
);

export const deleteBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log(`📥 DELETE /bookings/${id}`);

    const booking = await fetchBookingById(id as string);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    await deleteBooking(id as string);

    return res.status(200).json({
      message: "Booking deleted successfully"
    });
  }
);

export const updateBookingStatusById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;
    const { status } = req.body;

    console.log(`📥 PATCH /bookings/${id}/status`);
    console.log("BODY:", req.body);

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed"
    ];

    if (!status) {
      throw new AppError("status is required", 400);
    }

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid status value", 400);
    }

    const booking = await fetchBookingById(id as string);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const updated = await updateBookingStatus(
      id as string,
      status
    );

    return res.status(200).json(updated);
  }
);

export const getBookingsByApartmentId = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    console.log(`📥 GET /bookings/apartment/${id}`);

    const bookings = await fetchBookingsByApartmentId(
      id as string
    );

    if (!bookings || bookings.length === 0) {
      throw new AppError(
        "No bookings found for this apartment",
        404
      );
    }

    return res.json(bookings);
  }
);

export const getBlockedBookings = asyncHandler(
  async (req: Request, res: Response) => {

    const { apartmentId } = req.body;

    if (!apartmentId) {
      return res.status(400).json({
        message: "apartmentId is required"
      });
    }

    const data =
      await fetchBlockedBookings(apartmentId);

    const blocked = (data || []).map((b) => ({
      from: b.check_in,
      to: b.check_out
    }));

    return res.json({ blocked });
  }
);