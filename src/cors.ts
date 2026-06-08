import cors, { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3030",
  "http://localhost:3000",
  "https://arnb-backend.onrender.com",
  "https://swtest.pl"
 // "https://twoja-domena.pl",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow Postman / mobile apps / server-to-server
    if (!origin) return callback(null, true);

    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://10.") ||
      allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: true,
};

export default cors(corsOptions);