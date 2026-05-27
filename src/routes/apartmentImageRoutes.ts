import { Router } from 'express';

import {
  createApartmentImage,
  getImages,
  uploadApartmentImage,
  updateApartmentImage,
  removeApartmentImage
} from '../controllers/apartmentImageController';

import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { upload } from '../middleware/upload';
import { validate } from "../middleware/validate";

import {
  createApartmentImageSchema,
  updateApartmentImageSchema,
  uploadApartmentImageSchema
} from "../validators/apartmentImageValidator";

const router = Router();

router.get('/', getImages);

router.post('/', authenticate, requireAdmin, validate(createApartmentImageSchema), createApartmentImage);

router.post('/upload', authenticate, requireAdmin, upload.single("image"), validate(uploadApartmentImageSchema), uploadApartmentImage);

router.patch('/:id', authenticate, requireAdmin, validate(updateApartmentImageSchema), updateApartmentImage);

router.delete('/:id', authenticate, requireAdmin, removeApartmentImage);

export default router;