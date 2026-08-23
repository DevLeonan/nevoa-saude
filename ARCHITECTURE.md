# Arquitetura proposta

## Diagnóstico inicial

O diretório do projeto não continha arquivos, dependências, banco de dados nem histórico de aplicação. Portanto não havia framework ou arquitetura existente a preservar. A entrega atual inclui uma interface responsiva e um núcleo local executável para demonstrar com dados de desenvolvimento os fluxos críticos de agenda e conversa.

O armazenamento JSON local não é um banco de dados de produção nem deve receber dados reais de pacientes. Ele existe para possibilitar teste funcional imediato, sem credenciais externas. PostgreSQL, autenticação, filas persistentes e provedores oficiais continuam obrigatórios antes de qualquer uso real.

## Decisão de stack de produção

- **Web e API:** TypeScript, Next.js (BFF/painel) e NestJS modular para a API de domínio. Ambos tipados, maduros e fáceis de manter em longo prazo.
- **Dados:** PostgreSQL com migrations versionadas, isolamento obrigatório por `tenant_id`, índices compostos e, quando aplicável, RLS como camada adicional.
- **Assíncrono:** Redis + BullMQ inicialmente, com jobs persistentes, idempotência, backoff, DLQ e `correlation_id`.
- **Integrações:** adaptadores TypeScript que implementam `SchedulingProvider`; webhooks primeiro, polling incremental como alternativa.
- **Infraestrutura:** containers, object storage compatível com S3, OpenTelemetry, logs com redaction, Sentry e CI com lint, typecheck, testes e validação de migrations.

Um monólito modular é a escolha inicial: oferece transações e iteração rápida sem acoplamento interno. Os módulos têm contratos de eventos para eventual extração.

## Implementação local atual

O núcleo executável usa Node.js sem bibliotecas externas para permitir execução imediata. Ele já aplica sessão local de desenvolvimento, RBAC, escopo de tenant, auditoria, idempotência, optimistic locking, prevenção de double booking e webhooks HMAC. Essa implementação é uma base funcional para validar fluxos; não substitui o stack de produção definido acima.

## Fluxo operacional

```text
Sistema médico externo
  → Integration Gateway (assinatura, schema, idempotência)
  → Normalization Layer (IDs externos, status, timezone)
  → Scheduling Domain (fonte da verdade explícita)
  → Audit + Outbox
  → Event / Job Queue
  → Automation Engine
  → AI Orchestrator (somente interpretação)
  → Policy Engine + ferramentas validadas
  → Communication Gateway
  → WhatsApp / SMS / Email / Voz
  → Paciente
```

Antes de qualquer confirmação, cancelamento ou remarcação, o domínio busca novamente o estado e disponibilidade na fonte oficial. A alteração externa precisa retornar sucesso antes da confirmação ao paciente.

## Módulos e diretórios alvo

```text
apps/
  web/                         # painel Next.js
  api/src/modules/
    auth tenants users patients scheduling
    integrations communications conversations
    automations ai auditing analytics
packages/
  domain/                      # tipos, eventos e regras compartilhadas
  integration-contracts/       # SchedulingProvider e mappers
  api-contracts/               # DTOs/OpenAPI
infra/                         # containers, IaC, observabilidade
docs/adr/                      # decisões arquiteturais
```

## Modelo de dados essencial

Todas as tabelas de domínio recebem `tenant_id`, timestamps e, quando alteráveis, `version` para optimistic locking. `tenant` possui `units`, `users`, `roles` e `integrations`. `patient`, `doctor` e `appointment` preservam `external_id`, `integration_id` e o instante externo de atualização.

`appointment` referencia paciente, profissional, unidade e tipo de consulta; `appointment_history` é append-only. `conversation` referencia paciente e canal; `message` referencia conversa e, opcionalmente, consulta/automação. `automation_rule` gera `automation_execution` e jobs. `webhook_event`, `outbox_event`, `notification_job`, `ai_execution`, `human_handoff` e `audit_log` têm chave de idempotência/correlação. Credenciais ficam cifradas, com referência ao secret manager.

## Contratos principais

