import { successResponse } from "@/lib/api/response";
import { APP_SHORT_NAME } from "@/lib/utils/constants";

export async function GET() {
  return successResponse({
    status: "healthy",
    service: APP_SHORT_NAME,
    timestamp: new Date().toISOString(),
  });
}
