import { AppError } from "../config/errors.js";
import { getUserStats } from "../services/stats-service.js";

function getUserIdFromToken(request) {
  const userId = request.user?.sub;
  if (!userId || typeof userId !== "string") {
    throw new AppError("Contexto de autenticação inválido.", 401, "INVALID_AUTH_CONTEXT");
  }

  return userId;
}

export async function getStatsController(request) {
  const userId = getUserIdFromToken(request);
  return getUserStats(userId);
}
