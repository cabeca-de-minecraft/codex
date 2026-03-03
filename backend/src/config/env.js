import "dotenv/config";

const port = Number(process.env.PORT ?? 3333);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória. Copie .env.example para .env.");
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 12) {
  // Keep startup permissive for local setup, but signal insecure value.
  // eslint-disable-next-line no-console
  console.warn("JWT_SECRET está curta ou ausente. Atualize backend/.env para uso local mais seguro.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.isNaN(port) ? 3333 : port,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET ?? "dev-local-secret-123456",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
};
