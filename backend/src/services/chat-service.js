import { randomUUID } from "node:crypto";
import { AppError } from "../config/errors.js";
import { prisma } from "../prisma/client.js";

const STOPWORDS = new Set([
  "a",
  "agora",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "eu",
  "isso",
  "me",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "para",
  "por",
  "que",
  "se",
  "sem",
  "um",
  "uma",
  "voce",
  "você"
]);

const TOPIC_RULES = [
  {
    key: "programação",
    match: ["código", "api", "backend", "frontend", "bug", "erro", "node", "react", "prisma"],
    diagnosis: "Há sinais de um problema técnico que precisa de isolamento de causa.",
    actionPlan: [
      "Reproduza o cenário com o menor caso possível e capture o erro completo.",
      "Valide entradas, dependências e estado atual antes de aplicar correções.",
      "Implemente a correção em camadas e teste fluxo feliz + fluxo de erro."
    ]
  },
  {
    key: "produtividade",
    match: ["organização", "rotina", "foco", "tempo", "prioridade", "planejamento"],
    diagnosis: "O principal gargalo parece ser execução sem priorização explícita.",
    actionPlan: [
      "Defina um objetivo único para as próximas 2 horas.",
      "Quebre em tarefas de 20 a 40 minutos com critério de conclusão claro.",
      "Revise o que foi concluído e ajuste o próximo bloco."
    ]
  },
  {
    key: "estudo",
    match: ["estudo", "estudos", "estudar", "aprender", "prova", "matéria", "conteúdo", "exercício"],
    diagnosis: "Você precisa de retenção e prática dirigida, não só leitura passiva.",
    actionPlan: [
      "Resuma o conteúdo em tópicos curtos com suas próprias palavras.",
      "Resolva exercícios progressivos e marque os pontos de erro.",
      "Revise em ciclos curtos (24h, 72h e 7 dias)."
    ]
  },
  {
    key: "negócio",
    match: ["cliente", "venda", "produto", "negócio", "mercado", "receita", "custo"],
    diagnosis: "A decisão precisa equilibrar valor para cliente e viabilidade operacional.",
    actionPlan: [
      "Mapeie hipótese de valor e público principal.",
      "Teste uma versão pequena para medir conversão e custo real.",
      "Ajuste oferta e processo com base em métricas objetivas."
    ]
  }
];

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function shortenText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function estimateTokens(prompt, response) {
  const combined = `${prompt} ${response}`.trim();
  const words = combined.split(/\s+/).filter(Boolean).length;
  const uniqueWords = new Set(combined.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)).size;
  const chars = combined.length;
  const punctuation = (combined.match(/[.,!?;:]/g) ?? []).length;
  const lexicalFingerprint =
    Array.from(combined).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 11;

  return Math.max(
    Math.round(chars / 4 + words * 0.2 + uniqueWords * 0.65 + punctuation * 0.2 + lexicalFingerprint),
    10
  );
}

function extractKeywords(prompt, maxKeywords = 4) {
  const frequencies = new Map();
  const words = prompt.toLowerCase().match(/\p{L}[\p{L}\p{N}]*/gu) ?? [];
  words.forEach((word) => {
    const normalizedWord = normalizeForMatch(word);
    if (normalizedWord.length < 4 || STOPWORDS.has(normalizedWord)) {
      return;
    }

    const current = frequencies.get(normalizedWord) ?? { label: word, count: 0 };
    frequencies.set(normalizedWord, {
      label: current.label,
      count: current.count + 1
    });
  });

  return Array.from(frequencies.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxKeywords)
    .map((item) => item.label);
}

function inferTopic(prompt) {
  const normalized = normalizeForMatch(prompt);
  let bestTopic = null;
  let bestScore = 0;

  for (const topic of TOPIC_RULES) {
    let score = topic.match.reduce((sum, token) => {
      return sum + (normalized.includes(normalizeForMatch(token)) ? 1 : 0);
    }, 0);

    if (topic.key === "estudo" && /estud|aprend|prova|exercic/.test(normalized)) {
      score += 2;
    }

    if (topic.key === "produtividade" && /foco|prioridade|rotina|tempo/.test(normalized)) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore > 0) {
    return bestTopic;
  }

  return {
    key: "geral",
    diagnosis: "Seu pedido pede clareza de objetivo e execução incremental.",
    actionPlan: [
      "Defina resultado esperado, restrições e prazo.",
      "Quebre em etapas pequenas com entregável por etapa.",
      "Valide cada etapa antes de seguir para a próxima."
    ]
  };
}

function inferResponseStyle(prompt) {
  const normalized = normalizeForMatch(prompt);

  if (normalized.includes("resumo") || normalized.includes("resuma")) {
    return "resumo";
  }
  if (normalized.endsWith("?") || normalized.includes("como ")) {
    return "pergunta";
  }
  return "plano";
}

