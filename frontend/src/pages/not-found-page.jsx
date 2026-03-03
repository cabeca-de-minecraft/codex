import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A rota informada não existe.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/chat">Ir para Chat</Link>
        </Button>
      </div>
    </div>
  );
}
