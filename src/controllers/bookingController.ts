import { Request, Response } from 'express';
import { bookingSchema } from '../validators/bookingValidator';
import {
  fetchBookings,
  fetchBookingById,
  insertBooking,
  checkApartmentAvailability,
  updateBooking,
  deleteBooking
} from "../services/bookingService";

export const getBookings = async (req: Request, res: Response) => {

    console.log("📥 GET /bookings");

    try {

        const bookings = await fetchBookings();


        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        return res.json(bookings);

    } catch (error: any) {

        console.error("❌ GET BOOKINGS ERROR:", error.message);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const getBookingById = async (req: Request, res: Response) => {

    const { id } = req.params;

    try {

        const booking = await fetchBookingById(id as string);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        return res.json(booking);

    } catch (error: any) {

        console.error("❌ GET BOOKING BY ID ERROR:", error.message);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const createBooking = async (req: Request, res: Response) => {

    console.log("📥 POST /bookings BODY:", req.body);

    const result = bookingSchema.safeParse(req.body);

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

        // 🔥 DATE VALIDATION
        if (
            new Date(result.data.check_out) <=
            new Date(result.data.check_in)
        ) {
            return res.status(400).json({
                message: "check_out must be after check_in"
            });
        }

        // 🔥 AVAILABILITY CHECK
        const conflicts = await checkApartmentAvailability(
            result.data.apartment_id,
            result.data.check_in,
            result.data.check_out
        );

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: "Apartment is not available for selected dates"
            });
        }

        const booking = await insertBooking(result.data);

        console.log("✅ BOOKING CREATED:", booking);

        return res.status(201).json(booking);

    } catch (error: any) {

        console.error("❌ CREATE BOOKING ERROR:", error.message);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const updateBookingById = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  console.log(`📥 PATCH /bookings/${id}`);
  console.log("BODY:", req.body);

  const result = bookingSchema.partial().safeParse(req.body);

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

    // 🔥 booking exists
    const existingBooking = await fetchBookingById(id as string);

    if (!existingBooking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // 🔥 date validation
    const checkIn =
      result.data.check_in || existingBooking.check_in;

    const checkOut =
      result.data.check_out || existingBooking.check_out;

    if (
      new Date(checkOut) <=
      new Date(checkIn)
    ) {
      return res.status(400).json({
        message: "check_out must be after check_in"
      });
    }

    // 🔥 availability validation
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

      // pomijamy aktualny booking
      const filteredConflicts = conflicts.filter(
        (booking: any) => booking.id !== id
      );

      if (filteredConflicts.length > 0) {
        return res.status(409).json({
          message:
            "Apartment is not available for selected dates"
        });
      }
    }

    const updatedBooking = await updateBooking(
      id as string,
      result.data
    );

    return res.status(200).json(updatedBooking);

  } catch (error: any) {

    console.error(
      "❌ UPDATE BOOKING ERROR:",
      error.message
    );

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const deleteBookingById = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  console.log(`📥 DELETE /bookings/${id}`);

  try {

    const booking = await fetchBookingById(id as string);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    await deleteBooking(id as string);

    return res.status(200).json({
      message: "Booking deleted successfully"
    });

  } catch (error: any) {

    console.error(
      "❌ DELETE BOOKING ERROR:",
      error.message
    );

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};