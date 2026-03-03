# AGENTS.md

Instruções para agentes/LLMs ao abrir este diretório.

## Projeto

- Nome: `AI Dashboard Light`
- Stack fixa:
  - Backend: Node.js, Fastify, Prisma, SQLite, JWT
  - Frontend: Vite + React, TailwindCSS, shadcn/ui, Zustand, Recharts

## Regras essenciais

1. Respeitar `SPEC.md` como fonte de verdade de escopo.
2. Não trocar stack sem solicitação explícita.
3. Implementar mudanças com foco em simplicidade e baixo consumo de recursos.
4. Manter textos em PT-BR com UTF-8 (acentuação correta).
5. Atualizar `README.md` quando alterar setup, fluxo de uso ou comandos.
6. Seguir padrão de commits em `COMMIT.md`.

## Comandos úteis

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Build

```bash
cd backend
npm run prisma:generate

cd ../frontend
npm run build
```

## Convenções de alteração

- Preferir mudanças pequenas e verificáveis.
- Preservar estrutura de pastas existente.
- Não remover funcionalidades sem justificativa.
- Em caso de dúvida de requisito, consultar `SPEC.md`.

