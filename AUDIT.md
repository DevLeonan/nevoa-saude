# AUDITORIA FUNCIONAL — NÉVOA SAÚDE

Última revisão: 23/08/2026  
Escopo: `index.html`, `app.js`, `server.js`, `database.js`, `tests/server.test.js` e banco local.  
Objetivo: registrar o que funciona de ponta a ponta, o que ainda está sendo construído e o que depende de serviços externos.

Este documento é um inventário técnico, não uma declaração de que o produto está pronto para produção.

## Legenda obrigatória

- **[IMPLEMENTADO E TESTADO]**: existe no código e possui evidência automatizada passando no snapshot auditado.
- **[IMPLEMENTADO, SEM E2E]**: existe no backend e/ou frontend, mas ainda não possui teste de navegador cobrindo o fluxo completo.
- **[EM IMPLEMENTAÇÃO NESTA RODADA]**: há trabalho concreto no código, porém o ciclo completo de aceite ainda não foi comprovado.
- **[BLOQUEADO POR CREDENCIAIS EXTERNAS]**: a validação real depende de conta, credencial, número, aplicativo ou acesso do fornecedor.
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]**: deve ser removido, ficar indisponível ou ser identificado claramente como sandbox até existir estado real.
- **[AUSENTE]**: não existe implementação suficiente no snapshot atual.

## Resumo executivo

| Área | Estado auditado | Observação |
|---|---|---|
| Persistência SQLite e migrations | **[IMPLEMENTADO E TESTADO]** | Os testes usam banco SQLite temporário e passaram. |
| Sessão local de desenvolvimento | **[IMPLEMENTADO E TESTADO]** | Protege rotas, mas não substitui login de produção. |
| Pacientes | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | API CRUD, busca, paginação e arquivo testados; UI implementada sem E2E. |
| Agenda/consultas | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | Operações centrais da API testadas; UI implementada sem E2E e filtros ainda incompletos. |
| Dashboard | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | API passou a calcular dados reais; ainda há conteúdo/controles fixos e não há E2E. |
| Conversas | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | Persistência local existe; não há entrega WhatsApp real. |
| Pendências | **[IMPLEMENTADO, SEM E2E]** | Listagem real, sem ações de resolução. |
| Automações | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | Listagem e toggle persistem; não há motor de jobs. |
| Integrações | **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** | Apenas conector/webhook sandbox. |
| Relatórios | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | Totais básicos reais; taxa de IA ainda não é confiável nessa rota. |
| Equipe | **[AUSENTE]** | Página placeholder e sem API. |
| Auditoria | **[IMPLEMENTADO, SEM E2E]** | Registros persistem e podem ser listados; cobertura de eventos é incompleta. |
| Configurações | **[AUSENTE]** | A tabela existe, mas não há API nem formulário funcional. |
| Login de produção | **[AUSENTE]** | O frontend cria sessão de desenvolvimento automaticamente. |
| Profissionais e unidades | **[AUSENTE]** | Profissionais continuam fixos no código; unidade não é entidade persistida. |

Nenhuma página deve ser tratada como integralmente pronta enquanto houver ações visuais sem função, dados falsos de fallback ou ausência de teste E2E.

## Inventário da interface

No HTML auditado existem:

- 11 páginas/rotas visuais;
- 52 botões estáticos;
- 13 links;
- 3 formulários;
- 3 modais;
- 17 inputs;
- 3 selects;
- 3 switches/checkboxes.

A quantidade em runtime varia: Agenda, Pacientes, Conversas e Integrações recriam controles a partir das respostas da API.

### Estrutura global

| Controle | Estado | Aceite pendente |
|---|---|---|
| Navegação lateral por hash | **[IMPLEMENTADO, SEM E2E]** | Testar todas as rotas, refresh e back/forward no navegador. |
| Menu mobile | **[IMPLEMENTADO, SEM E2E]** | Testar em viewport móvel real. |
| Alternar clínica | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Não há troca de tenant/unidade. |
| Busca global | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Botão sem ação. |
| Notificações e badge vermelho | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Não existe fonte de notificações. |
| Menu de perfil | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Não há perfil/logout funcional. |
| Badges “Agenda 12” e “Conversas 4” | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Devem vir da API ou ser removidos. |
| Data superior | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | “Segunda-feira, 23 de agosto” é fixa e incorreta; 23/08/2026 é domingo. |
| “Todos os sistemas operacionais” | **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** | Não é derivado de health checks. |

