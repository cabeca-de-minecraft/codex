import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { ZodError } from "zod";
import { AppError } from "./config/errors.js";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";

function parseAllowedOrigins() {
  return env.corsOrigin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPrivateIpv4(hostname) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return false;
  }

  const [a, b] = hostname.split(".").map(Number);
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 127 && b === 0)
  );
}

export function buildApp() {
  const app = Fastify({ logger: true });
  const allowedOrigins = parseAllowedOrigins();

  app.register(cors, {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        const isPrivateNetwork = isPrivateIpv4(url.hostname);

        if (isLocalhost || isPrivateNetwork) {
          callback(null, true);
          return;
        }
      } catch {
        callback(null, false);
        return;
      }

      callback(null, false);
    },
    credentials: true
  });

  app.register(jwt, {
    secret: env.jwtSecret
  });

  app.register(registerRoutes);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Dados da requisição inválidos.",
        code: "VALIDATION_ERROR",
        issues: error.issues
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      message: "Erro interno do servidor.",
      code: "INTERNAL_SERVER_ERROR"
    });
  });

  return app;
}
