# Névoa Saúde — operação clínica local

Aplicação responsiva com backend executável para agenda, pacientes, equipe, conversas, configurações, automações, integrações sandbox, relatórios e auditoria.

## Executar

Requer Node.js 22.13.0 ou superior. O projeto usa apenas módulos nativos do Node, incluindo `node:sqlite`.

```bash
npm start
```

Abra `http://localhost:3000`. O banco persistente de desenvolvimento fica em `data/nevoa.db`. Se o banco ainda estiver vazio, o arquivo legado `data/store.json` é usado somente como fonte de importação inicial.

Depois de atualizar o projeto, encerre qualquer servidor antigo e inicie novamente. O navegador cria uma sessão de desenvolvimento local como proprietário; essa rota é desativada quando `NODE_ENV=production`.

## O que funciona localmente

- Agenda com filtros, detalhe, edição, confirmação, remarcação, cancelamento, idempotência e prevenção de conflito.
- Cadastro, busca, edição e arquivamento de pacientes.
- Configurações da clínica e administração de equipe com RBAC e proteção do último proprietário.
- Conversas locais com busca, filtros, notas internas, assumir/devolver, resolver/reabrir e auditoria.
- CRUD de automações e execução manual real no sandbox, criando mensagens locais para consultas elegíveis.
- CRUD de integrações genéricas sandbox, teste e sincronização simulada explicitamente sem rede externa.
- Relatórios por período, métricas calculadas dos dados persistidos, webhook HMAC de agenda e trilha de auditoria.

## WhatsApp Cloud API

O servidor já expõe o endpoint oficial de webhook em `/api/webhooks/whatsapp`. Para ativá-lo, configure no ambiente do servidor `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`. Esses segredos nunca devem ser enviados pelo chat nem versionados no Git.

No Railway, adicione um Volume montado em `/data` e configure `NEVOA_DB_PATH=/data/nevoa.db`; sem esse volume, o banco SQLite poderá ser perdido em uma nova implantação. Defina também `PUBLIC_BASE_URL` com o domínio HTTPS do Railway. Use como callback da Meta: `https://SEU-DOMINIO/api/webhooks/whatsapp`.

Enquanto essas variáveis não existem, as conversas permanecem no canal `LOCAL_SANDBOX`. A classificação de intenção atual usa regras locais, não um modelo externo de IA.

Para receber eventos sandbox de agenda, configure `NEVOA_WEBHOOK_SECRET` e envie webhooks assinados conforme [INTEGRATIONS.md](./INTEGRATIONS.md).

## Verificação

```bash
npm run check
npm test
```

## Antes de produção

Ainda são necessários autenticação real, HTTPS, gestão segura de segredos, banco transacional de produção, filas/workers, backups, controles LGPD e conectores oficiais de agenda e WhatsApp Business. Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) e [SECURITY.md](./SECURITY.md).
