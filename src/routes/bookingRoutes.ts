import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import {
    getBookings,
    getBookingById,
    createBooking
} from '../controllers/bookingController';

const router = Router();

router.get('/', authenticate, requireAdmin, getBookings);
router.get('/:id', authenticate, requireAdmin, getBookingById);

//POST /bookings - create a new booking (no auth required for now, can be changed later)
router.post('/', createBooking);

export default router;