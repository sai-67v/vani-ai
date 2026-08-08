import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";

const E164_PATTERN = /^\+[1-9]\d{9,14}$/;

function sanitizePhoneNumber(value: string | undefined | null) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const stripped = raw.replace(/[\s\-()]/g, "");
    if (!stripped) return "";
    if (stripped.startsWith("+")) {
        return "+" + stripped.slice(1).replace(/\+/g, "");
    }
    return stripped.replace(/\+/g, "");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const sanitizedTo = sanitizePhoneNumber(body?.to);

        if (!sanitizedTo) {
            return NextResponse.json({ ok: false, error: "Missing 'to' phone number" }, { status: 400 });
        }

        if (!E164_PATTERN.test(sanitizedTo)) {
            return NextResponse.json({ ok: false, error: "Phone number must be in E.164 format" }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return NextResponse.json({
                ok: false,
                error: "Missing environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
            }, { status: 500 });
        }

        const client = twilio(accountSid, authToken);

        // Define Webhook URL. Depending on the setup, this goes to the Twilio inbound voice handler.
        // We use PUBLIC_BASE_URL if it exists, otherwise construct from request host.
        const protocol = request.headers.get("x-forwarded-proto") ||
            (request.headers.get("host")?.includes("localhost") ? "http" : "https");
        const host = request.headers.get("host");
        const explicitBase = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
        const webhookBase = explicitBase || `${protocol}://${host}`;
        const webhookUrl = `${webhookBase}/api/twilio/voice`;

        console.log(`[TWILIO][OUTBOUND] to=${sanitizedTo} baseUrl=${webhookBase}`);

        const call = await client.calls.create({
            from: fromNumber,
            to: sanitizedTo,
            url: webhookUrl,
            method: "POST",
        });

        console.log(`[TWILIO][OUTBOUND] call initiated callSid=${call.sid}`);

        return NextResponse.json({ ok: true, callSid: call.sid });
    } catch (error: any) {
        console.error("[TWILIO][OUTBOUND][ERR]", error?.stack || error);
        return NextResponse.json({
            ok: false,
            error: error?.message || "Unable to initiate outbound call"
        }, { status: 500 });
    }
}
