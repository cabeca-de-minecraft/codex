import { z } from "zod";
import { AppError } from "../config/errors.js";
import {
  createChatMessage,
  deleteUserChatById,
  getUserChatById,
  listUserChatHistory
} from "../services/chat-service.js";

const createChatSchema = z.object({
  prompt: z.string().min(1).max(3000),
  conversationId: z.string().uuid().optional()
});

const chatIdParamsSchema = z.object({
  id: z.string().uuid()
});

function getUserIdFromToken(request) {
  const userId = request.user?.sub;
  if (!userId || typeof userId !== "string") {
    throw new AppError("Contexto de autenticação inválido.", 401, "INVALID_AUTH_CONTEXT");
  }
  return userId;
}

export async function createChatController(request, reply) {
  const { prompt, conversationId } = createChatSchema.parse(request.body);
  const userId = getUserIdFromToken(request);

  const chat = await createChatMessage({
    userId,
    prompt,
    conversationId
  });

  return reply.status(201).send({ chat });
}

export async function listChatHistoryController(request) {
  const userId = getUserIdFromToken(request);
  const chats = await listUserChatHistory(userId);

  return { chats };
}

export async function getChatController(request) {
  const userId = getUserIdFromToken(request);
  const { id } = chatIdParamsSchema.parse(request.params);
  const chat = await getUserChatById({ userId, chatId: id });

  return { chat };
}

export async function deleteChatController(request, reply) {
  const userId = getUserIdFromToken(request);
  const { id } = chatIdParamsSchema.parse(request.params);
  await deleteUserChatById({ userId, chatId: id });

  return reply.status(204).send();
}
