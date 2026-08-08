# ✦ Vaani AI: The Future of Voice Interaction ✦

**Vaani AI** is a production-grade Voice AI platform built for the next generation of customer interaction. It automates inbound and outbound calls with human-like conversational agents that understand context, emotion, and intent.

![Premium Dashboard](https://via.placeholder.com/800x400?text=Vaani+AI+Dashboard+Preview)

## 🚀 Key Features

-   **Human-Like Voice AI**: Low-latency, ultra-realistic voice conversations powered by Sarvam AI and Twilio.
-   **Real-Time Analytics**: Live dashboard with glassmorphism UI to track calls, KPIs, and lead quality.
-   **Emotion & Intent Sensing**: Dynamically detects caller frustration, hesitation, or urgency.
-   **Lead Scoring Pipeline**: Automatically scores leads based on conversation content and syncs to your CRM.
-   **Live Transcripts**: Real-time streaming transcripts with autoscroll for complete visibility.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion, Lucide Icons.
-   **Backend**: Node.js, Express, WebSockets (ws), Twilio SDK.
-   **AI Infrastructure**: Sarvam AI (STT/TTS/LLM), Vapi (optional integration).
-   **Database/Storage**: Supabase (Auth, DB, Real-time).

## 📦 Repository Structure

```text
.
├── dashboard/          # Next.js Analytics Dashboard
├── src/                # Express Backend & Voice Engine
│   ├── lib/            # Shared libraries (Sarvam, Twilio)
│   ├── routes/         # API & Webhook endpoints
│   └── index.js        # Server entry point
├── docs/               # Technical documentation
└── .env.example        # Environment variable template
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Supabase Account
- Twilio Account (with a voice-enabled number)
- Sarvam AI API Key

### 2. Backend Setup
1. Clone the repo.
2. Run `npm install` in the root directory.
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Run `npm run dev` to start the Voice Engine on port `3000`.

### 3. Dashboard Setup
1. Navigate to the `dashboard/` directory.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Run `npm run dev` to start the Dashboard on port `3002`.

## 🧑‍⚖️ Judge Demo Checklist

For the best experience during a demo, follow our [Judge Demo Checklist](./JUDGE_DEMO_CHECKLIST.md) to showcase core features like "Demo Mode" and Real-time Analytics.

---
Built with ❤️ for the Hackathon.