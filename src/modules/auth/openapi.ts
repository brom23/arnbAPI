import { registry } from "../../docs/registry";

import {
  loginSchema,
  meResponseSchema,
  refreshResponseSchema,
  logoutResponseSchema
} from "./validator";

import { commonResponses } from "../../docs/schemas/responses";

registry.registerPath({
  method: "post",
  path: "/auth/admin/login",
  tags: ["auth"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema
        }
      }
    }
  },

  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: meResponseSchema
        }
      }
    },

    400: commonResponses.badRequest,
    401: commonResponses.unauthorized,
    500: commonResponses.internalServerError
  }
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["auth"],

  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Logged out",
      content: {
        "application/json": {
          schema: logoutResponseSchema
        }
      }
    },

    401: commonResponses.unauthorized,
    500: commonResponses.internalServerError
  }
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["auth"],

  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Current user",
      content: {
        "application/json": {
          schema: meResponseSchema
        }
      }
    },

    401: commonResponses.unauthorized,
    500: commonResponses.internalServerError
  }
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["auth"],

  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Token refreshed",
      content: {
        "application/json": {
          schema: refreshResponseSchema
        }
      }
    },

    401: commonResponses.unauthorized,
    500: commonResponses.internalServerError
  }
});

export default registry;