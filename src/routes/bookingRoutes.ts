import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

import {
  getBookings,
  getBookingById,
  createBooking,
  getBookingsByApartmentId,
  updateBookingById,
  deleteBookingById,
  updateBookingStatusById,
  getBlockedBookings,
  getBookingsCalendar
} from "../controllers/bookingController";

const router = Router();

//
// PUBLIC 
//
router.post("/", createBooking);

router.post(
  "/blocked",
  getBlockedBookings
);

//
// ADMIN ROUTES
//
router.get("/", authenticate, requireAdmin, getBookings);

// IMPORTANT: specific route BEFORE /:id
router.get(
  "/apartment/:id",
  authenticate,
  requireAdmin,
  getBookingsByApartmentId
);

router.get(
  "/:id",
  authenticate,
  requireAdmin,
  getBookingById
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  updateBookingById
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteBookingById
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateBookingStatusById
);

router.get(
  "/calendar",
  authenticate,
  getBookingsCalendar
);

export default router;