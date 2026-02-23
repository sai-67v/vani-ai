# Fallback "Recorded Transcript" Demo Pack

> **Purpose**: Pre-recorded transcript to demo the system when a live voice call cannot be made.  
> **Use**: Paste into the dashboard's transcript viewer, or read aloud in a screen recording.  
> **Scenario**: Inbound call — pricing FAQ → qualified as 🔴 Hot → callback booked.

---

## Call Metadata

| Field | Value |
|---|---|
| Call ID | `demo-call-001` |
| Direction | Inbound |
| Caller | Rajesh Kumar |
| Agent | Ava (AI) |
| Start Time | 2026-02-23 10:30:00 IST |
| End Time | 2026-02-23 10:32:14 IST |
| Duration | 2 min 14 sec |
| Language | English |
| Qualification | 🔴 Hot |
| Outcome | Callback booked — 24 Feb 11:00 AM |

---

## Transcript

```
[00:00] AGENT: Hi! Thanks for calling VoiceFlow Solutions. I'm Ava — how can I help you today?

[00:04] CALLER: Hi Ava, this is Rajesh from TechNova. I wanted to understand your pricing.

[00:09] AGENT: Hi Rajesh! Great to hear from you. We have three plans — Starter at ₹4,999 per month, Growth at ₹14,999, and Enterprise with custom pricing. All include a free 14-day trial. What kind of call volume are you looking at?

[00:22] CALLER: We do about 1,800 calls a month. Mostly customer support.

[00:26] AGENT: Got it — the Growth plan would be a great fit. It includes 2,000 minutes, CRM integration, and priority support. Would you like to know more about the features?

[00:34] CALLER: Actually, what CRM integrations do you support?

[00:37] AGENT: We integrate with Salesforce, HubSpot, Zoho, and Freshsales out of the box. Custom integrations are also available. Are you using any of those?

[00:44] CALLER: Yes, we're on Salesforce. That's good to hear.

[00:47] AGENT: Perfect — it'll be a smooth setup then. Rajesh, just so I can help you better — are you looking to get started within the next 30 days?

[00:55] CALLER: Yes, actually. Our current IVR contract ends this month, so we need something in place soon.

[01:01] AGENT: That's great timing. And do you already have a budget set aside for a voice solution?

[01:06] CALLER: Yes, we've got approval. We just need to pick the right vendor.

[01:10] AGENT: Wonderful — it sounds like we can really help you right away. I'd love to connect you with a product specialist who can walk you through the Salesforce integration and get you onboarded. Would tomorrow at 11 AM work for a quick call?

[01:22] CALLER: Tomorrow at 11 works. Can you send a calendar invite?

[01:25] AGENT: Absolutely — I'll send that right over to your email. Is rajesh@technova.in correct?

[01:30] CALLER: Yes, that's right.

[01:31] AGENT: Done! You'll get the invite in a moment. Is there anything else I can help with today?

[01:36] CALLER: No, that's everything. Thanks, Ava!

[01:38] AGENT: Thank you, Rajesh! Have a great day — talk to you soon!

[01:41] — CALL ENDED —
```

---

## Extracted Data (for dashboard mock)

```json
{
  "call_id": "demo-call-001",
  "provider_call_id": "vapi_demo_abc123",
  "direction": "inbound",
  "status": "completed",
  "caller_name": "Rajesh Kumar",
  "caller_company": "TechNova",
  "caller_email": "rajesh@technova.in",
  "agent_name": "Ava",
  "start_time": "2026-02-23T10:30:00+05:30",
  "end_time": "2026-02-23T10:32:14+05:30",
  "duration_seconds": 134,
  "language": "en",
  "qualification": {
    "timeline": "within_30_days",
    "budget": "approved",
    "score": "hot"
  },
  "outcome": "callback_booked",
  "callback": {
    "scheduled_at": "2026-02-24T11:00:00+05:30",
    "specialist": "Product Team",
    "notes": "Salesforce integration walkthrough. Current IVR expiring this month."
  },
  "faqs_asked": [
    "pricing_plans",
    "crm_integration"
  ],
  "transcript_segments": [
    {"time": "00:00", "speaker": "agent", "text": "Hi! Thanks for calling VoiceFlow Solutions. I'm Ava — how can I help you today?"},
    {"time": "00:04", "speaker": "caller", "text": "Hi Ava, this is Rajesh from TechNova. I wanted to understand your pricing."},
    {"time": "00:09", "speaker": "agent", "text": "Hi Rajesh! Great to hear from you. We have three plans — Starter at ₹4,999 per month, Growth at ₹14,999, and Enterprise with custom pricing. All include a free 14-day trial. What kind of call volume are you looking at?"},
    {"time": "00:22", "speaker": "caller", "text": "We do about 1,800 calls a month. Mostly customer support."},
    {"time": "00:26", "speaker": "agent", "text": "Got it — the Growth plan would be a great fit. It includes 2,000 minutes, CRM integration, and priority support. Would you like to know more about the features?"},
    {"time": "00:34", "speaker": "caller", "text": "Actually, what CRM integrations do you support?"},
    {"time": "00:37", "speaker": "agent", "text": "We integrate with Salesforce, HubSpot, Zoho, and Freshsales out of the box. Custom integrations are also available. Are you using any of those?"},
    {"time": "00:44", "speaker": "caller", "text": "Yes, we're on Salesforce. That's good to hear."},
    {"time": "00:47", "speaker": "agent", "text": "Perfect — it'll be a smooth setup then. Rajesh, just so I can help you better — are you looking to get started within the next 30 days?"},
    {"time": "00:55", "speaker": "caller", "text": "Yes, actually. Our current IVR contract ends this month, so we need something in place soon."},
    {"time": "01:01", "speaker": "agent", "text": "That's great timing. And do you already have a budget set aside for a voice solution?"},
    {"time": "01:06", "speaker": "caller", "text": "Yes, we've got approval. We just need to pick the right vendor."},
    {"time": "01:10", "speaker": "agent", "text": "Wonderful — it sounds like we can really help you right away. I'd love to connect you with a product specialist who can walk you through the Salesforce integration and get you onboarded. Would tomorrow at 11 AM work for a quick call?"},
    {"time": "01:22", "speaker": "caller", "text": "Tomorrow at 11 works. Can you send a calendar invite?"},
    {"time": "01:25", "speaker": "agent", "text": "Absolutely — I'll send that right over to your email. Is rajesh@technova.in correct?"},
    {"time": "01:30", "speaker": "caller", "text": "Yes, that's right."},
    {"time": "01:31", "speaker": "agent", "text": "Done! You'll get the invite in a moment. Is there anything else I can help with today?"},
    {"time": "01:36", "speaker": "caller", "text": "No, that's everything. Thanks, Ava!"},
    {"time": "01:38", "speaker": "agent", "text": "Thank you, Rajesh! Have a great day — talk to you soon!"}
  ]
}
```

---

## How to use this demo pack

1. **Dashboard demo** — Import the JSON above as a mock call record. The transcript viewer should render each segment with timestamps and speaker labels.
2. **Screen recording** — Read the transcript aloud (two people) while screen-recording the dashboard to create a realistic demo video.
3. **Vapi test mode** — Use `provider_call_id: "vapi_demo_abc123"` as a test payload to exercise your webhook pipeline end-to-end.
4. **Investor pitch** — Show the transcript alongside the KPI cards (call duration, qualification score, callback status) to demonstrate the full product loop.
