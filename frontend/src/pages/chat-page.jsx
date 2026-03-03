import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquarePlus, SendHorizontal } from "lucide-react";
import { PageMotion } from "@/components/page-motion";
import { StateMessage } from "@/components/state-message";
import { Button } from "@/components/ui/button";
import { createChat, getChatById, getChatHistory } from "@/services/chat-service";
import { useAuthStore } from "@/store/use-auth-store";

function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export function ChatPage() {
  const token = useAuthStore((state) => state.token);
  const [prompt, setPrompt] = useState("");
  const [chatSummaries, setChatSummaries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingConversation, setIsFetchingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);

  const conversation = useMemo(
    () =>
      messages.flatMap((chat) => [
        {
          id: `${chat.id}-user`,
          role: "user",
          content: chat.prompt,
          createdAt: chat.createdAt
        },
        {
          id: `${chat.id}-assistant`,
          role: "assistant",
          content: chat.response,
          tokens: chat.tokens,
          createdAt: chat.createdAt
        }
      ]),
    [messages]
  );

  async function refreshChatSummaries({ selectConversationId } = {}) {
    const response = await getChatHistory(token);
    const summaries = response.chats ?? [];
    setChatSummaries(summaries);

    if (!selectConversationId) {
      return summaries;
    }

    const shouldKeepCurrent = summaries.some((chat) => chat.id === selectConversationId);
    if (shouldKeepCurrent) {
      return summaries;
    }

    if (summaries.length > 0) {
      setActiveConversationId(summaries[0].id);
      return summaries;
    }

    setActiveConversationId("");
    setMessages([]);
    return summaries;
  }

  async function loadConversation(conversationId) {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsFetchingConversation(true);
    setErrorMessage("");

    try {
      const response = await getChatById(conversationId, token);
      setMessages(response.chat?.messages ?? []);
      setActiveConversationId(conversationId);
    } catch (error) {
      setErrorMessage(error.message ?? "Falha ao carregar conversa.");
    } finally {
      setIsFetchingConversation(false);
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      setIsFetching(true);
      setErrorMessage("");

      try {
        const summaries = await refreshChatSummaries();
        if (summaries.length > 0) {
          await loadConversation(summaries[0].id);
        } else {
          setMessages([]);
          setActiveConversationId("");
        }
      } catch (error) {
        setErrorMessage(error.message ?? "Falha ao carregar histórico.");
      } finally {
        setIsFetching(false);
      }
    }

    loadInitialData();
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  async function sendPrompt() {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt || isSending) {
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await createChat(
        {
          prompt: normalizedPrompt,
          conversationId: activeConversationId || undefined
        },
        token
      );
      const createdChat = response.chat;
      const conversationId = createdChat.conversationId ?? createdChat.id;

      if (!activeConversationId || activeConversationId === conversationId) {
        setMessages((previous) => [...previous, createdChat]);
      } else {
        await loadConversation(conversationId);
      }

      setActiveConversationId(conversationId);
      await refreshChatSummaries({ selectConversationId: conversationId });
      setPrompt("");
    } catch (error) {
      setErrorMessage(error.message ?? "Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendPrompt();
  }

  async function handleSelectConversation(conversationId) {
    if (conversationId === activeConversationId || isFetchingConversation) {
      return;
    }
    await loadConversation(conversationId);
  }

  function handleNewConversation() {
    setActiveConversationId("");
    setMessages([]);
    setPrompt("");
    setErrorMessage("");
  }

  async function handlePromptKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await sendPrompt();
    }
  }

  return (
    <PageMotion>
      <section className="grid min-w-0 gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-3 shadow-sm xl:h-[calc(100vh-11rem)] xl:overflow-y-auto">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Chats</p>
            <Button type="button" variant="outline" size="sm" onClick={handleNewConversation}>
              <MessageSquarePlus className="mr-1 h-4 w-4" />
              Novo chat
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0 xl:pr-1">
            {chatSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum chat iniciado ainda.</p>
            ) : (
              chatSummaries.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => handleSelectConversation(chat.id)}
                  className={`min-w-56 rounded-lg border px-3 py-2 text-left text-sm transition-colors xl:min-w-0 ${
                    activeConversationId === chat.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {chat.totalMessages} msgs • {chat.totalTokens} tokens
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="grid min-w-0 gap-4">
          <div
            ref={scrollRef}
            className="h-[52vh] min-h-[18rem] overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm sm:h-[56vh] md:p-5 xl:h-[calc(100vh-20rem)]"
          >
            {isFetching || isFetchingConversation ? (
              <StateMessage title="Carregando conversa..." description="Buscando seu histórico mais recente." />
            ) : null}

            {!isFetching && !isFetchingConversation && errorMessage ? (
              <StateMessage title="Erro ao carregar chat" description={errorMessage} />
            ) : null}

            {!isFetching && !isFetchingConversation && !errorMessage && conversation.length === 0 ? (
              <StateMessage
                title="Sem mensagens ainda"
                description="Envie um prompt para iniciar ou continuar um chat."
              />
            ) : null}

            <div className="space-y-3">
              {conversation.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[95%] rounded-2xl p-3 text-sm shadow-sm md:max-w-[80%] xl:max-w-[74%] ${
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <div
                    className={`mt-2 flex items-center gap-2 text-[11px] ${
                      message.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    <span>{formatDateTime(message.createdAt)}</span>
                    {message.role === "assistant" ? <span>{message.tokens} tokens</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <label htmlFor="chat-prompt" className="mb-2 block text-sm font-medium">
              Prompt
            </label>
            <textarea
              id="chat-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Digite sua mensagem para a IA..."
              rows={4}
              maxLength={3000}
              className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-2 text-xs text-muted-foreground">Enter envia • Shift + Enter quebra linha</p>
            {errorMessage && !isFetching ? (
              <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <div className="mt-3 flex items-center justify-end">
              <Button type="submit" disabled={isSending}>
                <SendHorizontal className="mr-2 h-4 w-4" />
                {isSending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PageMotion>
  );
}

