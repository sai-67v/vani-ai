const { SarvamAIClient } = require("sarvamai");

/**
 * Converts text into speech using Sarvam TTS API.
 * @param {string} text - The text to synthesize
 * @param {string} language - Target language code (default "en-IN")
 * @returns {Promise<Buffer>} - Resolves to the raw audio buffer (WAV/PCM)
 */
async function textToSpeech(text, language = "en-IN") {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) throw new Error("SARVAM_API_KEY is not set in environment");

    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

    try {
        const response = await client.textToSpeech.convert({
            text: text,
            target_language_code: language,
            speaker: "shubh",
            pace: 1.1,
            speech_sample_rate: 8000,
            enable_preprocessing: true,
            model: "bulbul:v3"
        });

        if (response.audios && response.audios.length > 0) {
            // Sarvam returns an array of base64 audio strings
            return Buffer.from(response.audios[0], "base64");
        }

        throw new Error("No audio returned from Sarvam TTS");

    } catch (error) {
        console.error("[Sarvam TTS] Error:", error.message);
        throw error;
    }
}

module.exports = {
    textToSpeech
};
