import { buildVoiceTwiml, xmlResponse } from "@/lib/server/twilio";

export async function POST(request: Request) {
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!baseUrl) {
        const fallback = "Voice demo is unavailable right now.";
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${fallback}</Say>
  <Hangup />
</Response>`;
        return xmlResponse(twiml);
    }

    const url = new URL(request.url);
    const turnParam = Number.parseInt(url.searchParams.get("turn") ?? "0", 10);
    const turn = Number.isFinite(turnParam) && turnParam >= 0 ? turnParam : 0;
    const actionUrl = `${baseUrl}/api/twilio/processTurn?turn=${turn}`;
    const greeting = "You are connected to Vani AI. Please speak after the tone.";
    const twiml = buildVoiceTwiml(actionUrl, greeting);
    return xmlResponse(twiml);
}

export const runtime = "nodejs";
