// SSE Client Registry
// callSid -> Set of response objects

const clientsByCall = new Map();

function addClient(callSid, res) {
    if (!clientsByCall.has(callSid)) {
        clientsByCall.set(callSid, new Set());
    }
    clientsByCall.get(callSid).add(res);
    console.log(`[SSE] Client connected for call ${callSid}. Total listeners: ${clientsByCall.get(callSid).size}`);
}

function removeClient(callSid, res) {
    const clients = clientsByCall.get(callSid);
    if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
            clientsByCall.delete(callSid);
        }
        console.log(`[SSE] Client disconnected for call ${callSid}. Remaining: ${clients?.size || 0}`);
    }
}

function pushTranscript(callSid, data) {
    const clients = clientsByCall.get(callSid);
    if (clients && clients.size > 0) {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        for (const res of clients) {
            try {
                res.write(payload);
            } catch (err) {
                console.error("[SSE] Failed to write to client", err);
                removeClient(callSid, res);
            }
        }
    }
}

module.exports = {
    addClient,
    removeClient,
    pushTranscript
};
