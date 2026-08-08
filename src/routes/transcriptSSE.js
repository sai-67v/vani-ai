const express = require("express");
const { addClient, removeClient } = require("../lib/sseClients");

const router = express.Router();

// GET /api/transcript/stream?callSid=xxx
router.get("/stream", (req, res) => {
    const { callSid } = req.query;

    if (!callSid) {
        return res.status(400).send("Missing callSid");
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // Flush headers to establish connection immediately
    res.flushHeaders?.();

    // Send an initial ping so the client knows it's connected
    res.write(":\n\n");

    // Register this response connection
    addClient(callSid, res);

    // Keep connection alive with periodic pings (Heroku/proxies might close idle connections)
    const keepAlive = setInterval(() => {
        try {
            res.write(":\n\n");
        } catch (e) {
            clearInterval(keepAlive);
        }
    }, 15000);

    // Cleanup on client disconnect
    req.on("close", () => {
        clearInterval(keepAlive);
        removeClient(callSid, res);
    });
});

module.exports = router;
