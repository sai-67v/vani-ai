const { SarvamAIClient } = require("sarvamai");

async function runSTT() {
    console.log("Initializing Sarvam AI Client for STT Batch Job...");
    const client = new SarvamAIClient({
        apiSubscriptionKey: "sk_ih5v9h4j_IsApxBmc2SP0hWd6rQ0UAEbk"
    });

    try {
        console.log("Creating STT Batch Job...");
        // Create batch job — change mode as needed
        const job = await client.speechToTextJob.createJob({
            model: "saaras:v3",
            mode: "transcribe",
            languageCode: "unknown",
            withDiarization: true,
            numSpeakers: 2
        });

        console.log(`Job Created successfully: ${job.id}`);
        // NOTE: We do not have actual audio paths here, substituting with dummy placeholders.
        // It will likely throw an error because the files are missing.
        // To be functional, provide real files here.
        /*
        const audioPaths = ["path/to/audio1.mp3", "path/to/audio2.mp3"];
        await job.uploadFiles(audioPaths);
        await job.start();

        // Wait for completion
        await job.waitUntilComplete();

        // Check file-level results
        const fileResults = await job.getFileResults();

        console.log(`\nSuccessful: ${fileResults.successful.length}`);
        for (const f of fileResults.successful) {
            console.log(`  ✓ ${f.file_name}`);
        }

        console.log(`\nFailed: ${fileResults.failed.length}`);
        for (const f of fileResults.failed) {
            console.log(`  ✗ ${f.file_name}: ${f.error_message}`);
        }

        // Download outputs for successful files
        if (fileResults.successful.length > 0) {
            await job.downloadOutputs("./output");
            console.log(`\nDownloaded ${fileResults.successful.length} file(s) to: ./output`);
        }
        */
        console.log("Script ran successfully. Uncomment upload/process logic and provide real audio paths to test fully.");

    } catch (error) {
        console.error("STT Error:", error);
    }
}

runSTT();
