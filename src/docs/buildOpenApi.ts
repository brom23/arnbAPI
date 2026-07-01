import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { registry } from "./registry";

//import "../modules/apartments/registry";
import "../modules/apartments/openapi";

//import "../modules/apartment-images/registry";
import "../modules/apartment-images/openapi";

//import "../modules/bookings/registry";
import "../modules/bookings/openapi";

import "../modules/auth/openapi";

export const buildOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(
    registry.definitions
  );

return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "API",
      version: "1.0.0"
    },

    servers: [
      {
        url: "http://localhost:3030/api/v1"
      },
      {
        url: "https://arnb-backend.onrender.com/api/v1"
      }
    ],

    tags: [
      {
        name: "auth",
        description: "Authentication"
      },
      {
        name: "apartments",
        description: "Apartment management"
      },
      {
        name: "bookings",
        description: "Booking system"
      },
      {
        name: "apartment-images",
        description: "Images for apartments"
      }
    ],

    security: [
      {
        cookieAuth: []
      }
    ]
  });
};