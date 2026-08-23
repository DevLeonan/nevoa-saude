# Integrações

## Contrato de agenda

Cada conector de produção deve expor operações equivalentes a `getDoctors`, `getPatients`, `getAppointments`, `getAvailableSlots`, `createAppointment`, `updateAppointment`, `cancelAppointment` e `confirmAppointment`. O domínio interno nunca depende de um fornecedor específico.

## Webhook sandbox local

`POST /api/webhooks/sandbox` aceita eventos de agenda em ambiente de desenvolvimento. O endpoint valida HMAC SHA-256, timestamp de no máximo cinco minutos, limite de payload, schema, idempotência pelo evento e eventos fora de ordem por `updatedAt`.

Cabeçalhos obrigatórios:

```text
x-nevoa-event-id: event_12345678
x-nevoa-timestamp: 2026-08-23T15:00:00.000Z
x-nevoa-signature: <hex hmac sha256 de "timestamp.body">
```

O segredo é lido exclusivamente de `NEVOA_WEBHOOK_SECRET`. Ele não deve ser registrado em código, logs ou controle de versão.

Payload de exemplo:

```json
{
  "type": "appointment.created",
  "appointment": {
    "externalId": "agenda-482",
    "patient": "Maria Silva",
    "doctor": "Dra. Camila Mendes",
    "date": "2026-08-26",
    "start": "14:00",
    "duration": 45,
    "status": "scheduled",
    "updatedAt": "2026-08-23T15:00:00.000Z"
  }
}
```

Em produção, o endpoint será específico por provedor, terá credenciais no secret manager, validação do schema do fornecedor e uma fila persistente entre a recepção e o processamento.
