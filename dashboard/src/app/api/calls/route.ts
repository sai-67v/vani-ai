import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const missing = [
            !supabaseUrl && "SUPABASE_URL",
            !supabaseKey && "SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY",
        ].filter(Boolean);

        if (missing.length) {
            return NextResponse.json({
                data: [],
                fallback: true,
                error: "missing_env",
                missing
            }, { status: 200 }); // Changed from 500 to 200 so frontend doesn't throw res.ok
        }

        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // Fetch recent calls
        const { data, error } = await supabase
            .from("call_insights")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Supabase Call Insights Error:", JSON.stringify(error, null, 2));
            throw error;
        }

        // Map data to match frontend CallListItem format
        const formattedData = (data || []).map((row: any) => ({
            callId: row.call_id || row.id,
            direction: row.direction || "inbound",
            from: row.from_number || "Unknown",
            to: row.to_number || "AI Agent",
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            leadLabel: row.lead_score > 70 ? "HOT" : row.lead_score > 40 ? "WARM" : "COLD",
            language: row.language || "EN",
            emotions: Array.isArray(row.emotions) ? row.emotions : [],
            hasTranscript: !!row.transcript,
            summary: row.summary,
        }));

        return NextResponse.json({ data: formattedData });
    } catch (err) {
        console.error(JSON.stringify({
            level: "error",
            module: "api/calls",
            message: "Failed to fetch calls",
            error: err instanceof Error ? err.message : String(err)
        }));

        return NextResponse.json({
            data: [],
            fallback: true,
            error: "Internal Server Error"
        }, { status: 200 }); // Changed from 500 to 200 so frontend handles fallback
    }
}
