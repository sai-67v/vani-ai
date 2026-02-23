# Lead Qualification — Questions & Rubric

---

## Qualifying Questions

The agent asks these **two** questions naturally during conversation, after answering at least one FAQ.

### Q1 · Timeline

> **English**: "Just so I can help you better — are you looking to get started within the next 30 days, or is this more of a future exploration?"  
> **Tamil**: "உங்களுக்கு சரியாக உதவ — அடுத்த 30 நாட்களில் தொடங்க விரும்புகிறீர்களா, அல்லது எதிர்காலத்திற்காக ஆராய்கிறீர்களா?"

### Q2 · Budget / Decision Authority

> **English**: "And do you already have a budget set aside for a voice solution, or would you need approval from your team?"  
> **Tamil**: "குரல் தீர்வுக்கான பட்ஜெட் ஒதுக்கியுள்ளீர்களா, அல்லது உங்கள் குழுவிடம் ஒப்புதல் பெற வேண்டுமா?"

---

## Hot / Warm / Cold Rubric

| Score | Label | Q1 — Timeline | Q2 — Budget | Agent Action |
|:---:|:---:|---|---|---|
| 🔴 | **Hot** | Within 30 days | Budget approved / decision-maker | Offer **immediate** callback or live transfer. Tag `hot` in CRM. |
| 🟡 | **Warm** | 1–3 months | Exploring / needs approval | Schedule callback within **48 hours**. Tag `warm`. Send follow-up email. |
| 🔵 | **Cold** | No timeline / "just looking" | No budget / not decided | Thank them, send **info pack** by email. Tag `cold`. Add to nurture sequence. |

### Scoring logic (for Vapi function call / webhook)

```jsonc
{
  "qualification": {
    "timeline": "within_30_days" | "1_to_3_months" | "no_timeline",
    "budget": "approved" | "exploring" | "none",
    "score": "hot" | "warm" | "cold"
  }
}
```

**Rules**:
- If `timeline == "within_30_days"` AND `budget == "approved"` → **Hot**
- If either is mid-range (1–3 months OR exploring) → **Warm**
- If both are low → **Cold**
- If one is high and one is low → **Warm** (benefit of the doubt)

---

## Agent phrases for each outcome

### 🔴 Hot

> "That's great — it sounds like we can really help you right away. Let me connect you with a specialist, or I can book a 15-minute call at a time that works for you. What do you prefer?"

### 🟡 Warm

> "Wonderful — it sounds like this could be a great fit. Can I schedule a quick call with our team sometime this week so we can walk you through the details?"

### 🔵 Cold

> "No problem at all! I'll send you our info pack and some case studies so you can take your time. Whenever you're ready, just give us a call back."
