import express from "express";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

import apartmentRoutes from "./routes/apartmentRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import apartmentImageRoutes from "./routes/apartmentImageRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

//
// MIDDLEWARES
//
app.use(express.json());
//remove cashe-control replaced response code 304 -> 200
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

//
// SWAGGER
//
const swaggerPath = path.join(process.cwd(), "dist/openapi.json");

if (!fs.existsSync(swaggerPath)) {
  throw new Error(
    `Swagger file not found. Run: npm run docs:build -> ${swaggerPath}`
  );
}

const swaggerDocument = JSON.parse(
  fs.readFileSync(swaggerPath, "utf8")
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

//
// ROUTE REGISTRY
//
type RegisteredRoute = {
  path: string;
  router: Router;
};

export const registeredRoutes = [
    {
        path: '/api/v1/auth',
        router: authRoutes
    },
    {
        path: '/api/v1/apartments',
        router: apartmentRoutes
    },
    {
        path: '/api/v1/bookings',
        router: bookingRoutes
    },
    {
        path: '/api/v1/apartment-images',
        router: apartmentImageRoutes
    }    
];


//
// REGISTER ROUTES
//
registeredRoutes.forEach((route) => {
  app.use(route.path, route.router);
});

//
// HEALTHCHECK
//
app.get("/", (_, res) => {
  res.json({
    status: "ok",
    message: "API is running",
  });
});

export default app;