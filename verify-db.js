require('dotenv').config();
const { supabase } = require('./src/lib/supabase');

async function checkDatabase() {
    console.log("-----------------------------------------");
    console.log("🧪 Testing Supabase Database Connection");
    console.log("-----------------------------------------");

    try {
        // Test 1: Fetch from 'calls' table
        const { data: calls, error: callsError } = await supabase
            .from('calls')
            .select('id, provider_call_id, status, created_at')
            .limit(5);

        if (callsError) {
            console.error("❌ Error fetching from 'calls' table:", callsError.message);
        } else {
            console.log(`✅ Successfully connected to 'calls' table. Found ${calls.length} rows (limit 5).`);
            if (calls.length > 0) {
                console.log("Sample call record:", calls[0]);
            }
        }

        // Test 2: Fetch from 'transcripts' table
        const { data: transcripts, error: transcriptsError } = await supabase
            .from('transcripts')
            .select('id, call_id, speaker, text, created_at')
            .limit(1);

        if (transcriptsError) {
            console.error("❌ Error fetching from 'transcripts' table:", transcriptsError.message);
        } else {
            console.log(`✅ Successfully connected to 'transcripts' table. Found ${transcripts.length} rows.`);
        }

    } catch (error) {
        console.error("❌ Database connection test failed:", error);
    }
}

checkDatabase();
