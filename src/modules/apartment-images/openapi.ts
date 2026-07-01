import { registry } from "../../docs/registry";
import { z } from "../../bootstrap/zod";

import {
  apartmentImageSchema,
  createApartmentImageSchema,
  updateApartmentImageSchema,
  uploadApartmentImageSchema,
  apartmentImageParamsSchema
} from "./validator";

import { commonResponses } from "../../docs/schemas/responses";

/**
 * GET /apartment-images
 */
registry.registerPath({
  method: "get",
  path: "/apartment-images",
  tags: ["apartment-images"],

  responses: {
    200: {
      description: "List of apartment images",
      content: {
        "application/json": {
          schema: z.array(apartmentImageSchema)
        }
      }
    },

    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

/**
 * POST /apartment-images
 */
registry.registerPath({
  method: "post",
  path: "/apartment-images",
  tags: ["apartment-images"],

  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createApartmentImageSchema
        }
      }
    }
  },

  responses: {
    201: {
      description: "Apartment image created",
      content: {
        "application/json": {
          schema: apartmentImageSchema
        }
      }
    },

    400: commonResponses.validationError,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

/**
 * POST /apartment-images/upload
 */
registry.registerPath({
  method: "post",
  path: "/apartment-images/upload",
  tags: ["apartment-images"],

  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: uploadApartmentImageSchema
        }
      }
    }
  },

  responses: {
    201: {
      description: "Image uploaded successfully",
      content: {
        "application/json": {
          schema: apartmentImageSchema
        }
      }
    },

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    500: commonResponses.internalServerError
  }
});

/**
 * PATCH /apartment-images/{id}
 */
registry.registerPath({
  method: "patch",
  path: "/apartment-images/{id}",
  tags: ["apartment-images"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentImageParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateApartmentImageSchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Apartment image updated",
      content: {
        "application/json": {
          schema: apartmentImageSchema
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
 * DELETE /apartment-images/{id}
 */
registry.registerPath({
  method: "delete",
  path: "/apartment-images/{id}",
  tags: ["apartment-images"],

  security: [{ cookieAuth: [] }],

  request: {
    params: apartmentImageParamsSchema
  },

  responses: {
    200: commonResponses.success,

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    403: commonResponses.forbidden,
    404: commonResponses.notFound,
    500: commonResponses.internalServerError
  }
});

export default registry;