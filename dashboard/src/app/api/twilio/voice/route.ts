import { NextResponse } from "next/server";
import { buildVoiceTwiml, xmlResponse } from "@/lib/server/twilio";

export async function POST(request: Request) {
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    const actionUrl = `${baseUrl}/api/twilio/processTurn`;
    const greeting = "You are connected to Vani AI. Please speak after the tone.";
    const twiml = buildVoiceTwiml(actionUrl, greeting);
    return xmlResponse(twiml);
}

export const runtime = "nodejs";
