import { registry } from "../../docs/registry";

import {
  apartmentSchema,
  createApartmentSchema,
  updateApartmentSchema,
  apartmentParamsSchema,
  apartmentSearchSchema,
  updateApartmentCoverSchema
} from "./validator";

registry.register("Apartment", apartmentSchema);
registry.register("CreateApartment", createApartmentSchema);
registry.register("UpdateApartment", updateApartmentSchema);
registry.register("ApartmentParams", apartmentParamsSchema);
registry.register("ApartmentSearch", apartmentSearchSchema);
registry.register("UpdateApartmentCover", updateApartmentCoverSchema);

export default registry;