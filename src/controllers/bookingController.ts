import { Request, Response } from "express";
import { bookingSchema, updateBookingSchema } from "../validators/bookingValidator";

import {
  fetchBookingById,
  insertBooking,
  checkApartmentAvailability,
  updateBooking,
  deleteBooking,
  fetchBookingsByApartmentId,
  //fetchBookingsPaginated,
  fetchBlockedBookings,
  fetchBookings,
  getBookingsCalendarService,
  confirmBookingService,
  cancelBookingService,
} from "../services/bookingService";

import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";


export const getBookings = asyncHandler(
  async (req: Request, res: Response) => {

    const params = {
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    apartment_id: typeof req.query.apartment_id === "string" ? req.query.apartment_id : undefined,
    email: typeof req.query.email === "string" ? req.query.email : undefined,
    fromDate: typeof req.query.fromDate === "string" ? req.query.fromDate : undefined,
    toDate: typeof req.query.toDate === "string" ? req.query.toDate : undefined,
  };

    const result = await fetchBookings(req.supabase!, params);

    return res.json(result);
  }
);

export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const booking = await fetchBookingById(req.supabase!,id as string);

    if (!booking) {
      throw new AppError("Resource not found", 404);
    }

    return res.json(booking);
  }
);

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const result = bookingSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const bookingData = result.data;

    const conflicts = await checkApartmentAvailability(
      bookingData.apartment_id,
      bookingData.check_in,
      bookingData.check_out
    );

    if (conflicts.length > 0) {
      throw new AppError(
        "Apartment is not available for selected dates",
        409
      );
    }

    const booking = await insertBooking(bookingData);

    return res.status(201).json(booking);
  }
);

export const updateBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = bookingSchema.partial().safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const existingBooking = await fetchBookingById(req.supabase!,id as string);

    if (!existingBooking) {
      throw new AppError("Resource not found", 404);
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

    const updatedBooking = await updateBooking(req.supabase!,
      id as string,
      result.data
    );

    return res.status(200).json(updatedBooking);
  }
);

export const deleteBookingById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const booking = await fetchBookingById(req.supabase!, id as string);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    await deleteBooking(req.supabase!,id as string);

    return res.status(200).json({
      message: "Booking deleted successfully"
    });
  }
);

export const getBookingsByApartmentId = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    const bookings = await fetchBookingsByApartmentId(req.supabase!,
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

import { dateRangeValidator } from "../validators/dateRangeValidator";

export const getBookingsCalendar = asyncHandler(
  async (req: Request, res: Response) => {

    const query = dateRangeValidator.parse(req.query);

    const bookings = await getBookingsCalendarService(
      req.supabase!,
      query.from,
      query.to
    );

    return res.json(bookings);
  }
);

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) throw new AppError("Booking id is required", 400);

  const result = await cancelBookingService(req.supabase!, id as string);

  return res.status(200).json(result);
});

export const confirmBooking = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) throw new AppError("Booking id is required", 400);

  const result = await confirmBookingService(req.supabase!, id as string);

  return res.status(200).json(result);
});