function buildSimulatedResponse({ prompt, recentMessages }) {
  const cleanPrompt = prompt.trim();
  const topic = inferTopic(cleanPrompt);
  const style = inferResponseStyle(cleanPrompt);
  const keywords = extractKeywords(cleanPrompt);
  const previousPrompt = recentMessages[0]?.prompt;

  if (normalizeForMatch(cleanPrompt).startsWith("oi") || normalizeForMatch(cleanPrompt).startsWith("ola")) {
    return "Olá! Posso te ajudar com um plano objetivo, análise técnica ou revisão de decisões. Me diga o contexto e o resultado que você quer alcançar.";
  }

  const contextLine = previousPrompt
    ? `Contexto recente: você estava tratando "${shortenText(previousPrompt, 72)}".`
    : "Contexto recente: esta parece ser uma nova conversa.";

  const focusLine =
    keywords.length > 0
      ? `Foco identificado: ${keywords.join(", ")}.`
      : "Foco identificado: objetivo geral de melhoria e execução.";

  if (style === "resumo") {
    return [
      "Resumo estruturado:",
      `- Diagnóstico: ${topic.diagnosis}`,
      `- Síntese do pedido: ${shortenText(cleanPrompt, 130)}.`,
      `- Próxima ação: ${topic.actionPlan[0]}`,
      contextLine
    ].join("\n");
  }

  if (style === "pergunta") {
    return [
      "Resposta direta:",
      `${topic.diagnosis}`,
      focusLine,
      "Plano recomendado:",
      `1) ${topic.actionPlan[0]}`,
      `2) ${topic.actionPlan[1]}`,
      `3) ${topic.actionPlan[2]}`,
      "Se quiser, eu transformo isso em checklist executável para hoje."
    ].join("\n");
  }

  return [
    "Plano orientado ao tema da sua mensagem:",
    `- Diagnóstico: ${topic.diagnosis}`,
    `- Direção: ${shortenText(cleanPrompt, 125)}.`,
    `- Passo imediato: ${topic.actionPlan[0]}`,
    `- Passo seguinte: ${topic.actionPlan[1]}`,
    `- Fechamento: ${topic.actionPlan[2]}`,
    contextLine
  ].join("\n");
}

function getConversationKey(chat) {
  return chat.conversationId ?? chat.id;
}

function buildHistorySummaryFromMessages(messages) {
  const sortedMessages = messages.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const newest = sortedMessages[0];
  const oldest = sortedMessages[sortedMessages.length - 1];
  const totalTokens = messages.reduce((sum, message) => sum + message.tokens, 0);
  const conversationId = getConversationKey(newest);

  return {
    id: conversationId,
    title: shortenText(oldest.prompt, 70),
    preview: shortenText(newest.prompt, 110),
    totalMessages: messages.length,
    totalTokens,
    createdAt: oldest.createdAt,
    lastMessageAt: newest.createdAt
  };
}

function buildConversationDetails(messages) {
  const sortedMessages = messages.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const first = sortedMessages[0];
  const last = sortedMessages[sortedMessages.length - 1];
  const totalTokens = sortedMessages.reduce((sum, message) => sum + message.tokens, 0);

  return {
    id: getConversationKey(first),
    title: shortenText(first.prompt, 70),
    totalMessages: sortedMessages.length,
    totalTokens,
    createdAt: first.createdAt,
    lastMessageAt: last.createdAt,
    messages: sortedMessages
  };
}

async function loadConversationMessages({ userId, chatId }) {
  const fromConversation = await prisma.chat.findMany({
    where: {
      userId,
      conversationId: chatId
    }
  });

  if (fromConversation.length > 0) {
    return fromConversation;
  }

  const singleChat = await prisma.chat.findFirst({
    where: {
      userId,
      id: chatId
    }
  });

  if (!singleChat) {
    throw new AppError("Chat não encontrado.", 404, "CHAT_NOT_FOUND");
  }

  return [singleChat];
}

export async function createChatMessage({ userId, prompt, conversationId }) {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) {
    throw new AppError("O prompt não pode estar vazio.", 400, "INVALID_PROMPT");
  }

  const normalizedConversationId = conversationId?.trim() || randomUUID();
  const recentMessages = await prisma.chat.findMany({
    where: {
      userId,
      conversationId: normalizedConversationId
    },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  const response = buildSimulatedResponse({
    prompt: normalizedPrompt,
    recentMessages
  });

  const tokens = estimateTokens(normalizedPrompt, response);

  return prisma.chat.create({
    data: {
      userId,
      conversationId: normalizedConversationId,
      prompt: normalizedPrompt,
      response,
      tokens
    }
  });
}

export async function listUserChatHistory(userId) {
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const groupedConversations = new Map();
  chats.forEach((chat) => {
    const key = getConversationKey(chat);
    const current = groupedConversations.get(key) ?? [];
    current.push(chat);
    groupedConversations.set(key, current);
  });

  return Array.from(groupedConversations.values())
    .map((messages) => buildHistorySummaryFromMessages(messages))
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export async function getUserChatById({ userId, chatId }) {
  const messages = await loadConversationMessages({ userId, chatId });
  return buildConversationDetails(messages);
}

export async function deleteUserChatById({ userId, chatId }) {
  const deletedByConversation = await prisma.chat.deleteMany({
    where: {
      userId,
      conversationId: chatId
    }
  });

  if (deletedByConversation.count > 0) {
    return;
  }

  const singleChat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId
    }
  });

  if (!singleChat) {
    throw new AppError("Chat não encontrado.", 404, "CHAT_NOT_FOUND");
  }

  await prisma.chat.delete({
    where: { id: singleChat.id }
  });
}
