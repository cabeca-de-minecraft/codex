import { prisma } from "../prisma/client.js";

function getLastDaysLabels(totalDays) {
  const labels = [];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let index = totalDays - 1; index >= 0; index -= 1) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - index);
    labels.push(date.toISOString().slice(0, 10));
  }

  return labels;
}

export async function getUserStats(userId) {
  const chats = await prisma.chat.findMany({
    where: { userId },
    select: {
      createdAt: true,
      tokens: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const totalMessages = chats.length;
  const totalTokens = chats.reduce((sum, chat) => sum + chat.tokens, 0);
  const labels = getLastDaysLabels(7);
  const grouped = new Map(labels.map((label) => [label, { messages: 0, tokens: 0 }]));

  chats.forEach((chat) => {
    const key = chat.createdAt.toISOString().slice(0, 10);
    if (!grouped.has(key)) {
      return;
    }
    const current = grouped.get(key);
    grouped.set(key, {
      messages: current.messages + 1,
      tokens: current.tokens + chat.tokens
    });
  });

  const usage = labels.map((label) => ({
    date: label,
    messages: grouped.get(label).messages,
    tokens: grouped.get(label).tokens
  }));

  return {
    totalMessages,
    totalTokens,
    usage
  };
}

