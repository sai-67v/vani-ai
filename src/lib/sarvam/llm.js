const { SarvamAIClient } = require("sarvamai");

/**
 * Calls Sarvam LLM to generate a structured JSON response.
 * @param {string} userText - The text from the user (from STT)
 * @returns {Promise<{replyText: string, leadScore: number, emotionScore: number, intent: string, summary: string}>}
 */
async function generateResponse(userText) {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) throw new Error("SARVAM_API_KEY is not set in environment");

    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

    const systemPrompt = `You are a helpful Voice AI agent. The user is on a phone call.
Keep your answer short and natural. 
Output your response STRICTLY as a JSON object with this shape, and NO formatting markdown blocks:
{
  "replyText": "your spoken reply here",
  "leadScore": 5, // (1-10)
  "emotionScore": 1, // (-1 to 1) 
  "intent": "question", // or "booking", "complaint", "greeting"
  "summary": "User asked about X"
}`;

    const response = await client.chat.completions.create({
        model: "sarvam-1",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ],
        temperature: 0.1
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";
    let parsedData = {};

    try {
        // Handle optional markdown json wrapping
        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanContent);
    } catch (err) {
        console.error("[Sarvam LLM] Failed to parse JSON. Raw Output:", rawContent);
        parsedData = {
            replyText: "I'm sorry, I encountered an error processing that.",
            leadScore: 5,
            emotionScore: 0,
            intent: "unknown",
            summary: "Error parsing LLM response"
        };
    }

    return parsedData;
}

module.exports = {
    generateResponse
};
