require("dotenv").config();
const WebSocket = require("ws");

async function checkSarvamConnection() {
    const apiKey = process.env.SARVAM_API_KEY;
    const agentId = process.env.SARVAM_AGENT_ID || "test_agent_id"; // If user hasn't provided one yet

    if (!apiKey) {
        console.error("❌ SARVAM_API_KEY is missing in .env");
        return;
    }

    console.log("-----------------------------------------");
    console.log("🧪 Testing Sarvam WebSocket Connection");
    console.log("API Key:", apiKey.substring(0, 8) + "...");
    console.log("Endpoint: Speech-to-Text (STT)");
    console.log("-----------------------------------------");

    // Documentation states this is the raw STT websocket endpoint
    const wssUrl = `wss://api.sarvam.ai/speech-to-text-translate/ws`;
    console.log(`Connecting to: ${wssUrl}\n`);

    try {
        const ws = new WebSocket(wssUrl, {
            headers: {
                "api-subscription-key": apiKey
            }
        });

        ws.on("open", () => {
            console.log("✅ [WebSocket] Connection OPENED successfully.");
            console.log("   Sarvam LLM/STT/TTS API is responsive!");

            // Give it a second to see if Sarvam immediately sends an auth challenge or greeting
            setTimeout(() => {
                console.log("   Closing connection normally.");
                ws.close();
            }, 2000);
        });

        ws.on("message", (data) => {
            console.log("📥 [WebSocket] Message from Sarvam:", data.toString());
        });

        ws.on("close", (code, reason) => {
            console.log(`\n🚪 [WebSocket] Connection CLOSED. Code: ${code}, Reason: ${reason.toString() || "None"}`);
            console.log("If Code is 1000, it safely disconnected. If 1006 or 400x, verify Agent ID is valid.");
        });

        ws.on("error", (error) => {
            console.error("❌ [WebSocket] Connection ERROR:");
            console.error(error);
        });

    } catch (e) {
        console.error("Failed to initialize WebSocket:", e.message);
    }
}

checkSarvamConnection();
