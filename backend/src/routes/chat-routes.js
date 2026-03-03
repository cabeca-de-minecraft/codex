import {
  createChatController,
  deleteChatController,
  getChatController,
  listChatHistoryController
} from "../controllers/chat-controller.js";
import { requireAuth } from "../middleware/auth-middleware.js";

export async function chatRoutes(app) {
  app.post("/", { preHandler: requireAuth }, createChatController);
  app.get("/history", { preHandler: requireAuth }, listChatHistoryController);
  app.get("/:id", { preHandler: requireAuth }, getChatController);
  app.delete("/:id", { preHandler: requireAuth }, deleteChatController);
}

