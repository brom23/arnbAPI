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
    updateApartmentCover,
    deleteApartment    
} from '../controllers/apartmentController';
import { deleteApartmentById } from '../services/apartmentService';

const router = Router();

router.get('/', getApartaments);
router.get('/search', searchApartments);
router.get('/:id', getApartmentById);

// służy do pobierania zarezerwowanych dat dla danego apartamentu, zeby frontend mogl je zablokowac w kalendarzu
router.get('/:id/bookings/unavailable-dates',  getUnavailableDates);

router.post('/', authenticate, requireAdmin, createApartment);

router.patch('/:id', authenticate, requireAdmin, updateApartment);
router.patch('/:id/cover', authenticate, requireAdmin, updateApartmentCover);

router.delete('/:id', authenticate, requireAdmin, deleteApartment);

export default router;