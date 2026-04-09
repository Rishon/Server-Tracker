import { serve } from "bun";

// Services
import MongoDB from "./services/MongoDB";

// Constants
import ResponseHandler from "./handler/ResponseHandler";
import StatusChecker from "./services/StatusChecker";

// Dotenv
import dotenv from "dotenv";
dotenv.config();

// Environment Variables
const PORT = process.env.BACKEND_PORT || 3005;
const MONGODB_URL = process.env.MONGODB_URL;

// StatusChecker
const statusChecker = new StatusChecker();

const server = serve({
  hostname: "0.0.0.0",
  port: PORT,
  async fetch(request) {
    request.headers.set("Access-Control-Allow-Origin", "*");
    request.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    request.headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      const res = new Response(null, ResponseHandler.CORS_HEADERS);
      return res;
    }

    const { method } = request;
    const { pathname } = new URL(request.url);
    const version = "v1";

    if (pathname === "/")
      return ResponseHandler.invalidResponse(ResponseHandler.INVALID_ROUTE);

    // Handle v1
    if (pathname.startsWith(`/${version}`)) {
      const path = pathname.slice(version.length + 1).replace("/", "");

      // Handle GET requests
      if (method === "GET") {
        if (path.startsWith("servers/") && path.length > "servers/".length) {
          const serverName = decodeURIComponent(path.split("/")[1]);
          const allServers = statusChecker.getServersData();

          let foundServer = null;
          for (const [platform, servers] of Object.entries(allServers)) {
            foundServer = (servers as any[]).find(
              (s: any) => s.name.toLowerCase() === serverName.toLowerCase(),
            );
            if (foundServer) break;
          }

          if (foundServer) {
            return ResponseHandler.successResponse(foundServer);
          } else {
            return ResponseHandler.invalidResponse(
              ResponseHandler.SERVER_NOT_FOUND,
            );
          }
        }

        switch (path) {
          case "servers":
            // Return servers data
            return ResponseHandler.successResponse(
              statusChecker.getServersData(),
            );
          default:
            return ResponseHandler.invalidResponse(
              ResponseHandler.INVALID_ROUTE,
            );
        }
      }
    }

    return ResponseHandler.invalidResponse(ResponseHandler.INVALID_METHOD);
  },
});

async function init() {
  // Connect to MongoDB
  await MongoDB.connect(MONGODB_URL || "").catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

  // Fetch servers data initially
  await statusChecker.refreshAllServers();

  // Update every minute the servers
  setInterval(async () => {
    await statusChecker.refreshAllServers().catch((err) => {
      console.error("Error fetching servers data", err);
    });
  }, 1000 * 60);
}

init();
console.log(`API Listening on ${server.url}`);
