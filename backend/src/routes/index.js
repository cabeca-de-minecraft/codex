import { authRoutes } from "./auth-routes.js";
import { chatRoutes } from "./chat-routes.js";
import { statsRoutes } from "./stats-routes.js";

export async function registerRoutes(app) {
  app.get("/health", async () => ({ status: "ok" }));
  app.register(authRoutes, { prefix: "/auth" });
  app.register(chatRoutes, { prefix: "/chat" });
  app.register(statsRoutes, { prefix: "/stats" });
}
