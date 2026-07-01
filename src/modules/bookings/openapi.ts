import { registry } from "../../docs/registry";
import { z } from "../../bootstrap/zod";

import {
  bookingSchema,
  updateBookingSchema,
  bookingQuerySchema
} from "./validator";

import { dateRangeValidator } from "../../validators/dateRangeValidator";
import { commonResponses } from "../../docs/schemas/responses";

/**
 * GET /bookings
 */
registry.registerPath({
  method: "get",
  path: "/bookings",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    query: bookingQuerySchema
  },

  responses: {
    200: {
      description: "List of bookings",
      content: {
        "application/json": {
          schema: z.array(bookingSchema)
        }
      }
    },

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

/**
 * POST /bookings
 */
registry.registerPath({
  method: "post",
  path: "/bookings",
  tags: ["bookings"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: bookingSchema
        }
      }
    }
  },

  responses: {
    201: {
      description: "Booking created",
      content: {
        "application/json": {
          schema: bookingSchema
        }
      }
    },

    400: commonResponses.validationError,

    409: {
      description: "Apartment is not available for selected dates"
    },

    500: commonResponses.internalServerError
  }
});

/**
 * POST /bookings/blocked
 */
registry.registerPath({
  method: "post",
  path: "/bookings/blocked",
  tags: ["bookings"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            apartmentId: z.string().uuid()
          })
        }
      }
    }
  },

  responses: {
    200: {
      description: "Blocked booking ranges"
    },

    400: commonResponses.badRequest,
    500: commonResponses.internalServerError
  }
});

/**
 * GET /bookings/calendar
 */
registry.registerPath({
  method: "get",
  path: "/bookings/calendar",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    query: dateRangeValidator
  },

  responses: {
    200: {
      description: "Bookings calendar"
    },

    400: commonResponses.validationError,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

/**
 * GET /bookings/apartment/{id}
 */
registry.registerPath({
  method: "get",
  path: "/bookings/apartment/{id}",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },

  responses: {
    200: {
      description: "Bookings by apartment",
      content: {
        "application/json": {
          schema: z.array(bookingSchema)
        }
      }
    },

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

/**
 * GET /bookings/{id}
 */
registry.registerPath({
  method: "get",
  path: "/bookings/{id}",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },

  responses: {
    200: {
      description: "Booking details",
      content: {
        "application/json": {
          schema: bookingSchema
        }
      }
    },

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

/**
 * PATCH /bookings/{id}
 */
registry.registerPath({
  method: "patch",
  path: "/bookings/{id}",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    }),

    body: {
      content: {
        "application/json": {
          schema: updateBookingSchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Booking updated",
      content: {
        "application/json": {
          schema: bookingSchema
        }
      }
    },

    400: commonResponses.validationError,

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,

    409: {
      description: "Apartment is not available for selected dates"
    },

    500: commonResponses.internalServerError
  }
});

/**
 * DELETE /bookings/{id}
 */
registry.registerPath({
  method: "delete",
  path: "/bookings/{id}",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },

  responses: {
    200: commonResponses.success,

    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

/**
 * POST /bookings/{id}/cancel
 */
registry.registerPath({
  method: "post",
  path: "/bookings/{id}/cancel",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },

  responses: {
    200: {
      description: "Booking cancelled",
      content: {
        "application/json": {
          schema: bookingSchema
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

/**
 * POST /bookings/{id}/confirm
 */
registry.registerPath({
  method: "post",
  path: "/bookings/{id}/confirm",
  tags: ["bookings"],

  security: [{ cookieAuth: [] }],

  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },

  responses: {
    200: {
      description: "Booking confirmed",
      content: {
        "application/json": {
          schema: bookingSchema
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

export default registry;