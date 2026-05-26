import os from "os";
import app, { registeredRoutes } from "./app";
import { errorHandler } from "./middleware/errorHandler";

const PORT = process.env.SERVER_PORT || 3030;

app.use(errorHandler);

const server = app.listen(PORT, () => {
  const localIp = getLocalIp();

  console.log("===========================================");
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log("===========================================");
  console.log(`🌍 LOCAL:   \thttp://localhost:${PORT}`);
  console.log(`🌍 NETWORK: \thttp://${localIp}:${PORT}`);
  console.log(`📚 SWAGGER: \thttp://${localIp}:${PORT}/api-docs`);
  console.log(`⏱ TIME:    \t${new Date().toISOString()}`);
  console.log("===========================================");

  printEndpoints();
});

//
// HELPERS
//

function getLocalIp(): string {
  const networkInterfaces = os.networkInterfaces();

  for (const iface of Object.values(networkInterfaces)) {
    if (!iface) continue;

    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }

  return "localhost";
}

function printEndpoints() {
  console.log("=================================");
  console.log("📡 REGISTERED ENDPOINTS");
  console.log("=================================");

  registeredRoutes.forEach((routeGroup) => {
    const stack = (routeGroup.router as any).stack;

    if (!stack) return;

    stack.forEach((layer: any) => {
      const route = layer.route;

      if (!route) return;

      const methods = Object.keys(route.methods)
        .map((method) => method.toUpperCase())
        .join(",");

      const fullPath =
        `${routeGroup.path}${route.path}`
          .replace(/\/+/g, "/")
          .replace(/\/$/, "") || "/";

      console.log(
        `${methods.padEnd(10)} ${fullPath}`
      );
    });
  });

  console.log("=================================");
}

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM RECEIVED");

  server.close(() => {
    console.log("💤 Server closed");
    process.exit(0);
  });
});

export default server;