import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import {
    getBookings,
    getBookingById,
    createBooking,
    getBookingsByApartmentId,
    updateBookingById,
    deleteBookingById,
    updateBookingStatusById
} from '../controllers/bookingController';

const router = Router();

router.get('/', authenticate, requireAdmin, getBookings);
router.get('/:id', authenticate, requireAdmin, getBookingById);
router.get('/apartment/:apartmentId', authenticate, requireAdmin, getBookingsByApartmentId);

//POST /bookings - create a new booking (no auth required for now, can be changed later)
router.post('/', createBooking);

router.patch('/:id', authenticate, requireAdmin, updateBookingById);
router.patch('/:id/status', authenticate, requireAdmin, updateBookingStatusById);
router.delete('/:id', authenticate, requireAdmin, deleteBookingById);

export default router;