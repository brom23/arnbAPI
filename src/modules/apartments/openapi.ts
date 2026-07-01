import { registry } from "../../docs/registry";
import { z } from "../../bootstrap/zod";

import {
  apartmentSchema,
  createApartmentSchema,
  updateApartmentSchema,
  apartmentParamsSchema,
  apartmentSearchQuerySchema,
  apartmentPricingQuerySchema,
  apartmentPricingDeleteQuerySchema,
  updateApartmentCoverSchema,
  ApartmentPricingResponseSchema
} from "./validator";

import { commonResponses } from "../../docs/schemas/responses";

/**
 * GET /apartments
 */
registry.registerPath({
  method: "get",
  path: "/apartments",
  tags: ["apartments"],

  responses: {
    200: {
      description: "List of apartments",
      content: {
        "application/json": {
          schema: z.array(apartmentSchema)
        }
      }
    },

    500: commonResponses.internalServerError
  }
});

/**
 * GET /apartments/search
 */
registry.registerPath({
  method: "get",
  path: "/apartments/search",
  tags: ["apartments"],

  request: {
    query: apartmentSearchQuerySchema
  },

  responses: {
    200: {
      description: "Available apartments",
      content: {
        "application/json": {
          schema: z.array(apartmentSchema)
        }
      }
    },

    400: commonResponses.validationError,
    500: commonResponses.internalServerError
  }
});

/**
 * POST /apartments/available
 */
registry.registerPath({
  method: "post",
  path: "/apartments/available",
  tags: ["apartments"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: apartmentSearchQuerySchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Available apartments",
      content: {
        "application/json": {
          schema: z.array(apartmentSchema)
        }
      }
    },

    400: commonResponses.validationError,
    500: commonResponses.internalServerError
  }
});

/**
 * GET /apartments/{id}
 */
registry.registerPath({
  method: "get",
  path: "/apartments/{id}",
  tags: ["apartments"],

  request: {
    params: apartmentParamsSchema
  },

  responses: {
    200: {
      description: "Apartment details",
      content: {
        "application/json": {
          schema: apartmentSchema
        }
      }
    },

    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

/**
 * GET /apartments/{id}/images
 */
registry.registerPath({
  method: "get",
  path: "/apartments/{id}/images",
  tags: ["apartments"],

  request: {
    params: apartmentParamsSchema
  },

  responses: {
    200: {
      description: "Apartment images",
      content: {
        "application/json": {
          schema: z.array(z.any())
        }
      }
    },

    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// GET /apartments/{id}/pricing
//
registry.registerPath({
  method: "get",
  path: "/apartments/{id}/pricing",
  tags: ["apartments"],

  request: {
    params: apartmentParamsSchema,
    query: apartmentPricingQuerySchema
  },

  responses: {
    200: {
      description: "Apartment pricing",
      content: {
        "application/json": {
          schema: ApartmentPricingResponseSchema,
        }
      }
    },

    400: commonResponses.badRequest,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// GET /apartments/{id}/bookings/unavailable-dates
//
registry.registerPath({
  method: "get",
  path: "/apartments/{id}/bookings/unavailable-dates",
  tags: ["apartments"],

  request: {
    params: apartmentParamsSchema
  },

  responses: {
    200: {
      description: "Unavailable dates",
      content: {
        "application/json": {
          schema: z.object({
            apartmentId: z.string(),
            unavailableDates: z.array(z.string())
          })
        }
      }
    },

    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// POST /apartments
//
registry.registerPath({
  method: "post",
  path: "/apartments",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createApartmentSchema
        }
      }
    }
  },

  responses: {
    201: {
      description: "Apartment created",
      content: {
        "application/json": {
          schema: apartmentSchema
        }
      }
    },

    400: commonResponses.validationError,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

//
// PATCH /apartments/{id}
//
registry.registerPath({
  method: "patch",
  path: "/apartments/{id}",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateApartmentSchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Apartment updated",
      content: {
        "application/json": {
          schema: apartmentSchema
        }
      }
    },

    400: commonResponses.validationError,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// DELETE /apartments/{id}
//
registry.registerPath({
  method: "delete",
  path: "/apartments/{id}",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema
  },

  responses: {
    200: {
      description: "Apartment deleted",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string()
          })
        }
      }
    },

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// PATCH /apartments/{id}/cover
//
registry.registerPath({
  method: "patch",
  path: "/apartments/{id}/cover",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateApartmentCoverSchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Cover updated",
      content: {
        "application/json": {
          schema: apartmentSchema
        }
      }
    },

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

//
// PATCH /apartments/{id}/pricing (UPSERT)
//
registry.registerPath({
  method: "patch",
  path: "/apartments/{id}/pricing",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              date: z.string(),
              price: z.number()
            })
          )
        }
      }
    }
  },

  responses: {
    200: {
      description: "Pricing upserted",
      content: {
        "application/json": {
          schema: z.any()
        }
      }
    },

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

//
// DELETE /apartments/{id}/pricing
//
registry.registerPath({
  method: "delete",
  path: "/apartments/{id}/pricing",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema,
    query: apartmentPricingDeleteQuerySchema
  },

  responses: {
    200: {
      description: "Pricing deleted",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string()
          })
        }
      }
    },

    400: commonResponses.badRequest,
    500: commonResponses.internalServerError
  }
});

//
// PATCH /apartments/{id}/status
//
registry.registerPath({
  method: "patch",
  path: "/apartments/{id}/status",
  tags: ["apartments"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.string()
          })
        }
      }
    }
  },

  responses: {
    200: {
      description: "Status updated",
      content: {
        "application/json": {
          schema: apartmentSchema
        }
      }
    },

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});