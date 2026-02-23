const FormData = require("form-data");

/**
 * Transcribes audio using Sarvam POST speech-to-text API.
 * Uses native fetch with form-data since Node 18+ has fetch.
 * 
 * @param {Buffer} audioBuffer - Audio data as a Buffer
 * @param {string} [languageCode="hi-IN"] - Optional target language code
 * @returns {Promise<Object>} - Parsed JSON transcript result
 */
async function transcribeAudio(audioBuffer, languageCode = "hi-IN") {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        throw new Error("SARVAM_API_KEY is not set in environment");
    }

    try {
        const { SarvamAIClient } = require("sarvamai");
        const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

        // Node.js hack: The SDK expects a ReadableStream natively instead of raw Blob buffering from Mulaw frames. 
        // For raw Buffers arriving from Twilio memory, we can wrap them in a stream easily.
        const { Readable } = require('stream');
        const stream = Readable.from(audioBuffer);

        // Pass stream dynamically
        const response = await client.speechToText.transcribe({
            file: stream
        });

        // Ensure backward compatibility signature for existing app components waiting on the raw data returns
        return {
            text: response.transcript || "No transcript returned by SDK",
            raw: response
        };

    } catch (error) {
        console.error("[Sarvam STT] Error utilizing SDK:", error.message);
        throw error;
    }
}

module.exports = {
    transcribeAudio
};
