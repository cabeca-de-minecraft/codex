# SPEC.md — AI Dashboard Light

## 1. VISÃO GERAL

Desenvolver um sistema web fullstack chamado **AI Dashboard Light** com interface moderna, responsiva e visualmente agradável (estilo SaaS), permitindo:

- Autenticação de usuários
- Conversas com um modelo de IA
- Armazenamento de histórico
- Visualização de estatísticas básicas de uso

O sistema deve rodar localmente em uma máquina com:
- CPU: 2 cores / 4 threads
- RAM: 8GB
- OS: Linux Mint XFCE

Sem Docker, sem microserviços, sem Kubernetes.

---

## 2. PRINCÍPIOS FUNDAMENTAIS

- Simplicidade > complexidade
- Código legível e modular
- Interface bonita e funcional
- Baixo consumo de recursos
- Responsivo (desktop, tablet e mobile)
- Arquitetura evolutiva
- Documentação clara
- Projeto educacional e experimental

---

## 3. STACK FIXA (NÃO ALTERAR)

### Backend
- Node.js
- Fastify (preferencial) ou Express
- Prisma ORM
- SQLite
- JWT Authentication
- REST API

### Frontend
- Vite + React
- TailwindCSS
- shadcn/ui
- Zustand ou Context API
- Chart.js ou Recharts
- Framer Motion (opcional)

Proibido usar:
- Next.js
- Docker
- bancos pesados
- frameworks adicionais sem justificativa

---

## 4. FUNCIONALIDADES (ESCOPO FECHADO)

### Autenticação
- Registro
- Login
- Logout
- Middleware JWT
- Rotas protegidas

### Chat IA
- Campo de prompt
- Resposta do modelo (simulada ou API)
- Persistência no banco
- Interface estilo ChatGPT
- Scroll automático
- Loading states

### Histórico
- Listagem de conversas
- Visualização individual
- Exclusão

### Dashboard
- Total de mensagens
- Total de tokens (simulado)
- Gráfico simples de uso
- Cards informativos

---

## 5. TELAS OBRIGATÓRIAS

1. Login / Register
2. Chat
3. Dashboard
4. Histórico
5. Settings (opcional)

Layout:
- Sidebar
- Header
- Cards
- Dark mode / Light mode
- Animações suaves
- Design estilo SaaS moderno
- Mobile-first

---

## 6. API (ENDPOINTS MÍNIMOS)

### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Chat
- POST /chat
- GET /chat/history
- GET /chat/:id
- DELETE /chat/:id

### Dashboard
- GET /stats

---

## 7. MODELOS DE DADOS (PRISMA)

User:
- id (uuid)
- email (unique)
- password (hash)
- createdAt

Chat:
- id (uuid)
- userId (FK)
- prompt (text)
- response (text)
- tokens (int)
- createdAt

---

## 8. ESTRUTURA DE PASTAS OBRIGATÓRIA

### Backend
- src/
  - routes/
  - controllers/
  - services/
  - middleware/
  - prisma/
  - config/

### Frontend
- src/
  - pages/
  - components/
  - services/
  - store/
  - hooks/
  - styles/

---

## 9. FASES DE IMPLEMENTAÇÃO (SEQUENCIAL)

### Fase 1 — Setup
- Criar backend
- Criar frontend
- Configurar Prisma + SQLite
- Configurar Tailwind
- Estrutura de pastas
- README inicial

### Fase 2 — Auth
- Registro
- Login
- JWT
- Rotas protegidas

### Fase 3 — Chat
- Tela de chat
- Endpoint de chat
- Persistência
- Histórico

### Fase 4 — Dashboard
- Cards
- Gráfico
- Layout SaaS
- Dark mode

### Fase 5 — Polimento
- Responsividade
- UX
- Animações
- Tratamento de erros
- Loading e empty states

---

## 10. PADRÕES DE CÓDIGO

- Separação clara de responsabilidades
- async/await
- Sem código monolítico
- Variáveis semânticas
- Comentários quando necessário
- Evitar hardcode
- Tratar erros
- Validar inputs
- Não gerar código fictício

---

## 11. RESTRIÇÕES DE RECURSOS

- Projeto deve rodar com menos de 1GB RAM em idle
- Evitar watchers desnecessários
- Evitar dependências pesadas
- Não usar serviços externos obrigatórios

---

## 12. MODO DE OPERAÇÃO DO CODEX

Você (CODEX) deve:

1. Ler este SPEC.md completamente
2. Planejar antes de codar
3. Implementar por fases
4. Explicar cada etapa
5. Informar onde salvar cada arquivo
6. Garantir que o código compile
7. Não pular etapas
8. Não inventar funcionalidades fora do escopo
9. Não alterar a stack
10. Documentar tudo

---

## 13. SAÍDA FINAL OBRIGATÓRIA

Entregar:

- Código backend completo
- Código frontend completo
- Estrutura de pastas
- README.md contendo:
  - Pré-requisitos
  - Instalação
  - Execução
  - Testes manuais
- Projeto funcional localmente

---

## 14. CRITÉRIO DE CONCLUSÃO

O projeto está completo quando:

- Usuário consegue registrar e logar
- Envia mensagens
- Histórico é salvo
- Dashboard funciona
- UI é responsiva
- Não há erros críticos
- Projeto roda localmente

---

## 15. REGRA FINAL ABSOLUTA

Não:
- Adicione features extras
- Use tecnologias fora da stack
- Pule fases
- Gere código incompleto
- Crie soluções complexas

Comece obrigatoriamente pela Fase 1.
Somente avance após finalizar a fase atual.
---

## 16. SOLICITAÇÕES ADICIONAIS (APROVADAS DURANTE A EXECUÇÃO)

As solicitações abaixo foram adicionadas pelo usuário durante a implementação e passam a fazer parte do escopo funcional entregue.

### 16.1 Internacionalização de texto (PT-BR)
- Usar acentuação e UTF-8 em textos de interface e mensagens de erro/resposta.
- Evitar mensagens genéricas em inglês na experiência final do usuário.

### 16.2 Regras adicionais de autenticação
- E-mail deve ter formato válido.
- Parte local do e-mail (antes de `@`) deve ter pelo menos 3 caracteres.
- Login deve falhar quando o e-mail não estiver cadastrado.
- Senha deve ter:
  - mínimo de 6 caracteres
  - ao menos 1 caractere especial

### 16.3 Comportamento de chat
- Pressionar `Enter` no prompt envia mensagem.
- `Shift + Enter` mantém quebra de linha.
- Resposta simulada deve ser contextual ao tema da mensagem, com maior profundidade.

### 16.4 Histórico por conversa
- Histórico deve ser agrupado por conversa/chat (thread), não por mensagem isolada.
- Visualização detalhada deve mostrar mensagens da conversa selecionada.

### 16.5 Responsividade reforçada
- Ajustar layout para se adaptar corretamente ao redimensionamento contínuo da janela.
- Garantir boa experiência em desktop, tablet e mobile, incluindo tela cheia.

### 16.6 Ajustes de UX/tema
- Melhorar contraste e leitura da sidebar no modo dark.

### 16.7 Feature adicional relevante
- Histórico com busca e ordenação (por recentes, quantidade de mensagens e tokens).

### 16.8 Diretriz sobre banco de dados
- Permanecer com SQLite + Prisma como banco transacional principal para manter aderência à stack fixa.
- DuckDB pode ser considerado apenas como apoio analítico opcional, sem substituir a base principal.
