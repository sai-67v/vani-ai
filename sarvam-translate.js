const { SarvamAIClient } = require("sarvamai");

async function runTranslate() {
    console.log("Initializing Sarvam AI Client for Translate...");
    const client = new SarvamAIClient({
        apiSubscriptionKey: "sk_ih5v9h4j_IsApxBmc2SP0hWd6rQ0UAEbk"
    });

    try {
        console.log("Sending Translate Request...");
        const response = await client.text.translate({
            input: `Hey, talk like you normally do.

Kal office mein 3 meetings thi.
2 chai breaks.
1 deadline miss hui.
Aur haan — salary ₹45,000 credit ho gayi 😌

Write it in Hindi, English, Tamil, Telugu — or mix it freely.
See how:
"₹45,000"
becomes
"४५,००० रुपये"

Choose your tone (Formal, Modern Colloquial, Classical Colloquial, Code Mixed),
pick numerals (Native or International),
and adjust speaker gender where it fits.

Sarvam understands real Indian language.
Not clean. Not perfect. Just real.

Go ahead.
Type it how you'd say it.`,
            source_language_code: "en-IN",
            target_language_code: "ml-IN",
            speaker_gender: "Female",
            mode: "modern-colloquial",
            model: "mayura:v1",
            enable_preprocessing: true,
            numerals_format: "native"
        });

        console.log("Translate Response Received successfully!");
        console.log("-----------------------------------------");
        console.log("Response output:");
        console.log(response);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("Translate Error:", error);
    }
}

runTranslate();
