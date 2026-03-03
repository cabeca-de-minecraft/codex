import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../config/errors.js";
import { getUserById, loginUser, registerUser } from "../services/auth-service.js";

const emailSchema = z
  .string()
  .email("E-mail inválido.")
  .refine(
    (value) => value.split("@")[0]?.length >= 3,
    "O e-mail precisa ter pelo menos 3 caracteres antes do @."
  );

const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres.")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos 1 caractere especial.")
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72)
});

function issueJwtToken(request, user) {
  return request.server.jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    { expiresIn: env.jwtExpiresIn }
  );
}

function getUserIdFromToken(request) {
  const userId = request.user?.sub;
  if (!userId || typeof userId !== "string") {
    throw new AppError("Contexto de autenticação inválido.", 401, "INVALID_AUTH_CONTEXT");
  }

  return userId;
}

export async function registerController(request, reply) {
  const payload = registerSchema.parse(request.body);
  const user = await registerUser(payload);
  const token = issueJwtToken(request, user);

  return reply.status(201).send({
    token,
    user
  });
}

export async function loginController(request) {
  const payload = loginSchema.parse(request.body);
  const user = await loginUser(payload);
  const token = issueJwtToken(request, user);

  return {
    token,
    user
  };
}

export async function meController(request) {
  const userId = getUserIdFromToken(request);
  const user = await getUserById(userId);

  return { user };
}
