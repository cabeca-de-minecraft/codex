import { useEffect, useMemo, useState } from "react";
import { BarChart3, MessageSquareText, Sigma } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageMotion } from "@/components/page-motion";
import { StateMessage } from "@/components/state-message";
import { getStats } from "@/services/stats-service";
import { useAuthStore } from "@/store/use-auth-store";

function CompactCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </article>
  );
}

export function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalTokens: 0,
    usage: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getStats(token);
        setStats(response);
      } catch (error) {
        setErrorMessage(error.message ?? "Falha ao carregar estatísticas.");
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [token]);

  const averageTokens = useMemo(() => {
    if (!stats.totalMessages) {
      return 0;
    }
    return Math.round(stats.totalTokens / stats.totalMessages);
  }, [stats.totalMessages, stats.totalTokens]);

  return (
    <PageMotion>
      <section className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CompactCard title="Total de mensagens" value={stats.totalMessages} icon={MessageSquareText} />
          <CompactCard title="Total de tokens" value={stats.totalTokens} icon={Sigma} />
          <CompactCard title="Média tokens/mensagem" value={averageTokens} icon={BarChart3} />
        </div>

        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold">Uso nos últimos 7 dias</h3>
          <p className="mt-1 text-sm text-muted-foreground">Volume diário de mensagens e tokens simulados.</p>

          <div className="mt-4 h-72 w-full">
            {isLoading ? (
              <StateMessage title="Carregando gráfico..." description="Buscando dados do backend." />
            ) : null}

            {!isLoading && errorMessage ? (
              <StateMessage title="Erro ao carregar dashboard" description={errorMessage} />
            ) : null}

            {!isLoading && !errorMessage && stats.usage.every((entry) => entry.messages === 0) ? (
              <StateMessage title="Sem dados ainda" description="Envie mensagens no chat para alimentar o dashboard." />
            ) : null}

            {!isLoading && !errorMessage && stats.usage.some((entry) => entry.messages > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.usage} margin={{ left: 4, right: 16, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.35} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#0ea5e9"
                    fill="url(#messagesGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#22c55e"
                    fill="url(#tokensGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </article>
      </section>
    </PageMotion>
  );
}
