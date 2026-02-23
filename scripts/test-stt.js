require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { transcribeAudio } = require("../src/lib/sarvam/stt");

async function run() {
    console.log("Looking for an audio file to test Sarvam STT...");

    const audioPath = process.argv[2];
    if (!audioPath) {
        console.error("Usage: node scripts/test-stt.js <path-to-audio-file>");

        // Help the user by checking if a dummy sample audio exists
        const dummyPath = path.resolve(__dirname, "sample.wav");
        if (fs.existsSync(dummyPath)) {
            console.log(`Found a sample.wav in scripts directly. Using ${dummyPath}`);
            return processFile(dummyPath);
        }

        process.exit(1);
    }

    const fullPath = path.resolve(audioPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        process.exit(1);
    }

    await processFile(fullPath);
}

async function processFile(filePath) {
    console.log(`Reading audio from ${filePath}...`);
    const buffer = fs.readFileSync(filePath);

    console.log("Sending to Sarvam Speech-to-Text API...");
    try {
        const result = await transcribeAudio(buffer, "hi-IN");
        console.log("=== TRANSCRIPT RESULT ===");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("An error occurred trying to parse audio:", err);
    }
}

run();
