import { create } from "zustand";

const STORAGE_KEY = "ai-dashboard-light-session";

function readInitialSession() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null
    };
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create((set) => ({
  ...readInitialSession(),
  setSession: ({ token, user }) => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        user
      })
    );
    set({ token, user });
  },
  clearSession: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  }
}));
