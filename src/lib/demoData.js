const DEMO_TRANSCRIPT = `Caller: Hey, I saw your LinkedIn post about the autonomous voice SDR. Does it already integrate with HubSpot?
Agent: Absolutely. We can push qualified calls directly into any HubSpot pipeline in under a minute.
Caller: Huge. We have a field team in Mumbai and they want Hindi + English support.
Agent: We already do code-switching with Sarvam. I can spin up a bilingual agent for your next campaign.
Caller: Perfect. Send me pricing and a sandbox this week.`;

const DEMO_ANALYSIS = {
    ok: true,
    callId: "demo-call",
    language: "en",
    transcript: DEMO_TRANSCRIPT,
    summary:
        "Prospect requested HubSpot sync plus bilingual support for a Mumbai field team. They want pricing and a sandbox this week.",
    lead: {
        label: "HOT",
        score: 92,
    },
    emotions: ["Confident", "Curious", "Urgent"],
    faqs: [
        {
            q: "Do you integrate with HubSpot?",
            a: "Yes, we sync call summaries, lead score, and follow-up tasks directly to any HubSpot pipeline in seconds.",
            confidence: 0.94,
        },
        {
            q: "Can you handle Hindi and English in one call?",
            a: "Sarvam's multilingual pipeline lets a single agent switch between Hindi and English without latency.",
            confidence: 0.9,
        },
    ],
    keySignals: [
        "Decision timeline: sandbox requested this week",
        "Needs bilingual (Hindi + English) SDR",
        "CRM: HubSpot is mandatory integration",
    ],
};

const DEMO_CALL_META = {
    callId: "demo-call",
    direction: "wifi",
    from: "Demo Prospect",
    to: "AI Agent",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "completed",
    summary: DEMO_ANALYSIS.summary,
};

module.exports = {
    DEMO_TRANSCRIPT,
    DEMO_ANALYSIS,
    DEMO_CALL_META,
};
