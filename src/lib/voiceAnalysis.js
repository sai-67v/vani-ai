const { randomUUID } = require("crypto");
const { transcribeAudio } = require("./sarvam/stt");
const { analyzeTranscript } = require("./sarvam/llm");
const { DEMO_ANALYSIS } = require("./demoData");

const FAQ_LIBRARY = [
    {
        q: "Do you integrate with HubSpot?",
        keywords: ["hubspot", "crm"],
        a: "Yes, we sync summaries, tasks, and lead scores directly into HubSpot pipelines.",
    },
    {
        q: "Can you handle bilingual or Hindi calls?",
        keywords: ["hindi", "bilingual", "language"],
        a: "Sarvam supports real-time translation plus Hindi ↔ English switching without latency.",
    },
    {
        q: "What about pricing?",
        keywords: ["price", "pricing", "cost"],
        a: "Pricing is usage-based with startup credits for demos; book a call for a custom quote.",
    },
];

function detectLeadLabel(score) {
    const value = Number(score) || 0;
    if (value >= 80) return "HOT";
    if (value >= 60) return "WARM";
    if (value >= 40) return "COLD";
    return "NEUTRAL";
}

function buildKeySignals({ summary, intent, leadScore, faqMatches }) {
    const signals = [];
    if (summary) signals.push(summary.slice(0, 140));
    if (intent) signals.push(`Intent tagged as ${intent.toUpperCase()}`);
    if (leadScore != null) signals.push(`Lead score ${leadScore}/100 (${detectLeadLabel(leadScore)})`);
    if (faqMatches?.length) {
        const topFaq = faqMatches[0];
        signals.push(`FAQ matched: ${topFaq.q}`);
    }
    return Array.from(new Set(signals)).slice(0, 4);
}

function matchFaqs(transcript) {
    if (!transcript) return [];
    const lower = transcript.toLowerCase();
    return FAQ_LIBRARY.filter((faq) => faq.keywords.some((kw) => lower.includes(kw))).map((faq, idx) => ({
        q: faq.q,
        a: faq.a,
        confidence: Math.min(0.89, 0.75 + idx * 0.07),
    }));
}

async function downloadAudio(audioUrl) {
    if (!audioUrl) return null;
    const sanitized = audioUrl.endsWith(".wav") || audioUrl.endsWith(".mp3") ? audioUrl : `${audioUrl}.wav`;
    const headers = {};
    if (/twilio\.com\//i.test(sanitized)) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        if (sid && token) {
            headers.Authorization =
                "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
        }
    }
    const res = await fetch(sanitized, { headers });
    if (!res.ok) {
        throw new Error(`audio_fetch_failed_${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

function normalizeLanguage(lang, hint) {
    return (lang || hint || "en").toString().split("-")[0].toLowerCase();
}

function formatAnalysis(callId, transcript, language, insight, faqs) {
    const summary = insight.summary || transcript.slice(0, 220);
    const leadScore = Number(insight.leadScore ?? 55);
    const leadLabel = detectLeadLabel(leadScore);
    const emotions = insight.emotion ? [capitalize(insight.emotion)] : ["Neutral"];
    const keySignals = buildKeySignals({
        summary,
        intent: insight.intent,
        leadScore,
        faqMatches: faqs,
    });

    return {
        ok: true,
        callId,
        language: language || "en",
        transcript,
        summary,
        lead: { label: leadLabel, score: leadScore },
        emotions,
        faqs,
        keySignals,
        insight,
    };
}

function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

async function analyzeVoicePayload(payload = {}) {
    const callId = payload.callId || randomUUID();
    let transcript = (payload.transcript || "").trim();
    let language = payload.languageHint || "en";

    try {
        if (!transcript && payload.audioUrl) {
            const audioBuffer = await downloadAudio(payload.audioUrl);
            if (!audioBuffer) throw new Error("audio_unavailable");
            const sttResult = await transcribeAudio(audioBuffer, payload.languageHint || "en-IN");
            transcript = sttResult.text?.trim() || transcript;
            language = sttResult.raw?.languageCode || language;
        }

        if (!transcript) {
            throw new Error("transcript_missing");
        }

        const insight = await analyzeTranscript(transcript);
        const faqs = matchFaqs(transcript);
        return formatAnalysis(callId, transcript, normalizeLanguage(language, payload.languageHint), insight, faqs);
    } catch (error) {
        console.error("[voiceAnalysis] falling back to demo data", error.message || error);
        return {
            ...DEMO_ANALYSIS,
            callId,
        };
    }
}

module.exports = {
    analyzeVoicePayload,
};
