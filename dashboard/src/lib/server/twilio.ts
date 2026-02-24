import { NextResponse } from "next/server";

export function xmlResponse(body: string) {
    return new NextResponse(body, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
    });
}

export function buildVoiceTwiml(actionUrl: string, greeting?: string) {
    const say = greeting ? `<Say voice="Polly.Joanna">${escapeXml(greeting)}</Say>` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say}
  <Record playBeep="true" maxLength="8" trim="trim-silence" action="${actionUrl}" method="POST" />
</Response>`;
}

export function buildTurnTwiml(
    playUrl: string | null,
    redirectUrl: string | null,
    sayFallback?: string,
    hangup?: boolean
) {
    const play = playUrl ? `<Play>${escapeXml(playUrl)}</Play>` : "";
    const say = !playUrl && sayFallback ? `<Say voice="Polly.Joanna">${escapeXml(sayFallback)}</Say>` : "";
    const redirect = redirectUrl ? `<Redirect method="POST">${escapeXml(redirectUrl)}</Redirect>` : "";
    const hangupTag = hangup ? `<Hangup />` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${play || say}
  ${redirect}
  ${hangupTag}
</Response>`;
}

export function basicAuthHeader(accountSid: string, authToken: string) {
    const creds = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    return `Basic ${creds}`;
}

export function escapeXml(input: string) {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