## Páginas e controles

### Dashboard

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO, SEM E2E]** cards de consultas do dia, confirmadas, aguardando, canceladas e remarcadas calculados pela API;
- **[IMPLEMENTADO, SEM E2E]** taxa de IA nula quando não há amostra, em vez de inventar resultado;
- **[IMPLEMENTADO, SEM E2E]** pendências derivadas de consultas, conversas e integrações;
- **[IMPLEMENTADO, SEM E2E]** atividade derivada da auditoria;
- **[IMPLEMENTADO, SEM E2E]** série de confirmação calculada para sete dias;
- **[IMPLEMENTADO, SEM E2E]** botão Nova consulta;
- **[IMPLEMENTADO, SEM E2E]** links para Agenda, Conversas e Pendências;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** agenda pré-renderizada com nomes fixos enquanto o fetch não terminou ou falhou;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** unidade “Jardins” sem entidade correspondente;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** controle “7 dias” se continuar sem ação;
- **[AUSENTE]** teste automatizado específico do contrato completo do Dashboard;
- **[AUSENTE]** E2E de loading, vazio, erro e atualização após mutação.

### Agenda

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO E TESTADO]** criar consulta;
- **[IMPLEMENTADO E TESTADO]** impedir conflito de horário;
- **[IMPLEMENTADO E TESTADO]** idempotência na criação;
- **[IMPLEMENTADO E TESTADO]** visualizar detalhe por ID;
- **[IMPLEMENTADO E TESTADO]** editar data, hora, profissional e duração;
- **[IMPLEMENTADO E TESTADO]** confirmar;
- **[IMPLEMENTADO E TESTADO]** remarcar;
- **[IMPLEMENTADO E TESTADO]** cancelar;
- **[IMPLEMENTADO E TESTADO]** filtrar API por data e profissional;
- **[IMPLEMENTADO, SEM E2E]** navegar entre datas na interface;
- **[IMPLEMENTADO, SEM E2E]** abrir evento e executar ações pelo modal;
- **[IMPLEMENTADO, SEM E2E]** atualizar Dashboard e Agenda depois de criar/editar;
- **[AUSENTE]** busca na interface;
- **[AUSENTE]** filtro visual por status;
- **[AUSENTE]** filtro por unidade;
- **[AUSENTE]** cadastro/listagem dinâmica de profissionais;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** texto “sincronizada com fonte oficial” enquanto só existir sandbox;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** eventos fixos pré-renderizados em caso de falha da API;
- **[AUSENTE]** E2E cobrindo criar → editar → confirmar → remarcar → cancelar → refresh.

### Pacientes

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO E TESTADO]** cadastrar;
- **[IMPLEMENTADO E TESTADO]** buscar por nome/telefone/e-mail;
- **[IMPLEMENTADO E TESTADO]** paginar;
- **[IMPLEMENTADO E TESTADO]** editar;
- **[IMPLEMENTADO E TESTADO]** arquivar preservando histórico;
- **[IMPLEMENTADO E TESTADO]** persistir em SQLite;
- **[IMPLEMENTADO, SEM E2E]** formulário com loading e feedback;
- **[IMPLEMENTADO, SEM E2E]** busca com debounce e paginação na interface;
- **[IMPLEMENTADO, SEM E2E]** associação automática entre nova consulta e paciente;
- **[AUSENTE]** perfil somente leitura com histórico completo;
- **[AUSENTE]** seleção de paciente real no modal de consulta — o campo ainda aceita texto livre;
- **[AUSENTE]** restaurar paciente arquivado;
- **[AUSENTE]** E2E de criar → buscar → editar → arquivar → refresh/reinício.

### Conversas

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO, SEM E2E]** listar e abrir conversas persistidas;
- **[IMPLEMENTADO, SEM E2E]** visualizar mensagens persistidas;
- **[IMPLEMENTADO, SEM E2E]** gravar mensagem de saída no banco local;
- **[IMPLEMENTADO, SEM E2E]** assumir atendimento e devolver para IA;
- **[IMPLEMENTADO E TESTADO]** endpoint sandbox de mensagem recebida classifica intenção e confirma consulta vinculada;
- **[AUSENTE]** nova conversa;
- **[AUSENTE]** busca funcional;
- **[AUSENTE]** filtros Abertas/Minhas/Resolvidas;
- **[AUSENTE]** encerrar/reabrir atendimento;
- **[AUSENTE]** nota interna;
- **[AUSENTE]** painel lateral atualizado para a conversa selecionada;
- **[AUSENTE]** status reais `queued/sent/delivered/read/failed`;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** exibir “WhatsApp” e `✓✓` para uma mensagem apenas salva localmente;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** opções de horário presas a `apt_marcelo`, `conv_marcelo` e data fixa;
- **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** envio e recebimento reais pelo WhatsApp Business Cloud API;
- **[AUSENTE]** E2E do fluxo de conversa sandbox.

