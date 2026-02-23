const LLM_ENDPOINT = process.env.LLM_ENDPOINT || "https://api.openai.com/v1/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";

export type LlmResponse = {
    replyText: string;
    lead: "hot" | "warm" | "cold";
    emotion: "positive" | "neutral" | "negative";
    summary: string;
    intent: string;
};

export async function runLlm(prompt: string): Promise<LlmResponse | null> {
    if (!LLM_API_KEY) return null;
    try {
        const res = await fetch(LLM_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a concise voice agent. Respond with a short helpful reply. Output JSON with keys replyText, lead (hot|warm|cold), emotion (positive|neutral|negative), summary, intent.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.4,
                response_format: { type: "json_object" },
            }),
        });
        if (!res.ok) throw new Error(`LLM ${res.status}`);
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) return null;
        const parsed = JSON.parse(content);
        return {
            replyText: parsed.replyText || parsed.reply || "Thanks for calling.",
            lead: parsed.lead || "warm",
            emotion: parsed.emotion || "neutral",
            summary: parsed.summary || "",
            intent: parsed.intent || "",
        };
    } catch (err: any) {
        console.error("[runLlm]", err?.message || err);
        return null;
    }
}
