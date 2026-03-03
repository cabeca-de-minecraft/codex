import { apiRequest } from "@/services/api";

export function createChat({ prompt, conversationId }, token) {
  return apiRequest("/chat", {
    method: "POST",
    token,
    body: {
      prompt,
      conversationId
    }
  });
}

export function getChatHistory(token) {
  return apiRequest("/chat/history", {
    token
  });
}

export function getChatById(chatId, token) {
  return apiRequest(`/chat/${chatId}`, {
    token
  });
}

export function deleteChatById(chatId, token) {
  return apiRequest(`/chat/${chatId}`, {
    method: "DELETE",
    token
  });
}
