function getDefaultApiUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:3333";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = window.location.hostname || "localhost";
  return `${protocol}//${host}:3333`;
}

export const API_URL = import.meta.env.VITE_API_URL ?? getDefaultApiUrl();

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar ao backend (${API_URL}). Verifique se o servidor está ativo.`,
      0,
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? "Falha na requisição.", response.status, payload?.code);
  }

  return payload;
}
