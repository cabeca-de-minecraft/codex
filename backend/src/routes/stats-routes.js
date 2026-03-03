import { getStatsController } from "../controllers/stats-controller.js";
import { requireAuth } from "../middleware/auth-middleware.js";

export async function statsRoutes(app) {
  app.get("/", { preHandler: requireAuth }, getStatsController);
}

