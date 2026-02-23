const { SarvamAIClient } = require("sarvamai");

async function runTTS() {
    console.log("Initializing Sarvam AI Client for TTS...");
    const client = new SarvamAIClient({
        apiSubscriptionKey: "sk_ih5v9h4j_IsApxBmc2SP0hWd6rQ0UAEbk"
    });

    try {
        console.log("Sending TTS Request...");
        const response = await client.textToSpeech.convert({
            text: `வணக்கம்! Sarvam AI-க்கு உங்களை வரவேற்கிறோம்।

நாங்கள் இந்திய மொழிகளுக்கான advanced voice technology உருவாக்குகிறோம். எங்கள் text-to-speech models natural-ஆகவும் மனிதர்களைப் போலவும் voice produce செய்கின்றன, இது மிகவும் realistic-ஆக ஒலிக்கிறது.

நீங்கள் உங்கள் text type செய்யலாம் அல்லது different voices try செய்ய எந்த voice card-லும் play button-ஐ click செய்யலாம். வாங்க, உங்கள் மொழியில் AI-ன் சக்தியை experience செய்யுங்கள்!`,
            target_language_code: "ta-IN",
            speaker: "shubh",
            pace: 1.1,
            speech_sample_rate: 8000,
            enable_preprocessing: true,
            model: "bulbul:v3"
        });

        console.log("TTS Response Received successfully!");
        // The payload usually contains a base64 encoded audio string
        console.log("Response Keys:", Object.keys(response));

        if (response.audios && response.audios.length > 0) {
            console.log(`Audio chunk received: ${response.audios[0].substring(0, 50)}... [truncated]`);
        }

    } catch (error) {
        console.error("TTS Error:", error);
    }
}

runTTS();
