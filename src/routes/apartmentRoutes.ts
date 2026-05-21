import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import {
    getApartaments,
    searchApartments,
    getApartmentById,
    getUnavailableDates,
    createApartment,
    updateApartment,
    deleteApartment    
} from '../controllers/apartmentController';

const router = Router();

router.get('/', getApartaments);
router.get('/search', searchApartments);
router.get('/:id', getApartmentById);

// służy do pobierania zarezerwowanych dat dla danego apartamentu, zeby frontend mogl je zablokowac w kalendarzu
router.get('/:id/bookings/unavailable-dates',  getUnavailableDates);

router.post('/', authenticate, requireAdmin, createApartment);

router.patch('/:id', authenticate, requireAdmin, updateApartment);

router.delete('/:id', authenticate, requireAdmin, deleteApartment);

export default router;