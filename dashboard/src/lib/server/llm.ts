import { SarvamAIClient } from "sarvamai";

const sarvamKey = process.env.SARVAM_API_KEY || "";

export type LlmResponse = {
    replyText: string;
    leadScore: "hot" | "warm" | "cold";
    emotionScore: "positive" | "neutral" | "negative";
    summary: string;
    intent: string;
};

const SYSTEM_PROMPT = `You are a concise voice agent on a live phone call.
Reply in 1-2 short sentences. Return ONLY a JSON object with this exact shape:
{
  "replyText": string,
  "leadScore": "hot" | "warm" | "cold",
  "emotionScore": "positive" | "neutral" | "negative",
  "intent": string,
  "summary": string
}`;

export async function runLlm(userText: string): Promise<LlmResponse | null> {
    if (!sarvamKey) return null;
    try {
        const client = new SarvamAIClient({ apiSubscriptionKey: sarvamKey });
        const response = await client.chat.completions({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userText || "" },
            ],
            temperature: 0.2,
        });

        const content = response?.choices?.[0]?.message?.content;
        if (!content) return null;
        const parsed = safeParseJson(content);
        if (!parsed) return null;

        return {
            replyText: normalizeString(parsed.replyText) || "Thanks for calling.",
            leadScore: normalizeLead(parsed.leadScore),
            emotionScore: normalizeEmotion(parsed.emotionScore),
            summary: normalizeString(parsed.summary) || "",
            intent: normalizeString(parsed.intent) || "",
        };
    } catch (err: any) {
        console.error("[runLlm]", err?.message || err);
        return null;
    }
}

function safeParseJson(raw: string) {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
        return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
        return null;
    }
}

function normalizeLead(value: unknown): LlmResponse["leadScore"] {
    if (value === "hot" || value === "warm" || value === "cold") return value;
    return "warm";
}

function normalizeEmotion(value: unknown): LlmResponse["emotionScore"] {
    if (value === "positive" || value === "neutral" || value === "negative") return value;
    return "neutral";
}

function normalizeString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}
