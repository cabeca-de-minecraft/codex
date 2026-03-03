import { useEffect, useMemo, useState } from "react";
import { Clock4, Search, Trash2 } from "lucide-react";
import { PageMotion } from "@/components/page-motion";
import { StateMessage } from "@/components/state-message";
import { Button } from "@/components/ui/button";
import { deleteChatById, getChatById, getChatHistory } from "@/services/chat-service";
import { useAuthStore } from "@/store/use-auth-store";

function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export function HistoryPage() {
  const token = useAuthStore((state) => state.token);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getChatHistory(token);
        const loadedChats = response.chats ?? [];
        setChats(loadedChats);
        if (loadedChats.length > 0) {
          setIsLoadingDetails(true);
          const detail = await getChatById(loadedChats[0].id, token);
          setSelectedChat(detail.chat);
        } else {
          setSelectedChat(null);
        }
      } catch (error) {
        setErrorMessage(error.message ?? "Falha ao carregar histórico.");
      } finally {
        setIsLoadingDetails(false);
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  const filteredAndSortedChats = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = chats.filter((chat) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${chat.title} ${chat.preview}`.toLowerCase().includes(normalizedQuery);
    });

    const sorted = filtered.slice();
    if (sortBy === "tokens") {
      sorted.sort((a, b) => b.totalTokens - a.totalTokens);
      return sorted;
    }

    if (sortBy === "messages") {
      sorted.sort((a, b) => b.totalMessages - a.totalMessages);
      return sorted;
    }

    sorted.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return sorted;
  }, [chats, searchQuery, sortBy]);

  const hasChats = useMemo(() => chats.length > 0, [chats.length]);

  async function handleSelect(chatId) {
    if (isLoadingDetails) {
      return;
    }

    setIsLoadingDetails(true);
    setErrorMessage("");
    try {
      const detail = await getChatById(chatId, token);
      setSelectedChat(detail.chat);
    } catch (error) {
      setErrorMessage(error.message ?? "Falha ao carregar conversa.");
    } finally {
      setIsLoadingDetails(false);
    }
  }

  async function handleDelete(chatId) {
    setIsDeletingId(chatId);
    setErrorMessage("");

    try {
      await deleteChatById(chatId, token);
      const nextChats = chats.filter((chat) => chat.id !== chatId);
      setChats(nextChats);

      if (selectedChat?.id === chatId) {
        if (nextChats.length > 0) {
          setIsLoadingDetails(true);
          const detail = await getChatById(nextChats[0].id, token);
          setSelectedChat(detail.chat);
        } else {
          setSelectedChat(null);
        }
      }
    } catch (error) {
      setErrorMessage(error.message ?? "Falha ao excluir conversa.");
    } finally {
      setIsLoadingDetails(false);
      setIsDeletingId("");
    }
  }

  return (
    <PageMotion>
      <section className="grid min-w-0 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold">Conversas salvas</h3>
          <p className="mt-1 text-sm text-muted-foreground">Busque, ordene e selecione uma conversa.</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr,auto]">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por título ou conteúdo..."
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="recent">Mais recentes</option>
              <option value="messages">Mais mensagens</option>
              <option value="tokens">Mais tokens</option>
            </select>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <StateMessage title="Carregando histórico..." description="Buscando conversas no servidor." />
            ) : null}

            {!isLoading && errorMessage ? (
              <StateMessage title="Erro no histórico" description={errorMessage} />
            ) : null}

            {!isLoading && !errorMessage && !hasChats ? (
              <StateMessage title="Nenhuma conversa salva" description="Envie prompts no chat para gerar histórico." />
            ) : null}

            {!isLoading && !errorMessage && hasChats && filteredAndSortedChats.length === 0 ? (
              <StateMessage
                title="Nenhum resultado"
                description="A busca atual não encontrou conversas com esse critério."
              />
            ) : null}

            {!isLoading &&
              !errorMessage &&
              filteredAndSortedChats.map((chat) => (
                <article
                  key={chat.id}
                  className={`rounded-lg border p-3 ${
                    selectedChat?.id === chat.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(chat.id)}
                    className="w-full text-left"
                  >
                    <p className="max-h-10 overflow-hidden text-sm font-medium">{chat.title}</p>
                    <p className="mt-1 max-h-10 overflow-hidden text-xs text-muted-foreground">{chat.preview}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock4 className="h-3 w-3" />
                        {formatDateTime(chat.lastMessageAt)}
                      </span>
                      <span>{chat.totalMessages} msgs</span>
                      <span>{chat.totalTokens} tokens</span>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 h-8 w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => handleDelete(chat.id)}
                    disabled={isDeletingId === chat.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeletingId === chat.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </article>
              ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold">Detalhes</h3>
          {isLoadingDetails ? (
            <div className="mt-4">
              <StateMessage title="Carregando chat..." description="Buscando mensagens da conversa selecionada." />
            </div>
          ) : null}
          {!selectedChat && !isLoadingDetails ? (
            <div className="mt-4">
              <StateMessage title="Nada selecionado" description="Selecione uma conversa para visualizar aqui." />
            </div>
          ) : isLoadingDetails ? null : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedChat.totalMessages} mensagens • {selectedChat.totalTokens} tokens
              </p>
              {(selectedChat.messages ?? []).map((message) => (
                <article key={message.id} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="rounded-md bg-background p-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Prompt</p>
                    <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed">
                      {message.prompt}
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary/40 p-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Resposta</p>
                    <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed">
                      {message.response}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(message.createdAt)} • {message.tokens} tokens
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageMotion>
  );
}

