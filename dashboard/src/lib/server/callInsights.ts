import { SarvamAIClient } from "sarvamai";

const SARVAM_PROMPT = `You are a helpful Voice AI agent analyzing a phone call.
Keep your output short, structured, and strictly JSON with these keys:
{
  "replyText": "your spoken reply (empty string if not applicable)",
  "leadScore": 50,
  "emotion": "neutral",
  "intent": "unknown",
  "nextBestAction": "Schedule a follow-up",
  "summary": "One-sentence recap"
}`;

const sarvamKey = process.env.SARVAM_API_KEY;

function buildClient() {
    if (!sarvamKey) return null;
    return new SarvamAIClient({ apiSubscriptionKey: sarvamKey });
}

export interface CallInsightResult {
    replyText: string;
    leadScore: number;
    emotion: string;
    intent: string;
    nextBestAction: string | null;
    summary: string | null;
}

function sanitizeLeadScore(value: unknown) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 50;
    return Math.min(100, Math.max(0, Math.round(parsed)));
}

function normalizeString(value: unknown, fallback: string) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
}

function parseJson(content: string): Record<string, unknown> {
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("[callInsights] Failed to parse Sarvam output:", err, "raw:", content);
        return {};
    }
}

export async function analyzeCallInsights(text: string): Promise<CallInsightResult> {
    const client = buildClient();
    if (!client) {
        console.warn("[callInsights] SARVAM_API_KEY missing, skipping analysis");
        return {
            replyText: "",
            leadScore: 50,
            emotion: "neutral",
            intent: "unknown",
            nextBestAction: "",
            summary: null,
        };
    }

    const trimmedText = (text || "").trim();
    if (!trimmedText) {
        return {
            replyText: "",
            leadScore: 50,
            emotion: "neutral",
            intent: "unknown",
            nextBestAction: "",
            summary: null,
        };
    }

    try {
        const chat: any = client.chat.completions;
        const response = typeof chat.create === "function"
            ? await chat.create({
                model: "sarvam-1",
                messages: [
                    { role: "system", content: SARVAM_PROMPT },
                    { role: "user", content: trimmedText },
                ],
                temperature: 0.1,
            })
            : await chat({
                model: "sarvam-1",
                messages: [
                    { role: "system", content: SARVAM_PROMPT },
                    { role: "user", content: trimmedText },
                ],
                temperature: 0.1,
            });

        const raw = response.choices?.[0]?.message?.content ?? "{}";
        const parsed = parseJson(raw);

        return {
            replyText: normalizeString(parsed.replyText, ""),
            leadScore: sanitizeLeadScore(parsed.leadScore),
            emotion: normalizeString(parsed.emotion, "neutral").toLowerCase(),
            intent: normalizeString(parsed.intent, "unknown").toLowerCase(),
            nextBestAction: normalizeString(parsed.nextBestAction, ""),
            summary: normalizeString(parsed.summary, ""),
        };
    } catch (err) {
        console.error("[callInsights] Sarvam call failed:", err);
        return {
            replyText: "",
            leadScore: 50,
            emotion: "neutral",
            intent: "unknown",
            nextBestAction: "",
            summary: null,
        };
    }
}
