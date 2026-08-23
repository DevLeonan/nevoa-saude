# Segurança

## Estado atual

O projeto dispõe de sessão HTTP-only local para desenvolvimento, RBAC e verificação de tenant em todas as rotas de domínio. A rota de sessão de desenvolvimento aceita somente conexões de loopback e é desativada quando `NODE_ENV=production`.

O armazenamento JSON local é exclusivo de desenvolvimento. Ele não é adequado para dados reais de pacientes, pois não oferece gestão profissional de chaves, criptografia em repouso, concorrência multiinstância, backup transacional ou retenção LGPD.

## Controles implementados

- Sessões `HttpOnly` e `SameSite=Lax`, com expiração de oito horas.
- Papéis `OWNER`, `ADMIN`, `SECRETARY` e `VIEWER`, com permissões verificadas na API.
- Escopo de tenant antes de consultas ou mutações de domínio.
- Idempotência em criação e mudança de consulta.
- Optimistic locking em confirmação, cancelamento e remarcação.
- Proteção de double booking por verificação de sobreposição antes da escrita.
- Auditoria append-only para operações críticas.
- Webhook sandbox com HMAC SHA-256, comparação em tempo constante, janela anti-replay, schema mínimo e idempotência por evento.
- Servidor estático com lista explícita de arquivos públicos; dados, código do servidor e documentação não são publicados por HTTP.

## Obrigatório antes de produção

1. Substituir a sessão de desenvolvimento por OIDC/SAML ou provedor de identidade com MFA.
2. Migrar a persistência para PostgreSQL, com migrations, conexão TLS, backup e teste de restauração.
3. Guardar tokens e secrets em secret manager; nunca em `.env` de produção ou banco sem cifragem gerenciada.
4. Usar Redis/fila persistente para automações, retries e dead-letter queue.
5. Aplicar rate limiting, CSP, headers de segurança, observabilidade com redaction de PII e alertas.
6. Formalizar retenção, exportação e exclusão de dados conforme base legal e política LGPD.
7. Realizar revisão de segurança, testes de isolamento de tenant, carga e testes adversariais de IA.
