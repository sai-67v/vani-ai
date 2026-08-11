/**
 * src/routes/sarvamProvider.js
 *
 * Sarvam custom-provider server for Vapi.
 * Implements three Vapi custom-provider endpoints:
 *
 *   WS  /api/custom-transcriber  — Sarvam Saaras v3 streaming STT bridge
 *   POST /api/synthesize          — Sarvam Bulbul TTS → raw PCM audio
 *   POST /api/chat/completions    — Sarvam LLM proxy (OpenAI-compatible)
 *
 * WebSocket upgrade is handled via the HTTP server's `upgrade` event,
 * NOT through express routing (express doesn't handle WebSocket upgrades).
 * Register the upgrade handler in src/index.js.
 */

"use strict";

const express = require("express");
const WebSocket = require("ws");
const https = require("https");
const logger = require("../lib/logger");

const router = express.Router();

// ── Constants ────────────────────────────────────────────────
const SARVAM_STT_WS_URL =
  "wss://api.sarvam.ai/speech-to-text-translate/streaming";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
const SARVAM_LLM_URL = "https://api.sarvam.ai/v1/chat/completions";

/** System prompt injected into every LLM request for live-call language fidelity */
const LANGUAGE_FIDELITY_PROMPT =
  "Always respond in the same language the caller is currently speaking, " +
  "matching their register including common colloquial phrasing, and switch " +
  "immediately if they switch languages.";

// WAV header is always 44 bytes for standard PCM WAV files
const WAV_HEADER_BYTES = 44;

// ── B. POST /api/synthesize — Sarvam Bulbul TTS → raw PCM ───
/**
 * Accepts: { text: string, language: string }
 * Returns: raw 16-bit PCM audio at 8000 Hz, mono
 *          Content-Type: application/octet-stream
 */
router.post("/synthesize", async (req, res) => {
  const { text, language } = req.body || {};

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      error: true,
      message: "Request body must include a non-empty `text` field.",
      code: "VALIDATION_ERROR",
    });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    logger.error("sarvam.synthesize", "SARVAM_API_KEY is not configured");
    return res.status(503).json({
      error: true,
      message: "TTS service is not configured.",
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const targetLanguage = language || "hi-IN";

  try {
    logger.info("sarvam.synthesize", "Requesting TTS from Sarvam", {
      language: targetLanguage,
      textLength: text.length,
    });

    const ttsBody = JSON.stringify({
      inputs: [text],
      target_language_code: targetLanguage,
      speaker: "meera",
      model: "bulbul:v1",
      speech_sample_rate: 8000,
      enable_preprocessing: true,
    });

    const ttsResponse = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: ttsBody,
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text().catch(() => "");
      logger.error("sarvam.synthesize", "Sarvam TTS API error", {
        status: ttsResponse.status,
        body: errText.slice(0, 500),
      });
      return res.status(502).json({
        error: true,
        message: `Sarvam TTS returned ${ttsResponse.status}`,
        code: "UPSTREAM_ERROR",
      });
    }

    const ttsJson = await ttsResponse.json();

    // Sarvam returns { audios: ["<base64-encoded-WAV>", ...] }
    const base64Wav = ttsJson?.audios?.[0];
    if (!base64Wav) {
      logger.error("sarvam.synthesize", "No audio in Sarvam TTS response", {
        keys: Object.keys(ttsJson || {}),
      });
      return res.status(502).json({
        error: true,
        message: "Sarvam TTS returned no audio data.",
        code: "UPSTREAM_EMPTY",
      });
    }

    // Decode base64 WAV, strip 44-byte WAV header → raw 16-bit PCM
    const wavBuffer = Buffer.from(base64Wav, "base64");
    const pcmBuffer = wavBuffer.slice(WAV_HEADER_BYTES);

    logger.info("sarvam.synthesize", "TTS complete", {
      wavBytes: wavBuffer.length,
      pcmBytes: pcmBuffer.length,
    });

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Length": pcmBuffer.length,
    });
    return res.end(pcmBuffer);
  } catch (err) {
    logger.error("sarvam.synthesize", "Unhandled error in synthesize", {
      error: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({
      error: true,
      message: "Internal error during speech synthesis.",
      code: "INTERNAL_ERROR",
    });
  }
});

// ── C. POST /api/chat/completions — Sarvam LLM proxy ────────
/**
 * Accepts: OpenAI chat completions request format
 * Returns: OpenAI chat completions response (or SSE stream if stream: true)
 *
 * Always injects/overrides:
 *  - model: "sarvam-m"
 *  - prepends language-fidelity system message
 *  - reasoning_effort: null (disable Sarvam thinking mode)
 */