### Pendências

Estado da página: **[IMPLEMENTADO, SEM E2E]**, somente leitura.

- **[IMPLEMENTADO, SEM E2E]** listar consultas e conversas que exigem ação humana;
- **[AUSENTE]** abrir o item no contexto exato;
- **[AUSENTE]** resolver, atribuir, dispensar ou registrar motivo;
- **[AUSENTE]** busca, filtros e paginação;
- **[AUSENTE]** teste de navegador.

### Automações

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO, SEM TESTE DEDICADO]** listar regras persistidas;
- **[IMPLEMENTADO, SEM TESTE DEDICADO]** ativar/desativar e persistir;
- **[AUSENTE]** criar, editar e excluir regra;
- **[AUSENTE]** visualizar histórico;
- **[AUSENTE]** gerar job a partir da agenda;
- **[AUSENTE]** worker, tentativas, retry e dead-letter;
- **[AUSENTE]** registrar execução e resultado do envio;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** apresentar execuções ou taxa de resolução sem histórico real;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** vincular switches a IDs fixos pela posição;
- **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** comprovar execução de ação WhatsApp real;
- **[AUSENTE]** testes de CRUD, execução e histórico.

### Integrações

Estado da página: **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** para fornecedores reais; **[IMPLEMENTADO E TESTADO]** apenas para webhook sandbox.

- **[IMPLEMENTADO E TESTADO]** webhook sandbox assinado por HMAC;
- **[IMPLEMENTADO E TESTADO]** deduplicação de evento webhook;
- **[IMPLEMENTADO, SEM E2E]** listar configuração sandbox;
- **[AUSENTE]** adicionar integração pela interface;
- **[AUSENTE]** informar e proteger credenciais;
- **[AUSENTE]** testar conexão;
- **[AUSENTE]** ativar/desativar;
- **[AUSENTE]** sincronização manual/automática e histórico;
- **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** WhatsApp Business: Meta Business, WABA ID, Phone Number ID, token, App Secret, verify token, número e webhook HTTPS;
- **[BLOQUEADO POR CREDENCIAIS EXTERNAS]** Doctoralia: acesso oficial à API/parceria, credenciais e documentação autorizada;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** cards “Conectado”, latência, volume e entrega inventados;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** saúde sempre verde para banco, fila, IA ou WhatsApp;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** chamar sandbox de integração oficial.

### Relatórios

Estado da página: **[EM IMPLEMENTAÇÃO NESTA RODADA]**.

- **[IMPLEMENTADO E TESTADO]** endpoint retorna totais numéricos básicos;
- **[IMPLEMENTADO, SEM E2E]** interface apresenta métricas persistidas;
- **[NÃO DEVE EXISTIR COMO SIMULAÇÃO ENGANOSA]** `aiResolutionRate: 84` fixo na rota de relatórios;
- **[AUSENTE]** período, filtros, comparação, drill-down e exportação;
- **[AUSENTE]** paginação quando houver dados tabulares;
- **[AUSENTE]** testes específicos de cálculos e datas.

### Equipe

Estado da página: **[AUSENTE]**.

- **[AUSENTE]** listar usuários;
- **[AUSENTE]** convidar/criar;
- **[AUSENTE]** editar e ativar/desativar;
- **[AUSENTE]** atribuir função/permissão;
- **[IMPLEMENTADO, SEM TESTE DE PAPÉIS]** middleware de permissão no backend para rotas existentes;
- **[AUSENTE]** testes usando OWNER, ADMIN, SECRETARY e VIEWER reais.

### Auditoria

Estado da página: **[IMPLEMENTADO, SEM E2E]**.

- **[IMPLEMENTADO E TESTADO]** rota exige sessão autorizada;
- **[IMPLEMENTADO E TESTADO]** registra mutações centrais de paciente/consulta e webhook;
- **[IMPLEMENTADO, SEM E2E]** listagem dos cem eventos mais recentes;
- **[AUSENTE]** ator, IP e metadados de requisição no registro;
- **[AUSENTE]** auditoria de mensagem enviada e takeover/release;
- **[AUSENTE]** busca, filtros, detalhe, paginação e exportação;
- **[AUSENTE]** teste de navegador.

