import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/server/supabaseServer";

export async function POST(request: Request) {
    const form = await request.formData();
    const callSid = (form.get("CallSid") as string) || "";
    const recordingUrl = (form.get("RecordingUrl") as string) || null;
    const duration = Number(form.get("CallDuration") || 0) || null;
    const status = (form.get("CallStatus") as string) || "completed";

    const supabase = getSupabaseServer();
    if (supabase && callSid) {
        try {
            await supabase
                .from("calls")
                .update({
                    status,
                    recording_url: recordingUrl,
                    duration_seconds: duration,
                    ended_at: new Date().toISOString(),
                })
                .eq("provider_call_id", callSid);
        } catch (err) {
            console.error("[twilio/status]", err);
        }
    }

    return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
