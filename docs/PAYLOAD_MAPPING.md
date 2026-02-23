# Vapi Webhook Payload Mapping

How Vapi server-message fields map to our Supabase tables.

---

## Payload Envelope

Every Vapi webhook POST sends:

```json
{
  "message": {
    "type": "<event-type>",
    "call": { "id": "...", "status": "...", ... },
    ...event-specific fields
  }
}
```

---

## 1. `status-update`

Fires on every call state change: `queued → ringing → in-progress → forwarding → ended`.

### Sample Payload

```json
{
  "message": {
    "type": "status-update",
    "status": "in-progress",
    "call": {
      "id": "call_01abc123-def4-5678-9012-abcdef345678",
      "orgId": "org_xxx",
      "assistantId": "asst_xxx",
      "status": "in-progress",
      "customer": {
        "number": "+14155551234"
      },
      "createdAt": "2026-02-23T05:30:00.000Z",
      "updatedAt": "2026-02-23T05:30:05.000Z",
      "type": "webCall"
    },
    "timestamp": 1740282605.123
  }
}
```

### Field Mapping → `calls` table

| Vapi Field | DB Column | Notes |
|---|---|---|
| `message.call.id` | `provider_call_id` | UNIQUE, used for upsert |
| `message.call.assistantId` | `assistant_id` | |
| `message.call.customer.number` | `customer_number` | null for web calls |
| `message.call.status` | `status` | queued / ringing / in-progress / ended |
| _(derived)_ | `started_at` | Set to NOW() when status = `in-progress` |

---

## 2. `transcript` (final)

Fires for each speech segment. We only store `transcriptType: "final"` (skip partials).

### Sample Payload

```json
{
  "message": {
    "type": "transcript",
    "role": "user",
    "transcriptType": "final",
    "transcript": "I'd like to schedule a demo for next week",
    "timestamp": 1740282610.456,
    "call": {
      "id": "call_01abc123-def4-5678-9012-abcdef345678"
    }
  }
}
```

### Field Mapping → `transcripts` table

| Vapi Field | DB Column | Notes |
|---|---|---|
| _(looked up via call.id)_ | `call_id` | FK to calls.id |
| `message.role` | `speaker` | `"user"` or `"assistant"` |
| `message.transcript` | `text` | |
| `message.timestamp` | `ts` | Unix epoch → ISO timestamptz |

---

## 3. `function-call` → `callback_requested`

Fires when the voice agent invokes a tool. We handle `callback_requested` specifically.

### Sample Payload

```json
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "callback_requested",
      "parameters": {
        "reason": "Customer wants pricing details for enterprise plan",
        "priority": "high",
        "customer_number": "+14155551234"
      }
    },
    "call": {
      "id": "call_01abc123-def4-5678-9012-abcdef345678"
    },
    "timestamp": 1740282620.789
  }
}
```

### Field Mapping → `callback_queue` table

| Vapi Field | DB Column | Notes |
|---|---|---|
| _(looked up via call.id)_ | `call_id` | FK to calls.id |
| `functionCall.parameters.customer_number` | `customer_number` | Falls back to calls.customer_number |
| `functionCall.parameters.reason` | `reason` | |
| `functionCall.parameters.priority` | `priority` | low / normal / high / urgent |
| _(default)_ | `status` | Always `"pending"` on insert |

### Side Effects on `calls` table

| DB Column | Value |
|---|---|
| `outcome` | `"callback"` |
| `lead_score` | 0–100, heuristic based on reason keywords |

### Response to Vapi

```json
{
  "result": {
    "success": true,
    "message": "Callback has been scheduled. A team member will call you back shortly."
  }
}
```

---

## 4. `end-of-call-report`

Fires once after the call ends. Contains full conversation summary, cost, duration.

### Sample Payload

```json
{
  "message": {
    "type": "end-of-call-report",
    "endedReason": "customer-ended-call",
    "summary": "Customer inquired about enterprise pricing and requested a callback from sales.",
    "transcript": "...(full transcript text)...",
    "cost": 0.0423,
    "durationSeconds": 127,
    "analysis": {
      "summary": "The caller asked about enterprise pricing...",
      "successEvaluation": "true"
    },
    "call": {
      "id": "call_01abc123-def4-5678-9012-abcdef345678",
      "endedAt": "2026-02-23T05:32:07.000Z",
      "status": "ended"
    },
    "artifact": {
      "messages": [
        { "role": "assistant", "content": "Hello! Welcome to..." },
        { "role": "user", "content": "Hi, I want to know about pricing" }
      ]
    },
    "timestamp": 1740282727.000
  }
}
```

### Field Mapping → `calls` table (UPDATE)

| Vapi Field | DB Column | Notes |
|---|---|---|
| `message.call.endedAt` | `ended_at` | |
| `message.summary` or `message.analysis.summary` | `summary` | Preference order |
| `message.cost` | `cost` | USD |
| `message.durationSeconds` | `duration_seconds` | |
| _(full message object)_ | `raw_end_report` | JSONB, for debugging |
| `"ended"` | `status` | Always set to ended |
| `message.endedReason` | `outcome` | Only if not already set (e.g., "callback") |

---

## Lead Score Heuristic

| Signal | Points |
|---|---|
| Baseline | 50 |
| Reason contains "pricing" / "demo" / "buy" | +30 |
| Reason contains "urgent" / "asap" | +15 |
| Priority is "high" or "urgent" | +10 |
| **Max** | **100** |