### Configurações

Estado da página: **[AUSENTE]**.

- **[IMPLEMENTADO, NÃO EXPOSTO]** tabela `clinic_settings` e seed local;
- **[AUSENTE]** GET/PATCH de configurações;
- **[AUSENTE]** formulário funcional;
- **[AUSENTE]** persistência comprovada após refresh/reinício;
- **[AUSENTE]** autorização e testes.

## Endpoints inventariados

### Sessão, health e webhook

| Método e rota | Estado |
|---|---|
| `POST /api/auth/dev-session` | **[IMPLEMENTADO E TESTADO]**, exclusivamente local/desenvolvimento |
| `GET /api/auth/me` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `GET /api/health` | **[EM IMPLEMENTAÇÃO NESTA RODADA]** — ainda declara `local-json` apesar de SQLite |
| `POST /api/webhooks/sandbox` | **[IMPLEMENTADO E TESTADO]** |

### Consultas e agenda

| Método e rota | Estado |
|---|---|
| `GET /api/appointments` | **[IMPLEMENTADO E TESTADO]**; aceita `date`, `doctor`, `status` e `q` |
| `POST /api/appointments` | **[IMPLEMENTADO E TESTADO]** |
| `GET /api/appointments/:id` | **[IMPLEMENTADO E TESTADO]** |
| `PATCH /api/appointments/:id` | **[IMPLEMENTADO E TESTADO]** |
| `POST /api/appointments/:id/confirm` | **[IMPLEMENTADO E TESTADO]** |
| `POST /api/appointments/:id/reschedule` | **[IMPLEMENTADO E TESTADO]** |
| `POST /api/appointments/:id/cancel` | **[IMPLEMENTADO E TESTADO]** |
| `GET /api/slots` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |

### Pacientes

| Método e rota | Estado |
|---|---|
| `GET /api/patients` | **[IMPLEMENTADO E TESTADO]**; busca e paginação |
| `POST /api/patients` | **[IMPLEMENTADO E TESTADO]** |
| `GET /api/patients/:id` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `PATCH /api/patients/:id` | **[IMPLEMENTADO E TESTADO]** |
| `POST /api/patients/:id/archive` | **[IMPLEMENTADO E TESTADO]** |

### Conversas

| Método e rota | Estado |
|---|---|
| `GET /api/conversations` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `GET /api/conversations/:id` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `POST /api/conversations/:id/messages` | **[IMPLEMENTADO, SEM TESTE DEDICADO]**; gravação local, não WhatsApp |
| `POST /api/conversations/:id/incoming` | **[IMPLEMENTADO E TESTADO]**; sandbox |
| `POST /api/conversations/:id/takeover` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `POST /api/conversations/:id/release` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |

### Leitura operacional, automações e integrações

| Método e rota | Estado |
|---|---|
| `GET /api/dashboard` | **[EM IMPLEMENTAÇÃO NESTA RODADA]** |
| `GET /api/pending` | **[IMPLEMENTADO E TESTADO]** quanto ao formato básico |
| `GET /api/reports` | **[EM IMPLEMENTAÇÃO NESTA RODADA]** |
| `GET /api/audit-logs` | **[IMPLEMENTADO E TESTADO]** |
| `GET /api/automation-rules` | **[IMPLEMENTADO E TESTADO]** quanto ao formato básico |
| `PATCH /api/automation-rules/:id` | **[IMPLEMENTADO, SEM TESTE DEDICADO]** |
| `GET /api/integrations` | **[IMPLEMENTADO E TESTADO]** quanto ao status sandbox |

Não existem endpoints de login/logout real, profissionais, unidades, configurações, equipe, jobs de automação, execuções, teste de integração, nova conversa, resolução de conversa ou nota interna.

## Entidades SQLite

