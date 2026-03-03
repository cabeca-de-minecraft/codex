import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const app = buildApp();

async function start() {
  try {
    await prisma.$connect();
    await app.listen({ port: env.port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function shutdown(signal) {
  app.log.info({ signal }, "Shutting down server");
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();

