const express = require("express");
const { db } = require("../lib/supabase/admin");
const { analyzeTranscript } = require("../lib/sarvam/llm");

const router = express.Router();
const MAX_ANALYSIS_LENGTH = 6000;

router.post("/", async (req, res) => {
    if (!db) {
        return res.status(500).json({ ok: false, error: "Supabase configuration missing" });
    }

    const callId = req.body.callId;
    if (!callId) {
        return res.status(400).json({ ok: false, error: "Missing callId" });
    }

    try {
        const { data: callRecord } = await db
            .from("calls")
            .select("summary")
            .eq("id", callId)
            .maybeSingle();

        const { data: transcripts, error: transcriptError } = await db
            .from("transcripts")
            .select("speaker, text")
            .eq("call_id", callId)
            .order("ts", { ascending: true })
            .limit(100);

        if (transcriptError) {
            console.error("[call_insights] transcript fetch failed", transcriptError);
        }

        const fallbackText = "Call transcript not available yet. Run again later.";
        const transcriptText = (transcripts ?? [])
            .map((segment) => `${segment.speaker === "assistant" ? "Agent" : "Caller"}: ${segment.text}`)
            .join("\n");
        const rawText = callRecord?.summary || transcriptText || fallbackText;
        const analysisText = rawText.slice(0, MAX_ANALYSIS_LENGTH);

        const insight = await analyzeTranscript(analysisText);

        const upsertRow = {
            call_id: callId,
            reply_text: insight.replyText || null,
            lead_score: insight.leadScore,
            emotion: insight.emotion || null,
            intent: insight.intent || null,
            next_best_action: insight.nextBestAction || null,
            summary: insight.summary || callRecord?.summary || null,
            is_final: true,
        };

        const { error: insightError } = await db
            .from("call_insights")
            .upsert(upsertRow, { onConflict: "call_id" });

        if (insightError) {
            console.error("[call_insights] upsert failed", insightError);
            return res.status(500).json({ ok: false, error: "Failed to save insights" });
        }

        const { data: savedInsight, error: savedError } = await db
            .from("call_insights")
            .select("*")
            .eq("call_id", callId)
            .maybeSingle();

        if (savedError) {
            console.error("[call_insights] fetch after upsert failed", savedError);
            return res.status(500).json({ ok: false, error: "Insight fetch failed" });
        }

        return res.json({ ok: true, insight: savedInsight });
    } catch (err) {
        console.error("[call_insights] Error processing insights", err);
        return res.status(500).json({ ok: false, error: "Internal server error" });
    }
});

module.exports = router;
