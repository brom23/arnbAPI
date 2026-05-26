import { Router } from 'express';
import { createApartmentImage, 
         getImages, 
         getImagesByApartment,
         uploadApartmentImage,
         removeApartmentImage
        } from '../controllers/apartmentImageController';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getImages);

router.get('/:apartmentId', getImagesByApartment);

router.post('/', createApartmentImage);
router.post('/upload', upload.single("image"),uploadApartmentImage);

router.delete('/:id', authenticate, requireAdmin, removeApartmentImage);

export default router;