async function checkRoutes() {
    console.log("1. Checking /api/calls...");
    try {
        const callsRes = await fetch("http://localhost:3000/api/calls");
        const calls = await callsRes.json();
        console.log("   Calls array exists:", Array.isArray(calls.data), "| Length:", calls.data?.length);
    } catch (e) {
        console.log("   Failed:", e.message);
    }

    console.log("\n2. Checking /api/twilio/token...");
    try {
        const tokenRes = await fetch("http://localhost:3000/api/twilio/token?identity=demo");
        const tokenData = await tokenRes.json();
        console.log("   Response has token or handled error:", Object.keys(tokenData));
    } catch (e) {
        console.log("   Failed:", e.message);
    }
}
checkRoutes();
