# Padrão de Commits (Internacional + PT-BR)

Este projeto usa **Conventional Commits** com uma regra obrigatória:

## Regra absoluta

O **título do commit deve espelhar todas as alterações da branch atual, sempre**.

Isso significa:
- Não pode resumir só uma parte da mudança.
- Deve representar o conjunto completo do que foi alterado na branch no momento do commit.
- Se houver mudanças de tipos diferentes (ex.: `feat` + `fix` + `docs`), o título deve refletir o impacto principal e o corpo/comentário deve complementar.

## Formato

```txt
tipo(escopo): descrição curta no imperativo que represente o todo da branch
```

Exemplos corretos (espelhando a branch inteira):
- `feat(chat): implementar conversa por thread, envio com Enter e melhorias de resposta`
- `fix(auth): corrigir validação de login, CORS local e erro de conexão no frontend`
- `docs(project): atualizar README, SPEC e padrão de commits com regras finais`

## Tipos principais

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação/estilo sem alterar lógica
- `refactor`: melhoria interna sem mudar comportamento final
- `perf`: melhoria de performance
- `test`: criação/ajuste de testes
- `build`: mudanças de build/deploy/dependências de build
- `ci`: mudanças de integração contínua
- `chore`: manutenção geral
- `revert`: reversão de commit

## Como escolher o título quando há muitas mudanças

1. Liste os arquivos alterados da branch.
2. Agrupe por impacto funcional (auth, chat, histórico, dashboard, docs, infra).
3. Defina o impacto principal para `tipo(escopo)`.
4. Escreva a descrição cobrindo o conjunto completo (não parcial).

Comandos úteis:

```bash
git status --short
git diff --name-only
```

## Checklist antes do commit

- O título cobre **todas** as mudanças da branch?
- O `tipo` está coerente com o impacto principal?
- A descrição está específica e sem termos vagos (`update`, `ajustes`)?
- Há arquivos não relacionados que deveriam estar fora do commit?

## Template rápido

```txt
feat(escopo-principal): resumo completo das alterações da branch atual
```

## Bloco padrão após cada alteração

```bash
git add . && git commit -m "feat: example" && git push
```