- `POST /v1/webhooks/:provider` — valida assinatura, timestamp, tamanho e idempotência.
- `GET /v1/appointments` e `GET /v1/appointments/:id` — filtragem autorizada por tenant/unidade.
- `POST /v1/appointments/:id/confirm` — requer versão/`Idempotency-Key` e reconfirma fonte oficial.
- `POST /v1/appointments/:id/reschedule/quote` — retorna disponibilidade atual.
- `POST /v1/appointments/:id/reschedule` — reserva/valida novamente e atualiza a fonte oficial.
- `POST /v1/appointments/:id/cancel` — aplica política da clínica e registra auditoria.
- `POST /v1/conversations/:id/takeover` e `/release` — controle humano explícito.
- `POST /v1/integrations/:id/sync` — dispara job; nunca sincroniza em request.

Respostas de erro seguem `{ error: { code, message, correlation_id } }`.

## Eventos internos

`appointment.ingested`, `appointment.updated`, `appointment.confirmation_requested`, `appointment.confirmed`, `appointment.reschedule_requested`, `appointment.rescheduled`, `appointment.cancelled`, `message.received`, `message.sent`, `automation.queued`, `automation.executed`, `handoff.required`, `integration.failed`, `integration.reconciled` e `ai.intent_classified`.

Eventos possuem `event_id`, `tenant_id`, `occurred_at`, `correlation_id`, versão e `idempotency_key`. Eventos antigos não podem sobrescrever versões mais recentes.

## IA: permitida e proibida

A IA interpreta linguagem natural, extrai intenção estruturada, produz respostas usando dados de ferramentas e gera resumo de conversa. Ela não pode executar SQL, selecionar endpoints arbitrários, definir regras clínicas, inventar horários/preços/consultas, confirmar sucesso ou acessar dados fora da conversa autorizada. O Policy Engine autoriza as ferramentas permitidas e o Scheduling Domain executa a ação.

## Segurança e LGPD

Principais ameaças: vazamento entre tenants, acesso indevido a dados sensíveis, webhook forjado/reproduzido, token de integração comprometido, prompt injection, double booking, evento fora de ordem e indisponibilidade de provedor.

Controles: RBAC granular, escopo obrigatório em repositórios, testes de isolamento, sessões seguras/MFA, rate limit, assinatura/HMAC + replay window em webhooks, schema validation, segredo em secret manager, criptografia em trânsito e repouso, PII redaction, auditoria imutável, retenção configurável e human handoff para baixa confiança, emergência ou conteúdo clínico.

## Roadmap executável

1. Foundation: monorepo, auth/RBAC, tenants, auditoria, migrations, observabilidade e CI.
2. Scheduling: pacientes, profissionais, unidades, agenda, estados normalizados e concorrência.
3. Integration: contrato de provider, primeiro conector, webhooks, polling incremental e reconciliation.
4. Comunicação: conversas, mensagens, templates, WhatsApp oficial e jobs confiáveis.
5. Automação: regras configuráveis, timers, retries e horário permitido.
6. IA: classificador, ferramentas limitadas, policy engine, summaries e handoff.
7. Painel: conectar esta interface a APIs reais, permissões e estados de carregamento/erro.
8. Analytics e hardening: métricas, custos de IA, carga, adversarial testing e DR.

## Estratégia de testes

Testes unitários para transições de estado, políticas, normalizadores e mappers; integração com PostgreSQL/Redis para tenancy, outbox, idempotência e locks; testes de contrato por adaptador; E2E para confirmação/remarcação/cancelamento; testes de concorrência para double booking; testes de segurança para RBAC, webhooks, LGPD e injection; e testes de resiliência para duplicação, desordem, timeout e retries.

## Riscos iniciais

APIs externas podem ser inconsistentes ou indisponíveis; disponibilidade é altamente concorrente; regras operacionais variam por clínica; integrações do WhatsApp requerem aprovação e templates; e dados de saúde elevam o nível de compliance. Cada risco é mitigado por source of truth explícita, idempotência, filas persistentes, reconciliação, rollout gradual e limites rigorosos para IA.
