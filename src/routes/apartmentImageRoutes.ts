import { Router } from 'express';
import { createApartmentImage, 
         getImages, 
         getImagesByApartment,
         uploadApartmentImage
        } from '../controllers/apartmentImageController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getImages);

router.get('/:apartmentId', getImagesByApartment);

router.post('/', createApartmentImage);
router.post('/upload', upload.single("image"),uploadApartmentImage);

export default router;