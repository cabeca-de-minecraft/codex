import { LayoutDashboard, LogOut, MessagesSquare, ScrollText } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle.jsx";
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

const navItems = [
  { to: "/chat", label: "Chat", icon: MessagesSquare },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "Histórico", icon: ScrollText }
];

const pageTitleMap = {
  "/chat": "Chat IA",
  "/dashboard": "Dashboard de Uso",
  "/history": "Histórico de Conversas"
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const currentTitle = pageTitleMap[location.pathname] ?? "AI Dashboard Light";

  function handleLogout() {
    clearSession();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#cffafe_0%,_#f8fafc_45%,_#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#020617_55%,_#020617_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:grid md:grid-cols-[18.5rem_minmax(0,1fr)]">
        <aside className="w-full border-b border-border/60 bg-white/90 p-3 backdrop-blur dark:bg-slate-900/95 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-4">
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-8">
            <h1 className="text-lg font-semibold leading-tight">AI Dashboard Light</h1>
            <ThemeToggle />
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 md:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "min-w-fit flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:min-w-0 md:justify-start",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 space-y-3 rounded-lg border border-border/60 bg-card/90 p-3 dark:bg-slate-950/80 md:mt-10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Conta</p>
            <p className="truncate text-sm font-medium">{user?.email ?? "sem sessão"}</p>
            <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0 p-3 sm:p-4 lg:p-8">
          <header className="mb-6 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/75">
            <h2 className="text-lg font-semibold">{currentTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat, histórico e métricas com autenticação JWT.
            </p>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
