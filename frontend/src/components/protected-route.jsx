import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { me } from "@/services/auth-service";
import { useAuthStore } from "@/store/use-auth-store";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(Boolean(token && !user));

  useEffect(() => {
    let ignore = false;

    async function validateSession() {
      if (!token || user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await me(token);
        if (!ignore) {
          setSession({
            token,
            user: response.user
          });
        }
      } catch {
        if (!ignore) {
          clearSession();
        }
      } finally {
        if (!ignore) {
          setIsChecking(false);
        }
      }
    }

    validateSession();

    return () => {
      ignore = true;
    };
  }, [token, user, setSession, clearSession]);

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-sm text-muted-foreground">
        Validando sessão...
      </div>
    );
  }

  return <Outlet />;
}