| Tabela | Uso atual | Limite |
|---|---|---|
| `schema_migrations` | **[IMPLEMENTADO E TESTADO]** | Há somente migration inicial. |
| `tenants` | **[IMPLEMENTADO, PARCIAL]** | O servidor trabalha com tenant constante. |
| `users` | **[IMPLEMENTADO, PARCIAL]** | Existe apenas owner local no fluxo normal. |
| `sessions` | **[IMPLEMENTADO E TESTADO]** | Sessão de desenvolvimento, sem login/logout real. |
| `patients` | **[IMPLEMENTADO E TESTADO]** | Falta restauração e perfil completo. |
| `appointments` | **[IMPLEMENTADO E TESTADO]** | Profissional e unidade não têm FK própria. |
| `conversations` | **[IMPLEMENTADO, SEM E2E]** | Falta ciclo completo e provedor real. |
| `messages` | **[IMPLEMENTADO, SEM E2E]** | Falta outbox e status de entrega. |
| `automation_rules` | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | Não existe motor/executor. |
| `integrations` | **[EM IMPLEMENTAÇÃO NESTA RODADA]** | `config_json` não é cofre de segredos. |
| `clinic_settings` | **[IMPLEMENTADO, NÃO EXPOSTO]** | Sem API/UI. |
| `audit_logs` | **[IMPLEMENTADO E TESTADO]** | Cobertura e metadados incompletos. |
| `webhook_events` | **[IMPLEMENTADO E TESTADO]** | Somente sandbox. |
| `idempotency` | **[IMPLEMENTADO E TESTADO]** | Chaves não possuem expiração nem escopo explícito por rota/tenant. |

Entidades necessárias e ainda ausentes:

- `professionals`;
- `units`;
- `automation_jobs`;
- `automation_executions`/tentativas;
- `message_outbox`;
- `message_delivery_events`;
- armazenamento seguro/referência de segredos de integração;
- convites e, se necessário, permissões persistidas.

## Riscos e limites técnicos

1. **Armazenamento:** o adapter atual lê todo o banco para objetos e apaga/reinsere todas as tabelas a cada escrita. Mesmo com transação SQLite, isso não é adequado para volume ou concorrência empresarial.
2. **Processos antigos:** durante a auditoria havia múltiplas instâncias nas portas 3000, 3001 e 3003 iniciadas antes da migração. Frontend novo com processo backend antigo pode quebrar contratos. O aceite exige uma única instância reiniciada com o código atual.
3. **Runtime:** o projeto declara Node 20, mas usa `node:sqlite`. Até alinhar `engines` e documentação, usar a versão Node 24 validada no ambiente.
4. **Autenticação:** `dev-session` autentica automaticamente o owner local; não é autenticação de produção.
5. **RBAC:** há guards no backend, mas os testes usam somente owner; a matriz de papéis não está comprovada.
6. **Multi-tenant:** `TENANT_ID` é constante em vários pontos. Não considerar multi-tenant pronto.
7. **Concorrência:** versão é obrigatória no PATCH, mas nas ações POST ela só é verificada quando o payload envia inteiro; clientes podem omitir a proteção.
8. **Idempotência:** armazenamento cresce sem expiração e a chave não é explicitamente vinculada ao método/rota/payload.
9. **Auditoria:** não registra ator e não cobre todas as operações sensíveis.
10. **Dados de desenvolvimento:** seeds são aceitáveis apenas em ambiente explicitamente identificado como desenvolvimento/sandbox; nunca como operação real.
11. **Frontend:** não há suite E2E. Testes de API passando não comprovam que os 52 botões estáticos e os controles dinâmicos funcionam.
12. **Mobile:** a Agenda usa duas colunas fixas e CSS que oculta a segunda; o filtro de Rafael precisa de teste/correção em viewport móvel.
13. **Integrações:** não há cofre de segredos, teste de conexão, outbox, retry ou recibo de entrega.
14. **IA:** a classificação atual é determinística por palavras-chave; não deve ser apresentada como IA clínica ampla ou aconselhamento médico.

## Proibições de simulação enganosa

Até existir evidência real, a aplicação não deve mostrar:

- WhatsApp ou Doctoralia como **Conectado**;
- mensagem como **enviada**, **entregue** ou **lida** apenas porque foi salva no SQLite;
- indicadores de latência, volume ou entrega inventados;
- fila/automação/IA como saudável sem health check real;
- contagem de execuções sem registro em `automation_executions`;
- taxa de resolução da IA fixa;
- badges de menu fixos;
- “todos os sistemas operacionais” sem monitoramento;
- agenda “sincronizada com fonte oficial” quando estiver em sandbox;
- dados de seed como se fossem produção;
- botões visíveis com handler vazio ou sem ação coerente.

O estado visual correto, na ausência de integração, é `SANDBOX`, `DESCONECTADO`, `NÃO CONFIGURADO` ou `INDISPONÍVEL`, acompanhado de explicação clara.

## Checklist de aceite

