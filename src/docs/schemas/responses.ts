import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  ValidationErrorSchema
} from "./common";

export const commonResponses = {
  badRequest: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
        example: {
            message: "id is required"
        }
      }
    }
  },

  validationError: {
    description: "Validation Error",
    content: {
      "application/json": {
        schema: ValidationErrorSchema
      }
    }
  },

  unauthorized: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
        example: {
            message: "Unauthorized"
        }
      }
    }
  },

  forbidden: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
        example: {
            message: "Forbidden (admin only)"
        }
      }
    }
  },

  notFound: {
    description: "Not Found",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
        example: {
            message: "Resource not found."
        }
      }
    }
  },

  internalServerError: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
        example: {
            message: "Internal Server Error"
        }
      }
    }
  },

  success: {
    description: "Success",
    content: {
      "application/json": {
        schema: SuccessResponseSchema
      }
    }
  }
};