import { apiRequest } from "@/services/api";

export function getStats(token) {
  return apiRequest("/stats", {
    token
  });
}

