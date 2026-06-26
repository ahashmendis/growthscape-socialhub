import { successResponse } from "@/lib/api/response";

const PLATFORMS = [
  { key: "FACEBOOK", label: "Facebook", color: "#1877F2" },
  { key: "INSTAGRAM", label: "Instagram", color: "#E4405F" },
  { key: "YOUTUBE", label: "YouTube", color: "#FF0000" },
  { key: "TIKTOK", label: "TikTok", color: "#000000" },
  { key: "THREADS", label: "Threads", color: "#000000" },
  { key: "LINKEDIN", label: "LinkedIn", color: "#0A66C2" },
  { key: "PINTEREST", label: "Pinterest", color: "#BD081C" },
  { key: "X", label: "X", color: "#000000" },
];

export async function GET() {
  return successResponse(PLATFORMS);
}
