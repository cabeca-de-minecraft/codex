import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { login, register } from "@/services/auth-service";
import { useAuthStore } from "@/store/use-auth-store";

export function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectPath = useMemo(() => location.state?.from ?? "/chat", [location.state]);

  useEffect(() => {
    setErrorMessage("");
  }, [mode]);

  if (token) {
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (mode === "register") {
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        if (password.length < 6 || !hasSpecialChar) {
          setErrorMessage("A senha deve ter 6+ caracteres e ao menos 1 caractere especial.");
          setIsLoading(false);
          return;
        }
      }

      if (email.split("@")[0]?.length < 3) {
        setErrorMessage("O e-mail precisa ter pelo menos 3 caracteres antes do @.");
        setIsLoading(false);
        return;
      }

      const action = mode === "login" ? login : register;
      const response = await action({
        email,
        password
      });
      setSession(response);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message ?? "Falha ao autenticar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,_#cffafe_0%,_#ecfeff_40%,_#f8fafc_100%)] p-4 dark:bg-[linear-gradient(160deg,_#082f49_0%,_#0f172a_45%,_#020617_100%)]">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">AI Dashboard Light</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" ? "Entre na sua conta" : "Crie sua conta para iniciar"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={mode === "login" ? "default" : "ghost"}
            onClick={() => setMode("login")}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === "register" ? "default" : "ghost"}
            onClick={() => setMode("register")}
          >
            Cadastro
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="você@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={mode === "register" ? 6 : 1}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={
                mode === "register"
                  ? "6+ caracteres e 1 especial (ex: !@#)"
                  : "Digite sua senha"
              }
            />
            {mode === "register" ? (
              <p className="text-xs text-muted-foreground">
                Requisito: mínimo de 6 caracteres e pelo menos 1 caractere especial.
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
