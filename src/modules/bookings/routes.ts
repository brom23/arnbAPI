import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireAdmin } from "../../middleware/requireAdmin";

import {
  getBookings,
  getBookingById,
  createBooking,
  getBookingsByApartmentId,
  updateBookingById,
  deleteBookingById,
  getBlockedBookings,
  getBookingsCalendar,  
  cancelBooking,
  confirmBooking,
} from "./controller";
import { cancelBookingService } from "./service";

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
  "/calendar",
  authenticate,
  requireAdmin,
  getBookingsCalendar
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

router.post(
  "/:id/cancel",
  authenticate,
  requireAdmin,
  cancelBooking
);

router.post(
  "/:id/confirm",
  authenticate,
  requireAdmin,
  confirmBooking
);

export default router;