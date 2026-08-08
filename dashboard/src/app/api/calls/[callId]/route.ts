import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DEMO_CALL = {
    callId: "demo-call-1",
    direction: "inbound",
    from: "+1234567890",
    to: "AI Agent",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadLabel: "WARM",
    language: "EN",
    emotions: ["neutral"],
    hasTranscript: true,
    summary: "This is a fallback demo call. The database is currently unavailable or empty.",
    analysis: {
        transcript: "User: Hello\nAgent: Hi, how can I help you? I am a fallback demo AI agent.",
        summary: "Demo summary because the database fetch failed.",
        successEvaluation: "Fallback data loaded."
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        // Handle Next.js 15 async params while keeping backwards compatibility
        const resolvedParams = await Promise.resolve(params);
        const callId = resolvedParams.callId;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const missing = [
            !supabaseUrl && "SUPABASE_URL",
            !supabaseKey && "SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY",
        ].filter(Boolean);

        if (missing.length) {
            return NextResponse.json({
                data: DEMO_CALL,
                fallback: true,
                error: "missing_env",
                missing
            }, { status: 200 });
        }

        const supabase = createClient(supabaseUrl!, supabaseKey!);

        const { data, error } = await supabase
            .from("call_insights")
            .select("*")
            .eq("call_id", callId)
            .single();

        if (error) {
            console.error("Supabase Call Insights [callId] Error:", JSON.stringify(error, null, 2));
            throw error; // Let the catch block handle the fallback
        }

        if (!data) {
            return NextResponse.json({
                data: DEMO_CALL,
                fallback: true,
                error: "not_found"
            }, { status: 200 });
        }

        const formattedData = {
            callId: data.call_id || data.id,
            direction: data.direction || "inbound",
            from: data.from_number || "Unknown",
            to: data.to_number || "AI Agent",
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            leadLabel: data.lead_score > 70 ? "HOT" : data.lead_score > 40 ? "WARM" : "COLD",
            language: data.language || "EN",
            emotions: Array.isArray(data.emotions) ? data.emotions : [],
            hasTranscript: !!data.transcript,
            summary: data.summary,
            analysis: {
                transcript: data.transcript || "No transcript available",
                summary: data.summary || "No summary available",
                successEvaluation: data.next_best_action || "N/A"
            }
        };

        return NextResponse.json({ data: formattedData });
    } catch (err) {
        console.error(JSON.stringify({
            level: "error",
            module: "api/calls/[callId]",
            message: "Failed to fetch call details",
            error: err instanceof Error ? err.message : String(err)
        }));

        return NextResponse.json({
            data: DEMO_CALL,
            fallback: true,
            error: "Internal Server Error"
        }, { status: 200 });
    }
}
