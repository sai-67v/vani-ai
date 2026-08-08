fetch("http://localhost:3000/api/twilio/voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CallSid: "sync-test-456", From: "+123", To: "+456" })
}).then(r => r.text()).then(console.log).catch(console.error);
