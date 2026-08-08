const WebSocket = require('ws');
const { supabase } = require('../supabase'); // Ensure we can log to Supabase
const { handleStreamAudio, flushStreamAudio } = require('./realtimeSTT');
const { pushTranscript } = require('../sseClients');


/**
 * Sets up the WebSocket server on the Express HTTP server
 * to handle Twilio Media Streams -> Sarvam bridging.
 */
function setupTwilioWebSockets(server) {
    const wss = new WebSocket.Server({ server, path: "/stream" });

    wss.on("connection", (ws, req) => {
        console.log("[Twilio WS] New Media Stream connection established.");

        let streamSid = null;
        let callSid = null;
        let sarvamWs = null;

        const sarvamApiKey = process.env.SARVAM_API_KEY;
        const sarvamAgentId = process.env.SARVAM_AGENT_ID;

        // Establish the downstream connection to Sarvam's Conversational Agent
        if (sarvamApiKey && sarvamAgentId) {
            const sarvamUrl = `wss://api.sarvam.ai/agents/${sarvamAgentId}/stream`; // Example URL
            console.log(`[Sarvam WS] Connecting downstream to ${sarvamUrl}`);

            try {
                sarvamWs = new WebSocket(sarvamUrl, {
                    headers: { "api-subscription-key": sarvamApiKey }
                });

                sarvamWs.on("open", () => {
                    console.log("[Sarvam WS] Connected successfully.");
                });

                sarvamWs.on("message", (data) => {
                    // When Sarvam's agent responds with audio, we forward it to Twilio
                    try {
                        const msg = JSON.parse(data.toString());

                        // Assuming Sarvam sends { type: "audio", payload: "base64..." }
                        if (msg.type === "audio" && msg.payload && streamSid) {
                            ws.send(JSON.stringify({
                                event: "media",
                                streamSid: streamSid,
                                media: { payload: msg.payload }
                            }));
                        }
                        // If Sarvam sends transcripts
                        else if (msg.type === "transcript" && msg.text && callSid) {
                            console.log(`[Sarvam Transcript] ${msg.role}: ${msg.text}`);
                            const ts = new Date().toISOString();
                            // Push to dashboard
                            pushTranscript(callSid, { speaker: msg.role || "assistant", text: msg.text, ts });
                            // Log to Supabase async, fire & forget
                            logTranscript(callSid, msg.role || "assistant", msg.text, ts);
                        }
                    } catch (e) {
                        // Could be binary data or parse error
                    }
                });

                sarvamWs.on("error", (err) => console.error("[Sarvam WS] Error:", err.message));
                sarvamWs.on("close", () => console.log("[Sarvam WS] Connection closed."));

            } catch (err) {
                console.error("[Sarvam WS] Failed to initialize:", err);
            }
        } else {
            console.warn("⚠️ [Sarvam WS] Missing SARVAM_API_KEY or SARVAM_AGENT_ID, bypassing downstream connection.");
        }

        // Handle incoming messages from Twilio Media Streams
        ws.on("message", (message) => {
            const msg = JSON.parse(message);

            switch (msg.event) {
                case "connected":
                    console.log("[Twilio WS] Media Stream connected.", msg);
                    break;
                case "start":
                    streamSid = msg.start.streamSid;
                    callSid = msg.start.callSid;
                    console.log(`[Twilio WS] Stream started: ${streamSid}, CallSid: ${callSid}`);
                    // Ensure the call exists in Supabase
                    initCallLog(callSid);
                    break;
                case "media":
                    // Send to our micro-batch STT
                    handleStreamAudio(callSid, msg.media.payload);

                    // Forward Twilio raw audio chunk to Sarvam
                    if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
                        // We wrap it in whatever JSON Sarvam expects
                        sarvamWs.send(JSON.stringify({
                            type: "audio",
                            payload: msg.media.payload
                        }));
                    }
                    break;
                case "stop":
                    console.log("[Twilio WS] Stream stopped.");
                    flushStreamAudio(callSid);
                    if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
                        sarvamWs.close();
                    }
                    // Finalize the call in Supabase
                    finalizeCall(callSid);
                    break;
            }
        });

        ws.on("close", () => {
            console.log("[Twilio WS] Connection closed.");
            if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
                sarvamWs.close();
            }
        });
    });
}

// ---- Supabase Loggers ----

async function initCallLog(providerCallId) {
    if (!providerCallId) return;
    const { error } = await supabase.from("calls").upsert(
        { provider_call_id: providerCallId, status: "in-progress", started_at: new Date().toISOString() },
        { onConflict: "provider_call_id" }
    );
    if (error) console.error("[supabase] initCallLog error:", error);
}

async function finalizeCall(providerCallId) {
    if (!providerCallId) return;
    const { error } = await supabase.from("calls").update(
        { status: "ended", ended_at: new Date().toISOString() }
    ).eq("provider_call_id", providerCallId);
    if (error) console.error("[supabase] finalizeCall error:", error);
}

async function logTranscript(providerCallId, role, text, ts) {
    if (!providerCallId || !text) return;
    const { data: callRow } = await supabase.from("calls").select("id").eq("provider_call_id", providerCallId).maybeSingle();

    if (callRow?.id) {
        await supabase.from("transcripts").insert({
            call_id: callRow.id,
            speaker: role,
            text,
            ts: ts || new Date().toISOString()
        });
    }
}

module.exports = { setupTwilioWebSockets };