router.post("/chat/completions", async (req, res) => {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    logger.error("sarvam.llm", "SARVAM_API_KEY is not configured");
    return res.status(503).json({
      error: true,
      message: "LLM service is not configured.",
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const incomingBody = req.body || {};
  const isStreaming = incomingBody.stream === true;

  // ── Inject language-fidelity system message ────────────────
  const incomingMessages = Array.isArray(incomingBody.messages)
    ? incomingBody.messages
    : [];

  let messages;
  const existingSystemIdx = incomingMessages.findIndex(
    (m) => m.role === "system"
  );

  if (existingSystemIdx !== -1) {
    // Merge with existing system message — prepend our prompt
    messages = [...incomingMessages];
    messages[existingSystemIdx] = {
      ...messages[existingSystemIdx],
      content:
        LANGUAGE_FIDELITY_PROMPT +
        "\n\n" +
        messages[existingSystemIdx].content,
    };
  } else {
    // No existing system message — prepend one
    messages = [
      { role: "system", content: LANGUAGE_FIDELITY_PROMPT },
      ...incomingMessages,
    ];
  }

  // ── Build upstream request body ────────────────────────────
  const upstreamBody = {
    ...incomingBody,         // preserve temperature, max_tokens, tools, etc.
    model: "sarvam-m",       // always override model
    reasoning_effort: null,  // disable thinking mode for live calls
    messages,
  };

  logger.info("sarvam.llm", "Proxying chat completion to Sarvam", {
    model: upstreamBody.model,
    messageCount: messages.length,
    stream: isStreaming,
  });

  try {
    const upstreamResponse = await fetch(SARVAM_LLM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text().catch(() => "");
      logger.error("sarvam.llm", "Sarvam LLM API error", {
        status: upstreamResponse.status,
        body: errText.slice(0, 500),
      });
      return res.status(upstreamResponse.status).json({
        error: true,
        message: `Sarvam LLM returned ${upstreamResponse.status}`,
        code: "UPSTREAM_ERROR",
      });
    }

    if (isStreaming) {
      // ── Stream SSE back to Vapi ──────────────────────────
      res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      // Pipe the upstream body directly to the response
      // Node 18+ ReadableStream → res pipe
      const reader = upstreamResponse.body?.getReader();
      if (!reader) {
        logger.error("sarvam.llm", "No readable body on streaming response");
        return res.end();
      }

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } catch (streamErr) {
          logger.error("sarvam.llm", "Stream pipe error", {
            error: streamErr?.message,
          });
        } finally {
          res.end();
        }
      };
      pump();
    } else {
      // ── Return JSON directly ─────────────────────────────
      const json = await upstreamResponse.json();
      return res.status(200).json(json);
    }
  } catch (err) {
    logger.error("sarvam.llm", "Unhandled error in LLM proxy", {
      error: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({
      error: true,
      message: "Internal error during LLM proxy.",
      code: "INTERNAL_ERROR",
    });
  }
});

// ── A. WebSocket /api/custom-transcriber — Sarvam Saaras STT bridge ──
/**
 * This handler is called directly from the HTTP server `upgrade` event
 * in src/index.js. It is NOT an Express route (WebSocket upgrades bypass
 * Express middleware).
 *
 * Protocol:
 *   Vapi → us: binary audio chunks (LINEAR16 PCM, 8 kHz, mono)
 *   us → Sarvam: binary audio (forwarded verbatim after init message)
 *   Sarvam → us: JSON transcript events
 *   us → Vapi: { type: "transcript", transcript, isFinal, language }
 */
function handleTranscriberUpgrade(ws, req) {
  const apiKey = process.env.SARVAM_API_KEY;
  const connId = req.headers["x-request-id"] || Date.now().toString(36);

  logger.info("sarvam.transcriber", "Vapi transcriber connection opened", {
    connId,
    ip: req.socket?.remoteAddress,
  });

  if (!apiKey) {
    logger.error(
      "sarvam.transcriber",
      "SARVAM_API_KEY not configured — closing Vapi WS",
      { connId }
    );
    ws.close(1011, "Server not configured");
    return;
  }

  // ── Open downstream connection to Sarvam Saaras STT ─────
  let sarvamWs = null;
  let sarvamReady = false;
  /** Queue of audio chunks that arrived before Sarvam WS opened */
  const pendingChunks = [];

  try {
    sarvamWs = new WebSocket(SARVAM_STT_WS_URL, {
      headers: { "api-subscription-key": apiKey },
    });
  } catch (initErr) {
    logger.error(
      "sarvam.transcriber",
      "Failed to create Sarvam WS connection",
      { connId, error: initErr?.message }
    );
    ws.close(1011, "Upstream connection failed");
    return;
  }

  // ── Sarvam WS lifecycle ──────────────────────────────────
  sarvamWs.on("open", () => {
    logger.info("sarvam.transcriber", "Sarvam STT WS opened", { connId });

    // Send init config message expected by Sarvam Saaras streaming API
    const initMsg = JSON.stringify({
      language_code: "unknown",   // auto-detect language
      sample_rate: 8000,
      encoding: "LINEAR16",
    });
    sarvamWs.send(initMsg);
    sarvamReady = true;

    // Flush any audio chunks that arrived before we were ready
    if (pendingChunks.length > 0) {
      logger.debug("sarvam.transcriber", "Flushing pending audio chunks", {
        connId,
        chunks: pendingChunks.length,
      });
      for (const chunk of pendingChunks) {
        if (sarvamWs.readyState === WebSocket.OPEN) {
          sarvamWs.send(chunk);
        }
      }
      pendingChunks.length = 0;
    }
  });

  sarvamWs.on("message", (data) => {
    // Sarvam sends JSON transcript events
    let parsed;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      // Ignore non-JSON frames (e.g., binary pings)
      return;
    }

    // Map Sarvam transcript event → Vapi custom-transcriber format
    // Sarvam fields (best-effort, may vary by API version):
    //   { transcript, is_final, language_code, ... }
    const transcript =
      parsed.transcript ??
      parsed.text ??
      parsed.display_text ??
      "";

    const isFinal =
      parsed.is_final ??
      parsed.isFinal ??
      false;

    const language =
      parsed.language_code ??
      parsed.language ??
      "unknown";

    if (!transcript) return; // skip empty events

    logger.debug("sarvam.transcriber", "Transcript received", {
      connId,
      isFinal,
      language,
      snippet: transcript.slice(0, 80),
    });

    // Forward to Vapi if still connected
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "transcript",
          transcript,
          isFinal,
          language,
        })
      );
    }
  });

  sarvamWs.on("error", (err) => {
    logger.error("sarvam.transcriber", "Sarvam STT WS error", {
      connId,
      error: err?.message,
    });
    // Attempt to inform Vapi before closing
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1011, "Upstream STT error");
    }
  });

  sarvamWs.on("close", (code, reason) => {
    logger.info("sarvam.transcriber", "Sarvam STT WS closed", {
      connId,
      code,
      reason: reason?.toString(),
    });
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, "Upstream closed");
    }
  });

  // ── Vapi WS lifecycle ────────────────────────────────────
  ws.on("message", (data, isBinary) => {
    // Vapi sends raw binary PCM audio frames
    if (!isBinary && typeof data === "string") {
      // May be a JSON control message from Vapi — log and ignore
      try {
        const ctrl = JSON.parse(data);
        logger.debug("sarvam.transcriber", "Control message from Vapi", {
          connId,
          type: ctrl?.type,
        });
      } catch {
        // not JSON
      }
      return;
    }

    if (sarvamReady && sarvamWs.readyState === WebSocket.OPEN) {
      sarvamWs.send(data);
    } else {
      // Buffer until Sarvam is ready (bounded to ~5s of audio at 8kHz/16-bit)
      if (pendingChunks.length < 1000) {
        pendingChunks.push(data);
      }
    }
  });

  ws.on("close", (code, reason) => {
    logger.info("sarvam.transcriber", "Vapi transcriber WS closed", {
      connId,
      code,
      reason: reason?.toString(),
    });
    // Clean up Sarvam connection
    if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
      sarvamWs.close(1000, "Client disconnected");
    }
  });

  ws.on("error", (err) => {
    logger.error("sarvam.transcriber", "Vapi WS error", {
      connId,
      error: err?.message,
    });
    if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
      sarvamWs.close(1011, "Client error");
    }
  });
}

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  /** Express router — mount with app.use() for HTTP endpoints */
  router,
  /** WebSocket upgrade handler — wire to server.on("upgrade", ...) in index.js */
  handleTranscriberUpgrade,
  /** Path Vapi connects to for custom transcriber WebSocket */
  TRANSCRIBER_PATH: "/api/custom-transcriber",
};
