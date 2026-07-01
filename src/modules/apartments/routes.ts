import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validate } from '../../middleware/validate';

import {
    getApartments,
    searchApartments,
    getApartmentById,
    getUnavailableDates,
    getAvailableApartments,
    createApartment,
    updateApartment,
    updateApartmentCover,
    deleteApartment,
    getImagesByApartment, 
    getApartmentPricing,
    updateApartmentStatus,
    upsertApartmentPricing,
    deleteApartmentPricing

} from './controller';

import {
    apartmentParamsSchema,
    createApartmentSchema,
    updateApartmentSchema,
    apartmentSearchSchema,
    updateApartmentCoverSchema
} from './validator';

const router = Router();

//
// PUBLIC
//
router.get(
    '/',
    //validate(apartmentSearchSchema, 'query'),
    getApartments
);

router.get(
    '/search',
    //validate(apartmentSearchSchema, 'query'),
    searchApartments
);

router.get(
    '/:id',
    validate(apartmentParamsSchema, 'params'),
    getApartmentById
);

router.get(
    '/:id/images',
    validate(apartmentParamsSchema, 'params'),
    getImagesByApartment
);

router.get('/:id/pricing', getApartmentPricing);

router.get(
    '/:id/bookings/unavailable-dates',
    validate(apartmentParamsSchema, 'params'),
    getUnavailableDates
);

router.post(
  '/available',
  getAvailableApartments
)

//
// ADMIN
//
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createApartmentSchema, 'body'),
    createApartment
);

router.patch(
    '/:id',
    authenticate,
    requireAdmin,
    validate(apartmentParamsSchema, 'params'),
    validate(updateApartmentSchema, 'body'),
    updateApartment
);

router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    validate(apartmentParamsSchema, 'params'),
    deleteApartment
);

router.patch(
    '/:id/cover',
    authenticate,
    requireAdmin,
    validate(apartmentParamsSchema, 'params'),
    validate(updateApartmentCoverSchema, 'body'),
    updateApartmentCover
);

router.patch(
    '/:id/pricing',
    authenticate,
    requireAdmin,
    //validate(apartmentParamsSchema, 'params'),
    //validate(updateApartmentCoverSchema, 'body'),
    upsertApartmentPricing 
);

router.delete(
    '/:id/pricing',
    authenticate,
    requireAdmin,
    //validate(apartmentParamsSchema, 'params'),
    //validate(updateApartmentCoverSchema, 'body'),
    deleteApartmentPricing 
);

router.patch(
    '/:id/status',
    authenticate,
    requireAdmin,
    //validate(apartmentParamsSchema, 'params'),
    //validate(updateApartmentCoverSchema, 'body'),
    updateApartmentStatus
);

export default router;