Uma funcionalidade só pode mudar para **IMPLEMENTADO E TESTADO** quando todos os itens aplicáveis estiverem marcados.

### Gate geral

- [x] API valida sessão para rotas de domínio atuais.
- [x] SQLite e migration inicial existem.
- [x] Validação backend existe nos fluxos de paciente e consulta.
- [x] Operações centrais criam auditoria.
- [ ] Há somente um servidor executando o snapshot atual.
- [ ] Loading, vazio e erro substituem todos os mocks pré-renderizados.
- [ ] Nenhum botão visível é no-op.
- [ ] Todos os dados salvos sobrevivem a refresh e reinício em teste automatizado.
- [ ] Há teste E2E mobile e desktop.
- [ ] Há teste de backend offline, banco indisponível e falha de integração.

### Pacientes

- [x] API de criar, buscar, editar e arquivar passa nos testes.
- [x] Busca e paginação estão conectadas ao banco.
- [ ] Perfil completo foi implementado.
- [ ] Modal de consulta seleciona paciente por ID.
- [ ] E2E comprova persistência após refresh e reinício.

### Agenda

- [x] Criar, editar, confirmar, remarcar e cancelar passam nos testes de API.
- [x] Conflito, versão e idempotência possuem cobertura básica.
- [ ] Busca e filtros de status/unidade funcionam na interface.
- [ ] Profissionais e unidades vêm do banco.
- [ ] E2E comprova o ciclo completo e a atualização visual.

### Conversas

- [x] Histórico e mensagens locais persistem no banco.
- [x] Entrada sandbox classifica intenção em teste.
- [ ] Busca, abas, nova conversa, encerrar e nota interna funcionam.
- [ ] Painel de detalhes é dinâmico.
- [ ] Outbox e status de entrega existem.
- [ ] A interface diferencia claramente sandbox de WhatsApp real.
- [ ] E2E cobre takeover/release, mensagem e resolução.

### Automações

- [x] Regra pode ser ligada/desligada e persistida no código atual.
- [ ] CRUD completo passa em testes.
- [ ] Consulta elegível gera job.
- [ ] Worker processa, tenta enviar e registra resultado.
- [ ] Retry/falha são rastreáveis.
- [ ] Histórico aparece na UI.

### Integrações

- [x] Webhook sandbox assinado e deduplicado passa no teste.
- [ ] Credenciais são guardadas por mecanismo seguro.
- [ ] Testar conexão chama o serviço real.
- [ ] Status exibido vem do último teste/sincronização real.
- [ ] WhatsApp real passa por envio, webhook e recibos de status.
- [ ] Doctoralia real passa por sincronização autorizada.

### Segurança, equipe e configurações

- [ ] Login/logout de produção existe.
- [ ] OWNER, ADMIN, SECRETARY e VIEWER possuem testes de autorização.
- [ ] Equipe possui CRUD e convite.
- [ ] Configurações possuem GET/PATCH e persistência testada.
- [ ] Segredos não aparecem em resposta, log, HTML ou banco em texto puro.

## Comandos de validação

Use uma versão de Node compatível com `node:sqlite`; Node 24 é a versão validada neste ambiente.

```powershell
node --version
npm run check
npm test
```

Resultado observado no snapshot imediatamente anterior a esta documentação:

```text
npm run check: PASS
npm test: 9 testes, 9 PASS, 0 FAIL
```

Os testes criam um banco SQLite temporário. Para teste manual, reinicie uma única instância atual:

```powershell
npm start
```

Depois valide no navegador:

1. cadastrar, buscar, editar e arquivar um paciente;
2. criar, abrir, editar, confirmar, remarcar e cancelar uma consulta;
3. atualizar a página e confirmar persistência;
4. reiniciar o servidor e confirmar persistência;
5. repetir os fluxos em desktop e celular;
6. desligar o backend e confirmar que a UI mostra erro, não dados fictícios.

## Definição de encerramento da auditoria

Esta auditoria somente poderá ser marcada como concluída para produção quando:

- todos os controles visíveis tiverem função coerente;
- todos os módulos exibidos possuírem persistência e autorização reais;
- nenhum estado de integração for inventado;
- WhatsApp/Doctoralia forem validados com credenciais oficiais ou permanecerem explicitamente indisponíveis/sandbox;
- automações possuírem job, execução e histórico;
- testes unitários, de integração, reinício e E2E passarem;
- riscos de concorrência, segredos, login e multi-tenant forem resolvidos.

