import { AppError } from "../config/errors.js";

export async function requireAuth(request) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError("Autenticação obrigatória.", 401, "UNAUTHORIZED");
  }
}
