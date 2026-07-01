import swaggerUi, { SwaggerOptions } from "swagger-ui-express";
import { openApiDocument } from "./openapi";


const options = {
    swaggerOptions: {
        defaultModelsExpandDepth: -1
    }
    //customCss: '.swagger-ui .models { display: none !important; }'
};

export const swaggerMiddleware = [
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, options)
];
