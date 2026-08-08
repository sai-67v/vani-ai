import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const identity = searchParams.get("identity") || `demo-${Date.now()}`;

        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const apiKey = (process.env.TWILIO_API_KEY_SID || process.env.TWILIO_API_KEY)?.trim();
        const apiSecret = (process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_API_SECRET)?.trim();
        const appSid = process.env.TWILIO_TWIML_APP_SID?.trim();

        if (!accountSid || !apiKey || !apiSecret || !appSid) {
            const missing = [
                !accountSid && "TWILIO_ACCOUNT_SID",
                !apiKey && "TWILIO_API_KEY",
                !apiSecret && "TWILIO_API_SECRET",
                !appSid && "TWILIO_TWIML_APP_SID",
            ].filter(Boolean);

            console.error(JSON.stringify({
                level: "error",
                module: "api/twilio/token",
                message: "Missing Twilio environmental variables",
                missing,
                error: "missing_env"
            }));

            return NextResponse.json({ error: "missing_env", missing }, { status: 500 });
        }

        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const token = new AccessToken(accountSid, apiKey, apiSecret, {
            identity,
            ttl: 3600,
        });

        const grant = new VoiceGrant({
            outgoingApplicationSid: appSid,
            incomingAllow: true,
        });

        token.addGrant(grant);

        console.info(JSON.stringify({
            level: "info",
            module: "api/twilio/token",
            message: "Successfully generated Twilio token",
            identity
        }));

        return NextResponse.json({ token: token.toJwt() });
    } catch (error) {
        console.error(JSON.stringify({
            level: "error",
            module: "api/twilio/token",
            message: "Failed to generate Twilio token",
            error: error instanceof Error ? error.message : String(error)
        }));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
