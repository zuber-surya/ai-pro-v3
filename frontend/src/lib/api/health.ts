import { apiRequest } from "./client";
import type { HealthResponse } from "@/types/api";

/** Sample resource module — pattern for all OpenAPI resources */
export function getHealth() {
  return apiRequest<HealthResponse>("/health");
}
