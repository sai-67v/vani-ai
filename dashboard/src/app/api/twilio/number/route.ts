import { NextResponse } from "next/server";

export async function GET() {
    const number = process.env.TWILIO_PHONE_NUMBER || "";
    return NextResponse.json(
        { number: number || null },
        { headers: { "Cache-Control": "no-store" } }
    );
}

export const runtime = "nodejs";
