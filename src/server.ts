import os from "os";
import app, { registeredRoutes } from "./app";
import { errorHandler } from "./middleware/errorHandler";
import { log } from "./utils/logger";

const PORT = process.env.SERVER_PORT || 3030;

app.use(errorHandler);

const server = app.listen(PORT, () => {
  const localIp = getLocalIp();

  log.info("===========================================");
  log.info("🚀 SERVER STARTED SUCCESSFULLY");
  log.info("===========================================");
  log.info(`🌍 LOCAL:   \thttp://localhost:${PORT}`);
  log.info(`🌍 NETWORK: \thttp://${localIp}:${PORT}`);
  log.info(`📚 SWAGGER: \thttp://${localIp}:${PORT}/api-docs`);
  log.info(`⏱ TIME:    \t${new Date().toISOString()}`);
  log.info("===========================================");

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
  log.info("=================================");
  log.info("📡 REGISTERED ENDPOINTS");
  log.info("=================================");

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

      log.info(
        `${methods.padEnd(10)} ${fullPath}`
      );
    });
  });

  log.info("=================================");
}

process.on("SIGTERM", () => {
  log.info("🛑 SIGTERM RECEIVED");

  server.close(() => {
    log.info("💤 Server closed");
    process.exit(0);
  });
});

export default server;