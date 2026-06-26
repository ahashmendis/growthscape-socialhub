import { NextResponse } from "next/server";
import { APP_SHORT_NAME } from "@/lib/utils/constants";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: `${APP_SHORT_NAME} API`,
      version: "1.0.0",
      description: "AI-first Social Media Operating System API",
    },
    servers: [
      { url: "https://api.growthscape.com/v1", description: "Production" },
      { url: "http://localhost:3000/api/v1", description: "Development" },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "Service is healthy" } },
        },
      },
      "/auth/session": {
        get: {
          summary: "Get current session",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Session info" } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
  };

  return NextResponse.json(spec);
}
