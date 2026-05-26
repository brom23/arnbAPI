import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import {
    getApartments,
    searchApartments,
    getApartmentById,
    getUnavailableDates,
    createApartment,
    updateApartment,
    updateApartmentCover,
    deleteApartment,
    getImagesByApartment 
} from '../controllers/apartmentController';

const router = Router();

router.get('/', getApartments);
router.get('/search', searchApartments);
router.get('/:id', getApartmentById);


router.get('/:id/images', getImagesByApartment);
// służy do pobierania zarezerwowanych dat dla danego apartamentu, zeby frontend mogl je zablokowac w kalendarzu
router.get('/:id/bookings/unavailable-dates',  getUnavailableDates);

router.post('/', authenticate, requireAdmin, createApartment);

router.patch('/:id', authenticate, requireAdmin, updateApartment);
router.patch('/:id/cover', authenticate, requireAdmin, updateApartmentCover);

router.delete('/:id', authenticate, requireAdmin, deleteApartment);

export default router;