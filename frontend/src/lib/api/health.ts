import { apiRequest } from "./client";

export type HealthResponse = {
  status: "ok";
  version?: string;
};

export function getHealth() {
  return apiRequest<HealthResponse>("/health");
}
