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
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/tracker-db";

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

      // Handle Post requests
      if (method === "POST") {
        // Validate JSON requests
        if (
          !request.headers.get("content-type")?.includes("application/json")
        ) {
          return ResponseHandler.invalidResponse(ResponseHandler.INVALID_BODY);
        }

        let body;
        try {
          const text = await request.text();
          if (text) {
            body = JSON.parse(text);
          } else {
            return ResponseHandler.invalidResponse(
              ResponseHandler.INVALID_BODY
            );
          }
        } catch (error) {
          return ResponseHandler.invalidResponse(ResponseHandler.INVALID_BODY);
        }

        switch (path) {
          default:
            return ResponseHandler.invalidResponse(
              ResponseHandler.INVALID_ROUTE
            );
        }
      } else if (method === "GET") {
        switch (path) {
          case "servers":
            // Return servers data
            return ResponseHandler.successResponse(
              statusChecker.getServersData()
            );
          default:
            return ResponseHandler.invalidResponse(
              ResponseHandler.INVALID_ROUTE
            );
        }
      }
    }

    return ResponseHandler.invalidResponse(ResponseHandler.INVALID_METHOD);
  },
});

async function init() {
  // Connect to MongoDB
  await MongoDB.connect(MONGODB_URL);

  // Fetch servers data initially
  await statusChecker.fetchServersData();

  // Update every minute the servers
  setInterval(async () => {
    await statusChecker.fetchServersData().catch((err) => {
      console.error("Error fetching servers data", err);
    });
  }, 1000 * 60);
}

init();
console.log(`API Listening on ${server.url}`);
